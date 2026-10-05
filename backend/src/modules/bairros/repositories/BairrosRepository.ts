import { PrismaClient } from "@prisma/client";

export class BairrosRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async listarBairros() {
    return await this.prisma.valorEntrega.findMany({
      orderBy: { bairro: "asc" },
    });
  }
}
