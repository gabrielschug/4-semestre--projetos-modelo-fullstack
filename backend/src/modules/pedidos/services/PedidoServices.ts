import { PedidoRepository } from "../repositories/PedidoRepository";
import { CriarPedidoDTO } from "../types/PedidosType";
import type { ModalEntrega, StatusPedido } from "@prisma/client";

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
  constructor(private readonly pedidoRepository: PedidoRepository) {}

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

  async atualizarStatusPedido(id: string, novoStatus: StatusPedido) {
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

  async cancelarPedido(clienteID: string, pedidoID: string) {
    return await this.pedidoRepository.cancelarPedido(clienteID, pedidoID);
  }

  async avaliarItemPedido(
    clienteID: string,
    pedidoID: string,
    itemID: string,
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
    return novoPedido;
  }
}
