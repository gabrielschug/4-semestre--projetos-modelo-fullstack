import { PedidoRepository } from "../repositories/PedidoRepository";

export class PedidoService {
  constructor(private readonly pedidoRepository: PedidoRepository) {}

  async listarPedidos() {
    return await this.pedidoRepository.listarPedidos();
  }
}