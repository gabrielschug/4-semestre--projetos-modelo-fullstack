import { Router } from "express";
import { ProdutoController } from "../controllers/ProdutoController";

const produtoRoutes = Router();
const produtoController = new ProdutoController();

produtoRoutes.get("/", produtoController.listar);

export { produtoRoutes };