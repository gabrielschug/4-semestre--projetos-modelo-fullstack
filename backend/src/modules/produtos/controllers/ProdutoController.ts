import { Response } from "express";
import { ProdutoService } from "../services/ProdutoService";

export class ProdutoController {
  constructor(private readonly service: ProdutoService) {}
  
  async listarProdutosDisponiveis(res: Response): Promise<Response> {
    try {
      const result = await this.service.listarProdutosDisponiveis();
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao obter produtos disponíveis", detalhe: String(error) });
    }
  }
}