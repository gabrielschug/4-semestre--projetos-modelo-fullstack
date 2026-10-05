import { Request, Response } from "express";
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
    try {
      const { id } = req.params;

      const result = await this.service.PesquisarProdutoPorId(id);
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
    try {
      const { termo } = req.params;
      const produtos = await this.service.pesquisar(termo);

      return res.status(200).json(produtos);
    } catch (error) {
      console.error("Erro ao pesquisar produtos:", error);
      return res.status(500).json({
        erro: "Erro ao obter pesquisar termo",
      });
    }
  }
}
