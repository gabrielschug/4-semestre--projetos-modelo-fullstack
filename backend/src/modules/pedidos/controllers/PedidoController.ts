import { Request, Response } from "express";
import { PedidoService } from "../services/PedidoServices";
import { CriarPedidoDTO } from "../types/PedidosType";

export class PedidoController {
  constructor(private readonly PedidoService: PedidoService) {}

  async listarPedidos(res: Response): Promise<Response> {
    try {
      const result = await this.PedidoService.listarPedidos();
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao obter pedidos", detalhe: String(error) });
    }
  }

  async criarPedido(req: Request, res: Response) {
    try {
      const dados: CriarPedidoDTO = req.body;

      const pedido = await this.PedidoService.criarPedido(dados);

      return res.status(201).json({
        mensagem: "Pedido criado com sucesso!",
        pedidoId: pedido.id,
      });
    } catch (error: any) {
      console.error("Erro ao criar pedido:", error);
      return res.status(400).json({ erro: error.message });
    }
  }
}
