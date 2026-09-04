import { ProdutoRepository } from "../repositories/ProdutoRepository";

export class ProdutoService {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async listarProdutosDisponiveis() {
    return await this.produtoRepository.listarProdutosDisponiveis();
  }
}