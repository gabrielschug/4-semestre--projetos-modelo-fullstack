import { ProdutoRepository } from "../repositories/ProdutoRepository";

export class ProdutoService {
  private produtoRepository: ProdutoRepository;

  constructor() {
    this.produtoRepository = new ProdutoRepository();
  }

  async obterCardapio() {
    return await this.produtoRepository.listarProdutosDisponiveis();
  }
}