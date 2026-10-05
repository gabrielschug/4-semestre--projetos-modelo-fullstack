import { Response } from "express";
import { ItensPedidoService } from "../services/ItensPedidoService";

export class ItensPedidoController {
  constructor(private readonly itensPedidoService: ItensPedidoService) {}

  async listarMediasAvaliacoesPorProduto(res: Response): Promise<Response> {
    try {
      const medias =
        await this.itensPedidoService.listarMediasAvaliacoesPorProduto();
      return res.status(200).json(medias);
    } catch (error) {
      console.error("Erro ao obter médias de avaliações dos produtos:", error);
      return res
        .status(500)
        .json({ error: "Erro ao obter avaliações dos produtos" });
    }
  }
}
