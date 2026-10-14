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

  async criarBairro(dados: { bairro: string; valor: number; tempoEntregaMinutos: number }) {
    return await this.prisma.valorEntrega.create({ data: dados });
  }

  async atualizarBairro(
    id: number,
    dados: { bairro: string; valor: number; tempoEntregaMinutos: number },
  ) {
    const existente = await this.prisma.valorEntrega.findUnique({ where: { id } });
    if (!existente) {
      return null;
    }

    return await this.prisma.valorEntrega.update({ where: { id }, data: dados });
  }

  async excluirBairro(id: number) {
    const existente = await this.prisma.valorEntrega.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existente) {
      return "NAO_ENCONTRADO" as const;
    }

    const enderecosVinculados = await this.prisma.endereco.count({
      where: { bairroID: id },
    });
    if (enderecosVinculados > 0) {
      return "EM_USO" as const;
    }

    await this.prisma.valorEntrega.delete({ where: { id } });
    return "EXCLUIDO" as const;
  }
}
