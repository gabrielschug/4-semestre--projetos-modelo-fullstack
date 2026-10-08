import { Response } from "express";
import { z } from "zod";
import type { RequisicaoComAdmin } from "../../../middlewares/autenticarAdmin";
import { BairrosService } from "../services/BairrosService";

const bairroSchema = z
  .object({
    bairro: z.string().trim().min(1, "Informe o nome do bairro"),
    valor: z.number().finite().nonnegative("O valor não pode ser negativo"),
    tempoEntregaMinutos: z
      .number()
      .int()
      .nonnegative("O tempo não pode ser negativo"),
  })
  .strict();

const idSchema = z.string().guid("ID do bairro inválido");

export class BairrosController {
  constructor(private readonly service: BairrosService) {}

  async listarBairros(res: Response): Promise<Response> {
    try {
      const result = await this.service.listarBairros();
      return res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao buscar bairros de entrega:", error);
      return res.status(500).json({
        error: "Erro ao buscar bairros de entrega",
        detalhe: String(error),
      });
    }
  }

  async criarBairro(req: RequisicaoComAdmin, res: Response): Promise<Response> {
    const dados = bairroSchema.safeParse(req.body);
    if (!dados.success) {
      return res.status(400).json({
        error: "Dados do bairro inválidos",
        detalhe: dados.error.flatten().fieldErrors,
      });
    }

    try {
      const bairro = await this.service.criarBairro(dados.data);
      return res.status(201).json(bairro);
    } catch (error) {
      if (temCodigoPrisma(error, "P2002")) {
        return res.status(409).json({ error: "Este bairro já está cadastrado" });
      }
      console.error("Erro ao cadastrar bairro:", error);
      return res.status(500).json({ error: "Erro ao cadastrar bairro" });
    }
  }

  async atualizarBairro(
    req: RequisicaoComAdmin,
    res: Response,
  ): Promise<Response> {
    const id = idSchema.safeParse(req.params.id);
    if (!id.success) {
      return res.status(400).json({ error: "ID do bairro inválido" });
    }

    const dados = bairroSchema.safeParse(req.body);
    if (!dados.success) {
      return res.status(400).json({
        error: "Dados do bairro inválidos",
        detalhe: dados.error.flatten().fieldErrors,
      });
    }

    try {
      const bairro = await this.service.atualizarBairro(id.data, dados.data);
      if (!bairro) {
        return res.status(404).json({ error: "Bairro não encontrado" });
      }
      return res.status(200).json(bairro);
    } catch (error) {
      if (temCodigoPrisma(error, "P2002")) {
        return res.status(409).json({ error: "Este bairro já está cadastrado" });
      }
      console.error("Erro ao atualizar bairro:", error);
      return res.status(500).json({ error: "Erro ao atualizar bairro" });
    }
  }

  async excluirBairro(
    req: RequisicaoComAdmin,
    res: Response,
  ): Promise<Response> {
    const id = idSchema.safeParse(req.params.id);
    if (!id.success) {
      return res.status(400).json({ error: "ID do bairro inválido" });
    }

    try {
      const resultado = await this.service.excluirBairro(id.data);
      if (resultado === "NAO_ENCONTRADO") {
        return res.status(404).json({ error: "Bairro não encontrado" });
      }
      if (resultado === "EM_USO") {
        return res.status(409).json({
          error: "Não é possível excluir um bairro vinculado a clientes",
        });
      }
      return res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir bairro:", error);
      return res.status(500).json({ error: "Erro ao excluir bairro" });
    }
  }
}

function temCodigoPrisma(error: unknown, codigo: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === codigo
  );
}
