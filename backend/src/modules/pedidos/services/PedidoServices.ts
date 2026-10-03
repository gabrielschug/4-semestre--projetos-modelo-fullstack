import { PedidoRepository } from "../repositories/PedidoRepository";
import { CriarPedidoDTO } from "../types/PedidosType";

export class PedidoService {
  constructor(private readonly pedidoRepository: PedidoRepository) {}

  async listarPedidos() {
    return await this.pedidoRepository.listarPedidos();
  }

  async criarPedido(dados: CriarPedidoDTO) {
    const anotacoesItens = dados.pedido.itens
      .filter((item) => item.observacao)
      .map(
        (item) => `${item.quantidade}x ${item.nomeProduto}: ${item.observacao}`,
      )
      .join(" | ");
    const anotacaoFinal = dados.pedido.anotacaoGeral
      ? `${dados.pedido.anotacaoGeral} | Detalhes: ${anotacoesItens}`
      : `${anotacoesItens}`;

    const novoPedido = await this.pedidoRepository.criarPedidoComCliente(
      dados,
      anotacaoFinal,
    );
    return novoPedido;
  }
}
