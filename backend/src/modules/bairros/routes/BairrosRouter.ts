import { Router } from "express";
import { BairrosController } from "../controllers/BairrosController";
import { BairrosService } from "../services/BairrosService";
import { BairrosRepository } from "../repositories/BairrosRepository";
import { prisma } from "../../../lib/prisma";

const bairrosRouter = Router();

const repository = new BairrosRepository(prisma);
const service = new BairrosService(repository);
const controller = new BairrosController(service);

bairrosRouter.get("/", (req, res) => controller.listarBairros(res));
bairrosRouter.get("/bairros_valores", (req, res) =>
  controller.listarBairros(res),
);
export { bairrosRouter };
