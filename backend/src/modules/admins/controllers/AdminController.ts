import { Request, Response } from "express";
import { AdminService } from "../services/AdminService";
import { adminLoginSchema } from "../schemas/AdminSchema";
import { adminCadastroSchema } from "../schemas/AdminSchema";
import type { RequisicaoComAdmin } from "../../../middlewares/autenticarAdmin";

export class AdminController {
  constructor(private readonly service: AdminService) {}

  async cadastrar(req: Request, res: Response): Promise<Response> {
    console.log("1. CONTROLLER:\n", req.body);
    const validacao = adminCadastroSchema.safeParse(req.body);
    if (!validacao.success) {
      return res.status(400).json({
        error: "Dados de cadastro inválidos",
        detalhe: validacao.error.flatten().fieldErrors,
      });
    }

    try {
      const admin = await this.service.cadastrar(validacao.data);
      return res.status(201).json(admin);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Erro ao cadastrar administrador",
        detalhe: String(error),
      });
    }
  }

  async login(req: RequisicaoComAdmin, res: Response): Promise<Response> {
    console.log("1. CONTROLLERS:\n", req.body);
    const validacao = adminLoginSchema.safeParse(req.body);
    if (!validacao.success) {
      return res.status(400).json({ error: "Dados de login inválidos" });
    }

    try {
      const resultado = await this.service.login(validacao.data);
      return res.status(200).json(resultado);
    } catch (error) {
      if (error instanceof Error && error.message === "CREDENCIAIS_INVALIDAS") {
        return res.status(401).json({ error: "E-mail ou senha incorretos" });
      }
      console.error(error);
      return res
        .status(500)
        .json({ error: "Erro ao realizar login", detalhe: String(error) });
    }
  }

  async buscarLogado(
    req: RequisicaoComAdmin,
    res: Response,
  ): Promise<Response> {
    try {
      if (!req.adminId) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const admin = await this.service.buscarPorId(req.adminId);
      return res.status(200).json(admin);
    } catch (error) {
      if (error instanceof Error && error.message === "ADMIN_NAO_ENCONTRADO") {
        return res.status(404).json({ error: "Administrador não encontrado" });
      }
      console.error(error);
      return res.status(500).json({
        error: "Erro ao buscar administrador",
        detalhe: String(error),
      });
    }
  }
}
