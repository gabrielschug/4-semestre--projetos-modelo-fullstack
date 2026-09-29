import { Router } from "express"

import { prisma } from "../../../lib/prisma"
import { ClienteRepository } from "../repositories/ClienteRepository"
import { ClienteService } from "../services/ClienteService"
import { ClienteController } from "../controllers/ClienteController"

const clienteRouter = Router()

const repository = new ClienteRepository(prisma)
const service = new ClienteService(repository)
const controller = new ClienteController(service)

clienteRouter.get("/bairros", (req, res) => controller.listarBairros(req, res))
clienteRouter.post("/login", (req, res) => controller.login(req, res))
clienteRouter.post("/", (req, res) => controller.cadastrar(req, res))
clienteRouter.get("/:id", (req, res) => controller.buscarPorId(req, res))

export { clienteRouter }
