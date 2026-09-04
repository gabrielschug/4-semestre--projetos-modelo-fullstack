import { Request, Response } from "express";
import { PedidoService } from "../services/PedidoServices";

export class PedidoController {
  constructor(private readonly service: PedidoService) {}
  
  async listarPedidos(res: Response): Promise<Response> {
    try {
      const result = await this.service.listarPedidos();
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao obter pedidos", detalhe: String(error) });
    }
  }
}