import { prisma } from "../../../lib/prisma";
import { CriarPedidosInput } from "../types/pedidosType" 

export class PedidosRepository {
  constructor(private readonly prismaClient = prisma) {}

  async listarPedidos() {
    return await prisma.pedido.findMany();
  }

  async criarPedido(data: CriarPedidosInput) { 
    //TODO Criar
  }

  async listarPedidoPorId(id: string) {
    return this.prismaClient.pedido.findUnique({
      where:{id},
      include: {itens: true}
    });
  }
  
  }