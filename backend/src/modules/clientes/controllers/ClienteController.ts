import { Request, Response } from "express"

import { ClienteService } from "../services/ClienteService"
import { clienteCadastroSchema, clienteLoginSchema } from "../schemas/ClienteSchema"

export class ClienteController {
  constructor(private readonly service: ClienteService) {}

  async cadastrar(req: Request, res: Response): Promise<Response> {
    const validacao = clienteCadastroSchema.safeParse(req.body)
    if (!validacao.success) {
      return res.status(400).json({
        error: "Dados de cadastro inválidos",
        detalhe: validacao.error.flatten().fieldErrors,
      })
    }

    try {
      const cliente = await this.service.cadastrar(validacao.data)
      return res.status(201).json(cliente)
    } catch (error) {
      if (error instanceof Error && error.message === "TELEFONE_JA_CADASTRADO") {
        return res.status(409).json({ error: "Já existe um cadastro com este telefone" })
      }
      console.error(error)
      return res.status(500).json({ error: "Erro ao cadastrar cliente", detalhe: String(error) })
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    const validacao = clienteLoginSchema.safeParse(req.body)
    if (!validacao.success) {
      return res.status(400).json({ error: "Dados de login inválidos" })
    }

    try {
      const cliente = await this.service.login(validacao.data)
      return res.status(200).json(cliente)
    } catch (error) {
      if (error instanceof Error && error.message === "CREDENCIAIS_INVALIDAS") {
        return res.status(401).json({ error: "Telefone ou senha incorretos" })
      }
      console.error(error)
      return res.status(500).json({ error: "Erro ao realizar login", detalhe: String(error) })
    }
  }

  async buscarPorId(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params
      const cliente = await this.service.buscarPorId(String(id))
      return res.status(200).json(cliente)
    } catch (error) {
      if (error instanceof Error && error.message === "CLIENTE_NAO_ENCONTRADO") {
        return res.status(404).json({ error: "Cliente não encontrado" })
      }
      console.error(error)
      return res.status(500).json({ error: "Erro ao buscar cliente", detalhe: String(error) })
    }
  }

  async listarBairros(req: Request, res: Response): Promise<Response> {
    try {
      const bairros = await this.service.listarBairros()
      return res.status(200).json(bairros)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: "Erro ao listar bairros", detalhe: String(error) })
    }
  }
}
