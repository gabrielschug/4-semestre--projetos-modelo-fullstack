import { ProdutoRepository } from "../repositories/ProdutoRepository";
import type {
  AtualizarProdutoInput,
  CriarProdutoInput,
} from "../schemas/ProdutoSchema";

export class ProdutoService {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async listarProdutosDisponiveis() {
    return await this.produtoRepository.listarProdutosDisponiveis();
  }

  async listarTodos() {
    return await this.produtoRepository.listarTodos();
  }

  async atualizar(id: string, dados: AtualizarProdutoInput) {
    return await this.produtoRepository.atualizar(id, dados);
  }

  async criar(dados: CriarProdutoInput, adminID: string) {
    return await this.produtoRepository.criar(dados, adminID);
  }

  async excluir(id: string) {
    return await this.produtoRepository.excluir(id);
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
