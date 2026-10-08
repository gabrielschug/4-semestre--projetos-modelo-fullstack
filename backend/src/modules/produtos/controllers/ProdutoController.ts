import { Request, Response } from "express";
import {
  atualizarProdutoSchema,
  criarProdutoSchema,
  gerarFraseVendaSchema,
  produtoIdSchema,
  termoPesquisaSchema,
} from "../schemas/ProdutoSchema";
import { ProdutoService } from "../services/ProdutoService";

export class ProdutoController {
  constructor(private readonly service: ProdutoService) {}

  async listarProdutosDisponiveis(res: Response): Promise<Response> {
    try {
      const result = await this.service.listarProdutosDisponiveis();
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Erro ao obter produtos disponíveis",
        detalhe: String(error),
      });
    }
  }

  async listarTodos(res: Response): Promise<Response> {
    try {
      const produtos = await this.service.listarTodos();
      return res.status(200).json(produtos);
    } catch (error) {
      console.error("Erro ao listar todos os produtos:", error);
      return res.status(500).json({
        error: "Erro ao listar todos os produtos",
        detalhe: String(error),
      });
    }
  }

  async listarDestaques(res: Response): Promise<Response> {
    try {
      const produtos = await this.service.listarDestaques();
      return res.status(200).json(produtos);
    } catch (error) {
      console.error("Erro ao listar produtos em destaque:", error);
      return res.status(500).json({
        error: "Erro ao listar produtos em destaque",
        detalhe: String(error),
      });
    }
  }

  async pesquisarPorCategoria(req: Request, res: Response): Promise<Response> {
    const categoria = termoPesquisaSchema.safeParse(req.params.categoria);
    if (!categoria.success) {
      return res.status(400).json({ error: "Categoria inválida" });
    }

    try {
      const produtos = await this.service.pesquisarPorCategoria(categoria.data);
      return res.status(200).json(produtos);
    } catch (error) {
      console.error("Erro ao pesquisar produtos por categoria:", error);
      return res.status(500).json({
        error: "Erro ao pesquisar produtos por categoria",
        detalhe: String(error),
      });
    }
  }

  async criar(
    req: Request & { adminId?: string },
    res: Response,
  ): Promise<Response> {
    if (!req.adminId) {
      return res.status(401).json({ error: "Administrador não autenticado" });
    }

    const dados = criarProdutoSchema.safeParse(req.body);
    if (!dados.success) {
      return res.status(400).json({
        error: "Dados do produto inválidos",
        detalhe: dados.error.flatten().fieldErrors,
      });
    }

    try {
      const produto = await this.service.criar(dados.data, req.adminId);
      return res.status(201).json(produto);
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      return res.status(500).json({
        error: "Erro ao criar produto",
        detalhe: String(error),
      });
    }
  }

  async gerarFraseVenda(req: Request, res: Response): Promise<Response> {
    const dados = gerarFraseVendaSchema.safeParse(req.body);
    if (!dados.success) {
      return res.status(400).json({
        error: "Dados do produto inválidos",
        detalhe: dados.error.flatten().fieldErrors,
      });
    }

    try {
      const fraseVenda = await this.service.gerarFraseVenda(dados.data);
      return res.status(200).json({ fraseVenda });
    } catch (error) {
      if (error instanceof Error && error.message === "GEMINI_NAO_CONFIGURADO") {
        return res.status(503).json({
          error: "Integração com IA não configurada (GEMINI_API_KEY ausente)",
        });
      }
      console.error("Erro ao gerar frase de venda com IA:", error);
      return res.status(502).json({
        error: "Não foi possível gerar a frase com IA. Tente novamente.",
        detalhe: String(error),
      });
    }
  }

  async atualizar(req: Request, res: Response): Promise<Response> {
    const id = produtoIdSchema.safeParse(req.params.id);
    if (!id.success) {
      return res.status(400).json({ error: "ID do produto inválido" });
    }

    const dados = atualizarProdutoSchema.safeParse(req.body);
    if (!dados.success) {
      return res.status(400).json({
        error: "Dados do produto inválidos",
        detalhe: dados.error.flatten().fieldErrors,
      });
    }

    try {
      const produto = await this.service.atualizar(id.data, dados.data);
      if (!produto) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      return res.status(200).json(produto);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      return res.status(500).json({
        error: "Erro ao atualizar produto",
        detalhe: String(error),
      });
    }
  }

  async excluir(req: Request, res: Response): Promise<Response> {
    const id = produtoIdSchema.safeParse(req.params.id);
    if (!id.success) {
      return res.status(400).json({ error: "ID do produto inválido" });
    }

    try {
      const resultado = await this.service.excluir(id.data);
      if (resultado === "NAO_ENCONTRADO") {
        return res.status(404).json({ error: "Produto não encontrado" });
      }
      if (resultado === "EM_USO") {
        return res.status(409).json({
          error: "Não é possível excluir um produto que já aparece em pedidos",
        });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      return res.status(500).json({
        error: "Erro ao excluir produto",
        detalhe: String(error),
      });
    }
  }

  async PesquisarProdutoPorId(req: Request, res: Response): Promise<Response> {
    const id = produtoIdSchema.safeParse(req.params.id);
    if (!id.success) {
      return res.status(400).json({ error: "ID do produto inválido" });
    }

    try {
      const result = await this.service.PesquisarProdutoPorId(id.data);
      if (!result) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Erro ao obter o produto específico",
        detalhe: String(error),
      });
    }
  }

  async pesquisarProdutos(req: Request, res: Response) {
    const termo = termoPesquisaSchema.safeParse(req.params.termo);
    if (!termo.success) {
      return res.status(400).json({ error: "Termo de pesquisa inválido" });
    }

    try {
      const produtos = await this.service.pesquisar(termo.data);

      return res.status(200).json(produtos);
    } catch (error) {
      console.error("Erro ao pesquisar produtos:", error);
      return res.status(500).json({
        erro: "Erro ao obter pesquisar termo",
      });
    }
  }
}
