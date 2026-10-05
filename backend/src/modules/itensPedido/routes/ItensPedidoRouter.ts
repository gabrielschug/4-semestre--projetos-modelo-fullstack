import { Router } from "express";
import { prisma } from "../../../lib/prisma";
import { ItensPedidoController } from "../controllers/ItensPedidoController";
import { ItensPedidoRepository } from "../repositories/ItensPedidoRepository";
import { ItensPedidoService } from "../services/ItensPedidoService";

const itensPedidoRouter = Router();

const repository = new ItensPedidoRepository(prisma);
const service = new ItensPedidoService(repository);
const controller = new ItensPedidoController(service);

itensPedidoRouter.get("/avaliacoes", (_req, res) =>
  controller.listarMediasAvaliacoesPorProduto(res),
);

export { itensPedidoRouter };
