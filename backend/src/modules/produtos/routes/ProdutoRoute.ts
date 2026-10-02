import { Router } from "express";
import { ProdutoController } from "../controllers/ProdutoController";
import { ProdutoService } from "../services/ProdutoService";
import { ProdutoRepository } from "../repositories/ProdutoRepository";
import { prisma } from "../../../lib/prisma";

const produtoRouter = Router();

const repository = new ProdutoRepository(prisma);
const service = new ProdutoService(repository);
const controller = new ProdutoController(service);

produtoRouter.get("/", (req, res) => controller.listarProdutosDisponiveis(res));
produtoRouter.get("/:id", (req, res) =>
  controller.PesquisarProdutoPorId(req, res),
);
produtoRouter.get("/pesquisa/:termo", (req, res) =>
  controller.pesquisarProdutos(req, res),
);
export { produtoRouter };
