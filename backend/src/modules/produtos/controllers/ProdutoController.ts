import { Request, Response } from "express";
import { ProdutoService } from "../services/ProdutoServices";

export class ProdutoController {
  listar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const produtoService = new ProdutoService();
      const cardapio = await produtoService.obterCardapio();
      
      return res.status(200).json(cardapio);
    } catch (error) {
      console.error("Erro ao listar produtos:", error);
      return res.status(500).json({ erro: "Erro interno ao carregar o cardápio." });
    }
  };
}