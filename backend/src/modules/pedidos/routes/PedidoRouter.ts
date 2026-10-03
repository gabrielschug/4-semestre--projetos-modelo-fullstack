import { Router } from "express";
import { prisma } from "../../../lib/prisma";
import { PedidoRepository } from "../repositories/PedidoRepository";
import { PedidoService } from "../services/PedidoServices";
import { PedidoController } from "../controllers/PedidoController";

const pedidoRouter = Router();

const repository = new PedidoRepository(prisma);
const service = new PedidoService(repository);
const controller = new PedidoController(service);

pedidoRouter.get("/", controller.listarPedidos.bind(PedidoController));
// pedidoRouter.post("/", controller.criarPedido.bind(PedidoController));
pedidoRouter.post("/", (req, res) => controller.criarPedido(req, res));
export { pedidoRouter };
