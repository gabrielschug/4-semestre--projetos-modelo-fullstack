import { ItensPedidoRepository } from "../repositories/ItensPedidoRepository";

export class ItensPedidoService {
  constructor(private readonly itensPedidoRepository: ItensPedidoRepository) {}

  async listarMediasAvaliacoesPorProduto() {
    return this.itensPedidoRepository.listarMediasAvaliacoesPorProduto();
  }
}
