import { PedidoRepository } from "../repositories/PedidoRepository";
import { CriarPedidoDTO } from "../types/PedidosType";

export class PedidoService {
  constructor(private readonly pedidoRepository: PedidoRepository) {}

  async listarPedidos() {
    return await this.pedidoRepository.listarPedidos();
  }

  async contarPedidosPorStatus() {
    return await this.pedidoRepository.contarPedidosPorStatus();
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
