import { PrismaClient } from "@prisma/client";
import { includes } from "zod";

export class PedidoRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async listarPedidos() {
    return await this.prisma.pedido.findMany(
      {include: 
        {itens:true}
      }
    );
  }
}