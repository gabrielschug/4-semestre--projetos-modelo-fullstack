import { Request, Response } from "express";
import { z } from "zod";
import { PagamentoService } from "../services/PagamentoService";

const pedidoIdSchema = z.coerce.number().int().positive();

export class PagamentoController {
  constructor(private readonly pagamentoService: PagamentoService) {}

  async confirmarPagamento(req: Request, res: Response): Promise<Response> {
    const pedidoID = pedidoIdSchema.safeParse(req.params.pedidoId);
    if (!pedidoID.success) {
      return res.status(400).json({ error: "ID do pedido inválido" });
    }

    try {
      const resultado = await this.pagamentoService.confirmarPagamento(
        pedidoID.data,
      );

      if (resultado.resultado === "NAO_ENCONTRADO") {
        return res
          .status(404)
          .json({ error: "Pedido com pagamento online não encontrado" });
      }
      if (resultado.resultado === "INDISPONIVEL") {
        return res
          .status(503)
          .json({ error: "Pagamento online indisponível no momento" });
      }
      if (resultado.resultado === "NAO_PAGO") {
        return res.status(409).json({
          error: "O pagamento ainda não foi aprovado",
          status: resultado.status,
        });
      }

      // Dados para o frontend mostrar a confirmação, inclusive quando o
      // cliente volta de um redirecionamento do Stripe
      return res.status(200).json({
        mensagem: "Pagamento confirmado",
        pedidoId: resultado.pedido.id,
        tempoTotalEstimadoMinutos: resultado.pedido.tempoTotalEstimadoMinutos,
        modalEntrega: resultado.pedido.modalEntrega,
      });
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      return res.status(500).json({ error: "Erro ao confirmar o pagamento" });
    }
  }

  async webhook(req: Request, res: Response): Promise<Response> {
    const assinatura = req.headers["stripe-signature"];
    if (typeof assinatura !== "string" || !Buffer.isBuffer(req.body)) {
      return res.status(400).json({ error: "Requisição de webhook inválida" });
    }

    try {
      await this.pagamentoService.processarWebhook(req.body, assinatura);
      return res.status(200).json({ recebido: true });
    } catch (error) {
      console.error("Erro no webhook do Stripe:", error);
      return res.status(400).json({ error: "Webhook não processado" });
    }
  }
}
