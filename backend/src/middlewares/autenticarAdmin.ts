import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

export interface RequisicaoComAdmin extends Request {
  adminId?: string
}

export function autenticarAdmin(req: RequisicaoComAdmin, res: Response, next: NextFunction) {
  const cabecalhoAutorizacao = req.headers.authorization

  if (!cabecalhoAutorizacao || !cabecalhoAutorizacao.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token de acesso não informado" })
  }

  const token = cabecalhoAutorizacao.replace("Bearer ", "")
  const chaveSecreta = process.env.JWT_SECRET

  if (!chaveSecreta) {
    console.error("A variável JWT_SECRET não foi configurada no arquivo .env")
    return res.status(500).json({ error: "Erro de configuração do servidor" })
  }

  try {
    const dadosDoToken = jwt.verify(token, chaveSecreta) as { adminId: string }
    req.adminId = dadosDoToken.adminId
    return next()
  } catch {
    return res.status(401).json({ error: "Token de acesso inválido ou expirado" })
  }
}
