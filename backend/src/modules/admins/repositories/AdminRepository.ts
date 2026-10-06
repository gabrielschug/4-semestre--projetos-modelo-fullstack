import { PrismaClient } from "@prisma/client";
import type { CadastrarAdminInput } from "../types/AdminTypes";

export class AdminRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async buscarPorEmail(email: string) {
    return await this.prisma.admin.findUnique({
      where: { email },
    });
  }

  async buscarPorId(id: string) {
    return await this.prisma.admin.findUnique({
      where: { id },
    });
  }

  async cadastrar(dados: CadastrarAdminInput, senhaHash: string) {
    console.log("3. REPOSITORY: \n", dados, senhaHash);
    return await this.prisma.admin.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha: senhaHash,
      },
    });
  }
}
