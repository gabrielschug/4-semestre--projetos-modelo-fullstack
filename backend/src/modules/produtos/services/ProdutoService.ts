import { ProdutoRepository } from "../repositories/ProdutoRepository";

export class ProdutoService {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async listarProdutosDisponiveis() {
    return await this.produtoRepository.listarProdutosDisponiveis();
  }

  async pesquisar(termo: string) {
    const termoNumero = Number(termo);
    if (isNaN(termoNumero)) {
      return await this.produtoRepository.pesquisarTexto(termo);
    } else {
      return await this.produtoRepository.pesquisaPrecoMaximo(termoNumero);
    }
  }

  async PesquisarProdutoPorId(id: string) {
    return await this.produtoRepository.PesquisarProdutoPorId(id);
  }
}
