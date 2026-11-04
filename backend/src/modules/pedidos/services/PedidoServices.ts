import { PedidoRepository } from "../repositories/PedidoRepository";
import { CriarPedidoDTO } from "../types/PedidosType";
import type { ModalEntrega, StatusPedido } from "@prisma/client";
import { PagamentoService } from "../../pagamentos/services/PagamentoService";

const mesmoValor = (a: number, b: number) => Math.abs(a - b) < 0.005;

function transicaoPermitida(
  statusAtual: StatusPedido,
  novoStatus: StatusPedido,
  modalEntrega: ModalEntrega,
): boolean {
  switch (statusAtual) {
    case "PENDENTE":
      return novoStatus === "PREPARANDO" || novoStatus === "CANCELADO";
    case "PREPARANDO":
      return (
        novoStatus === "PENDENTE" ||
        novoStatus === "PRONTO" ||
        novoStatus === "CANCELADO"
      );
    case "PRONTO":
      return (
        novoStatus === "PREPARANDO" ||
        (modalEntrega === "DELIVERY"
          ? novoStatus === "EM_ROTA"
          : novoStatus === "ENTREGUE")
      );
    case "EM_ROTA":
      return novoStatus === "PRONTO" || novoStatus === "ENTREGUE";
    case "ENTREGUE":
    case "CANCELADO":
      return false;
  }
}

function formatarDia(data: Date): string {
  return data.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
}

export class PedidoService {
  constructor(
    private readonly pedidoRepository: PedidoRepository,
    private readonly pagamentoService: PagamentoService,
  ) {}

  async listarPedidos() {
    return await this.pedidoRepository.listarPedidos();
  }

  async dadosDashboard() {
    const umDia = 86_400_000;
    const agora = Date.now();
    const dias = Array.from({ length: 30 }, (_, i) =>
      formatarDia(new Date(agora - (29 - i) * umDia)),
    );

    const [produtos, pedidos] = await Promise.all([
      this.pedidoRepository.somarItensVendidos(),
      this.pedidoRepository.listarDatasPedidosDesde(
        new Date(agora - 31 * umDia),
      ),
    ]);

    const maisPedidos = (prefixoCategoria: string) =>
      produtos
        .filter((produto) =>
          produto.categoria.toLowerCase().startsWith(prefixoCategoria),
        )
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 5)
        .map(({ descricao, quantidade }) => ({ descricao, quantidade }));

    const contagem = new Map(dias.map((dia) => [dia, 0]));
    for (const { dataHora } of pedidos) {
      const dia = formatarDia(dataHora);
      if (contagem.has(dia)) {
        contagem.set(dia, contagem.get(dia)! + 1);
      }
    }

