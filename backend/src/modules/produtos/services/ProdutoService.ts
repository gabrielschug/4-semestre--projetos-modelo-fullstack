import { gerarFraseVenda } from "../../../lib/gemini";
import { ProdutoRepository } from "../repositories/ProdutoRepository";
import type {
  AtualizarProdutoInput,
  CriarProdutoInput,
  GerarFraseVendaInput,
} from "../schemas/ProdutoSchema";

export class ProdutoService {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async listarProdutosDisponiveis() {
    return await this.produtoRepository.listarProdutosDisponiveis();
  }

  async listarTodos() {
    return await this.produtoRepository.listarTodos();
  }

  async listarDestaques() {
    return await this.produtoRepository.listarDestaques();
  }

  async pesquisarPorCategoria(categoria: string) {
    return await this.produtoRepository.pesquisarPorCategoria(categoria);
  }

  async atualizar(id: string, dados: AtualizarProdutoInput) {
    return await this.produtoRepository.atualizar(id, dados);
  }

  async criar(dados: CriarProdutoInput, adminID: string) {
    let fraseVenda = dados.fraseVenda || null;

    // Sem frase informada, tenta gerar com a IA; se falhar, cadastra sem ela
    if (!fraseVenda) {
      try {
        fraseVenda = await gerarFraseVenda(dados);
      } catch (error) {
        console.error("Produto cadastrado sem frase de venda da IA:", error);
      }
    }

    return await this.produtoRepository.criar(
      { ...dados, fraseVenda },
      adminID,
    );
  }

  async gerarFraseVenda(dados: GerarFraseVendaInput) {
    return await gerarFraseVenda(dados);
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
