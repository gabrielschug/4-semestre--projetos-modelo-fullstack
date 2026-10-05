import { Request, Response } from "express";
import {
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

  async PesquisarProdutoPorId(req: Request, res: Response): Promise<Response> {
    const id = produtoIdSchema.safeParse(req.params.id);
    if (!id.success) {
      return res.status(400).json({ error: "ID do produto inválido" });
    }

    try {
      const result = await this.service.PesquisarProdutoPorId(id.data);
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
