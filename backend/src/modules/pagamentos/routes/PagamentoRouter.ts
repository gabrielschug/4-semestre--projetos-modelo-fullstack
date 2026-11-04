import express, { Router } from "express";
import { prisma } from "../../../lib/prisma";
import { PagamentoRepository } from "../repositories/PagamentoRepository";
import { PagamentoService } from "../services/PagamentoService";
import { PagamentoController } from "../controllers/PagamentoController";

const repository = new PagamentoRepository(prisma);
const service = new PagamentoService(repository);
const controller = new PagamentoController(service);

const pagamentoRouter = Router();
pagamentoRouter.post("/pedidos/:pedidoId/confirmar", (req, res) =>
  controller.confirmarPagamento(req, res),
);

// O Stripe assina o corpo original da requisição, então o webhook precisa
// receber o corpo cru (Buffer) e ser registrado antes do express.json()
const pagamentoWebhookRouter = Router();
pagamentoWebhookRouter.post(
  "/",
  express.raw({ type: "application/json" }),
  (req, res) => controller.webhook(req, res),
);

export { pagamentoRouter, pagamentoWebhookRouter };
