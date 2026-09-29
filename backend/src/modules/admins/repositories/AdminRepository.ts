import { PrismaClient } from "@prisma/client"

export class AdminRepository {
  private prisma: PrismaClient

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient
  }

  async buscarPorEmail(email: string) {
    return await this.prisma.admin.findUnique({
      where: { email },
    })
  }

  async buscarPorId(id: string) {
    return await this.prisma.admin.findUnique({
      where: { id },
    })
  }
}
