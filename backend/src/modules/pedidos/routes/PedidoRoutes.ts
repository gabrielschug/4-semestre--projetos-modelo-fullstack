import { Router } from "express";
import { PedidoController } from "../controllers/PedidoController";

const pedidoRoutes = Router();
const pedidoController = new PedidoController();

pedidoRoutes.get("/", pedidoController.listar);

export { pedidoRoutes };