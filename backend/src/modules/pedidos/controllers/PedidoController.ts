import { Request, Response } from "express";
import { z } from "zod";
import { PedidoService } from "../services/PedidoServices";
import { CriarPedidoDTO } from "../types/PedidosType";

const clienteIdSchema = z.string().uuid();
const avaliacaoSchema = z.object({
  avaliacao: z.number().int().min(1).max(5),
});
const statusPedidoSchema = z.enum([
  "PENDENTE",
  "PREPARANDO",
  "PRONTO",
  "EM_ROTA",
  "ENTREGUE",
  "CANCELADO",
]);

export class PedidoController {
  constructor(private readonly PedidoService: PedidoService) {}

  async listarPedidos(_req: Request, res: Response): Promise<Response> {
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

  async contarPedidosPorStatus(_req: Request, res: Response): Promise<Response> {
    try {
      const result = await this.PedidoService.contarPedidosPorStatus();
      return res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao contar pedidos por status:", error);
      return res.status(500).json({
        error: "Erro ao obter quantidades de pedidos por status",
      });
    }
  }

  async atualizarStatusPedido(req: Request, res: Response): Promise<Response> {
    const pedidoID = clienteIdSchema.safeParse(req.params.pedidoId);
    const body = z
      .object({ status: statusPedidoSchema })
      .safeParse(req.body);
    if (!pedidoID.success) {
      return res.status(400).json({ error: "ID do pedido inválido" });
    }
    if (!body.success) {
      return res.status(400).json({ error: "Status do pedido inválido" });
    }

    try {
      const resultado = await this.PedidoService.atualizarStatusPedido(
        pedidoID.data,
        body.data.status,
      );
      if (resultado.resultado === "NAO_ENCONTRADO") {
        return res.status(404).json({ error: "Pedido não encontrado" });
      }
      if (resultado.resultado === "TRANSICAO_INVALIDA") {
        return res
          .status(409)
          .json({ error: "Essa mudança de status não é permitida" });
      }
      if (resultado.resultado === "CONFLITO") {
        return res.status(409).json({
          error: "O pedido foi atualizado por outra pessoa. Atualize o quadro.",
        });
      }

      return res.status(200).json({ mensagem: "Status do pedido atualizado" });
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error);
      return res
        .status(500)
        .json({ error: "Erro ao atualizar o status do pedido" });
    }
  }

  async listarPedidosDoCliente(req: Request, res: Response): Promise<Response> {
    try {
      const clienteID = clienteIdSchema.safeParse(req.params.clienteId);
      if (!clienteID.success) {
        return res.status(400).json({ error: "ID do cliente inválido" });
      }

      const result = await this.PedidoService.listarPedidosDoCliente(
        clienteID.data,
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao obter os pedidos do cliente" });
    }
  }

  async cancelarPedido(req: Request, res: Response): Promise<Response> {
    const clienteID = clienteIdSchema.safeParse(req.params.clienteId);
    const pedidoID = z.string().uuid().safeParse(req.params.pedidoId);
    if (!clienteID.success || !pedidoID.success) {
      return res.status(400).json({ error: "Identificação inválida" });
    }

    try {
      const resultado = await this.PedidoService.cancelarPedido(
        clienteID.data,
        pedidoID.data,
      );

      if (resultado.resultado === "NAO_ENCONTRADO") {
        return res.status(404).json({ error: "Pedido não encontrado" });
      }
      if (resultado.resultado === "NAO_CANCELAVEL") {
        return res.status(409).json({
          error: "Somente pedidos pendentes podem ser cancelados",
        });
      }

      return res.status(200).json({ mensagem: "Pedido cancelado" });
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error);
      return res.status(500).json({ error: "Erro ao cancelar o pedido" });
    }
  }

  async avaliarItemPedido(req: Request, res: Response): Promise<Response> {
    const clienteID = clienteIdSchema.safeParse(req.params.clienteId);
    const pedidoID = z.string().uuid().safeParse(req.params.pedidoId);
    const itemID = z.string().uuid().safeParse(req.params.itemId);
    const body = avaliacaoSchema.safeParse(req.body);
    if (!clienteID.success || !pedidoID.success || !itemID.success) {
      return res.status(400).json({ error: "Identificação inválida" });
    }
    if (!body.success) {
      return res.status(400).json({ error: "A avaliação deve ser de 1 a 5 estrelas" });
    }

    try {
      const resultado = await this.PedidoService.avaliarItemPedido(
        clienteID.data,
        pedidoID.data,
        itemID.data,
        body.data.avaliacao,
      );

      if (resultado.resultado === "NAO_ENCONTRADO") {
        return res.status(404).json({ error: "Pedido não encontrado" });
      }
      if (resultado.resultado === "ITEM_NAO_ENCONTRADO") {
        return res.status(404).json({ error: "Item não encontrado neste pedido" });
      }
      if (resultado.resultado === "PEDIDO_NAO_ENTREGUE") {
        return res.status(409).json({
          error: "Você poderá avaliar os produtos após a entrega do pedido",
        });
      }

      return res.status(200).json({
        mensagem: "Avaliação registrada",
        avaliacao: resultado.avaliacao,
      });
    } catch (error) {
      console.error("Erro ao avaliar item do pedido:", error);
      return res.status(500).json({ error: "Erro ao registrar avaliação" });
    }
  }

  async criarPedido(req: Request, res: Response) {
    try {
      const dados: CriarPedidoDTO = req.body;

      const pedido = await this.PedidoService.criarPedido(dados);

      return res.status(201).json({
        mensagem: "Pedido criado com sucesso!",
        pedidoId: pedido.id,
        tempoTotalEstimadoMinutos: pedido.tempoTotalEstimadoMinutos,
      });
    } catch (error: any) {
      console.error("Erro ao criar pedido:", error);
      return res.status(400).json({ erro: error.message });
    }
  }
}
