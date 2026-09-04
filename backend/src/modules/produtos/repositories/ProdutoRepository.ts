import { PrismaClient } from "@prisma/client";

export class ProdutoRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async listarProdutosDisponiveis() {
    return await this.prisma.produto.findMany({
      where: { disponibilidade: true }
    });
  }
}