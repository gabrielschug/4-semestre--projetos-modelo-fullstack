import { Router } from "express";
import { prisma } from "../../../lib/prisma";
import { PedidoRepository } from "../repositories/PedidoRepository";
import { PedidoService } from "../services/PedidoServices";
import { PedidoController } from "../controllers/PedidoController";

const pedidoRouter = Router();

const repository = new PedidoRepository(prisma);
const service = new PedidoService(repository);
const controller = new PedidoController(service);

pedidoRouter.get("/", controller.listarPedidos.bind(controller));
pedidoRouter.get(
  "/cliente/:clienteId",
  controller.listarPedidosDoCliente.bind(controller),
);
pedidoRouter.patch(
  "/cliente/:clienteId/:pedidoId/cancelar",
  controller.cancelarPedido.bind(controller),
);
pedidoRouter.patch(
  "/cliente/:clienteId/:pedidoId/itens/:itemId/avaliacao",
  controller.avaliarItemPedido.bind(controller),
);
// pedidoRouter.post("/", controller.criarPedido.bind(PedidoController));
pedidoRouter.post("/", (req, res) => controller.criarPedido(req, res));
export { pedidoRouter };
