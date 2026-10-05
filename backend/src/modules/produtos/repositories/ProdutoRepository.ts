import { PrismaClient } from "@prisma/client";
import { includes } from "zod";

export class ProdutoRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async listarProdutosDisponiveis() {
    return await this.prisma.produto.findMany({
      where: { disponibilidade: true },
      orderBy: { categoria: "desc" },
    });
  }

  async PesquisarProdutoPorId(id: string) {
    return await this.prisma.produto.findFirst({
      where: { id: id, disponibilidade: true },
    });
  }

  async pesquisarTexto(termo: string) {
    return await this.prisma.produto.findMany({
      where: {
        OR: [
          { descricao: { contains: termo, mode: "insensitive" } },
          { categoria: { contains: termo, mode: "insensitive" } },
        ],
        disponibilidade: true,
      },
    });
  }

  async pesquisaPrecoMaximo(preco: number) {
    return await this.prisma.produto.findMany({
      where: { precoBase: { lte: preco }, disponibilidade: true },
    });
  }
}
