import { PrismaClient } from "@prisma/client";
import type { CadastrarClienteInput } from "../types/ClienteTypes";

export class ClienteRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async buscarPorTelefone(telefone: string) {
    return await this.prisma.cliente.findFirst({
      where: { telefone },
      include: { enderecos: { include: { bairro: true } } },
    });
  }

  async buscarPorId(id: string) {
    return await this.prisma.cliente.findUnique({
      where: { id },
      include: { enderecos: { include: { bairro: true } } },
    });
  }

  async criar(dados: CadastrarClienteInput, senhaHash: string) {
    return await this.prisma.cliente.create({
      data: {
        nome: dados.nome,
        telefone: dados.telefone,
        senha: senhaHash,
        enderecos: {
          create: {
            titulo: "Principal",
            rua: dados.rua,
            numero: dados.numero,
            obs: dados.obs,
            bairro: { connect: { id: dados.bairroID } },
          },
        },
      },
      include: { enderecos: { include: { bairro: true } } },
    });
  }

  async listarBairros() {
    return await this.prisma.valorEntrega.findMany({
      orderBy: { bairro: "asc" },
    });
  }
}
