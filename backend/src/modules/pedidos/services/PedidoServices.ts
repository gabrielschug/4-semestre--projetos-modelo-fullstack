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

export class PedidoService {
  constructor(private readonly pedidoRepository: PedidoRepository) {}

  async listarPedidos() {
    return await this.pedidoRepository.listarPedidos();
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
