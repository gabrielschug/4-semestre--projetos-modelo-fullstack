import { Request, Response } from "express";
import { BairrosService } from "../services/BairrosService";

export class BairrosController {
  constructor(private readonly service: BairrosService) {}

  async listarBairros(res: Response): Promise<Response> {
    try {
      const result = await this.service.listarBairros();
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Erro ao buscar bairros de entrega",
        detalhe: String(error),
      });
    }
  }
}
