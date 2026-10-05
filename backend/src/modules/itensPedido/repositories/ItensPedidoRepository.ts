import { PrismaClient } from "@prisma/client";

export class ItensPedidoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarMediasAvaliacoesPorProduto() {
    const produtos = await this.prisma.produto.findMany({
      select: {
        id: true,
        itensPedidos: {
          where: { avaliacao: { not: null } },
          select: { avaliacao: true },
        },
      },
    });

    return produtos.map(({ id, itensPedidos }) => ({
      produtoID: id,
      avaliacaoMedia:
        itensPedidos.length > 0
          ? itensPedidos.reduce(
              (soma, item) => soma + (item.avaliacao ?? 0),
              0,
            ) / itensPedidos.length
          : 5,
    }));
  }
}
