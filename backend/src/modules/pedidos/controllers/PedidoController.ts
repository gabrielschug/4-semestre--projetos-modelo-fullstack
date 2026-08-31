import { Request, Response } from "express";
import { PedidoService } from "../services/PedidosServices";

export class PedidoController {
  listar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const pedidoService = new PedidoService();
      const pedidos = await pedidoService.obterPedidos();
      
      return res.status(200).json(pedidos);
    } catch (error) {
      console.error("Erro ao listar pedidos:", error);
      return res.status(500).json({ erro: "Erro interno ao carregar os pedidos." });
    }
  };
}