    return {
      refeicoes: maisPedidos("refei"),
      bebidas: maisPedidos("bebida"),
      pedidosPorDia: dias.map((dia) => ({
        dia,
        quantidade: contagem.get(dia)!,
      })),
    };
  }

  async contarPedidosPorStatus() {
    return await this.pedidoRepository.contarPedidosPorStatus();
  }

  async atualizarStatusPedido(id: number, novoStatus: StatusPedido) {
    const pedido = await this.pedidoRepository.buscarStatusPedido(id);
    if (!pedido) {
      return { resultado: "NAO_ENCONTRADO" as const };
    }
    if (
      !transicaoPermitida(pedido.status, novoStatus, pedido.modalEntrega)
    ) {
      return { resultado: "TRANSICAO_INVALIDA" as const };
    }

    const atualizado = await this.pedidoRepository.atualizarStatusPedido(
      id,
      pedido.status,
      novoStatus,
    );
    if (!atualizado) {
      return { resultado: "CONFLITO" as const };
    }
    return { resultado: "ATUALIZADO" as const };
  }

  async listarPedidosDoCliente(clienteID: string) {
    return await this.pedidoRepository.listarPedidosDoCliente(clienteID);
  }

  async cancelarPedido(clienteID: string, pedidoID: number) {
    return await this.pedidoRepository.cancelarPedido(clienteID, pedidoID);
  }

  async avaliarItemPedido(
    clienteID: string,
    pedidoID: number,
    itemID: number,
    avaliacao: number,
  ) {
    return await this.pedidoRepository.avaliarItemPedido(
      clienteID,
      pedidoID,
      itemID,
      avaliacao,
    );
  }

  async criarPedido(dados: CriarPedidoDTO) {
    const pagamentoOnline = dados.pedido.pagamento === "ONLINE";
    if (pagamentoOnline) {
      if (!this.pagamentoService.disponivel) {
        throw new Error("Pagamento online indisponível no momento.");
      }
      await this.conferirValoresPedido(dados);
    }

    const anotacoesItens = dados.pedido.itens
      .filter((item) => item.observacao?.trim())
      .map(
        (item) =>
          `${item.quantidade}x ${item.nomeProduto}: ${item.observacao?.trim()}`,
      )
      .join(" | ");
    const anotacoes = [
      dados.pedido.anotacaoGeral?.trim() &&
        `Geral: ${dados.pedido.anotacaoGeral.trim()}`,
      anotacoesItens && `Detalhes: ${anotacoesItens}`,
    ].filter((anotacao): anotacao is string => Boolean(anotacao));
    const anotacaoFinal = anotacoes.join(" | ");

    const novoPedido = await this.pedidoRepository.criarPedidoComCliente(
      dados,
      anotacaoFinal,
    );
    if (!pagamentoOnline) {
      return { pedido: novoPedido, clientSecret: null };
    }

    try {
      const clientSecret = await this.pagamentoService.criarIntencaoPagamento(
        novoPedido.id,
        novoPedido.valorTotal,
      );
      return { pedido: novoPedido, clientSecret };
    } catch (error) {
      console.error("Erro ao criar pagamento no Stripe:", error);
      await this.pedidoRepository.atualizarStatusPedido(
        novoPedido.id,
        "PENDENTE",
        "CANCELADO",
      );
      throw new Error(
        "Não foi possível iniciar o pagamento online. Tente novamente.",
      );
    }
  }

  // No pagamento online o valor cobrado no cartão precisa bater com os
  // preços do banco, e não só com o que o navegador enviou
  private async conferirValoresPedido(dados: CriarPedidoDTO) {
    const { itens, modalEntrega, nomeBairroEntrega, valorTaxaEntrega } =
      dados.pedido;
    const precos = await this.pedidoRepository.buscarPrecosAtuais(
      itens.map((item) => item.produtoID),
      modalEntrega === "DELIVERY" ? nomeBairroEntrega : undefined,
    );
    const valoresDesatualizados = new Error(
      "Os valores do carrinho mudaram. Revise o pedido e tente novamente.",
    );

    let totalEsperado = 0;
    for (const item of itens) {
      const produto = precos.produtos.find((p) => p.id === item.produtoID);
      if (!produto || !produto.disponibilidade) {
        throw new Error(`${item.nomeProduto} não está mais disponível.`);
      }
      const precoAtual = produto.precoBase - (produto.valorDesconto ?? 0);
      if (!mesmoValor(precoAtual, item.precoProduto)) {
        throw valoresDesatualizados;
      }
      totalEsperado += precoAtual * item.quantidade;
    }

    if (modalEntrega === "DELIVERY") {
      if (precos.taxaEntrega === null) {
        throw new Error("Bairro de entrega não cadastrado.");
      }
      if (!mesmoValor(precos.taxaEntrega, valorTaxaEntrega ?? 0)) {
        throw valoresDesatualizados;
      }
      totalEsperado += precos.taxaEntrega;
    }

    if (!mesmoValor(totalEsperado, dados.pedido.valorTotal)) {
      throw valoresDesatualizados;
    }
  }
}
