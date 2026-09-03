import { PedidosRepository } from "../repositories/PedidosRepository";

export class PedidoService {
  constructor(private readonly pedidoRepository:PedidosRepository) {}

  async createPedido(data: CriarPedidoInput) {
    
    const novoPedido = await this.pedidoRepository.criarPedidos(data)
    if(!novoPedido) {
      throw new Error("Erro ao criar plano")
    }
    return {
      message: "Pedido criado",
      pedidoID: novoPedido.id
    }
  }

  async obterPedidos() {
    return this.pedidoRepository.listarPedidos();
  }
}