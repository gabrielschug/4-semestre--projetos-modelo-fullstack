import { Router } from "express"

import { prisma } from "../../../lib/prisma"
import { AdminRepository } from "../repositories/AdminRepository"
import { AdminService } from "../services/AdminService"
import { AdminController } from "../controllers/AdminController"
import { autenticarAdmin } from "../../../middlewares/autenticarAdmin"

const adminRouter = Router()

const repository = new AdminRepository(prisma)
const service = new AdminService(repository)
const controller = new AdminController(service)

adminRouter.post("/login", (req, res) => controller.login(req, res))
adminRouter.get("/me", autenticarAdmin, (req, res) => controller.buscarLogado(req, res))

export { adminRouter }
