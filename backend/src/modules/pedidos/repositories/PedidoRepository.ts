import { PrismaClient } from "@prisma/client";
import { CriarPedidoDTO } from "../types/PedidosType";

export class PedidoRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async listarPedidos() {
    return await this.prisma.pedido.findMany({ include: { itens: true } });
  }

  async buscarClientePorTelefone(telefone: string) {
    return await this.prisma.cliente.findFirst({
      where: { telefone },
      orderBy: { id: "desc" },
    });
  }

  async criarPedidoComCliente(dados: CriarPedidoDTO, anotacaoFinal: string) {
    let cliente = await this.buscarClientePorTelefone(dados.cliente.telefone);

    // Pedido visitante
    if (!cliente) {
      cliente = await this.prisma.cliente.create({
        data: {
          nome: dados.cliente.nome,
          telefone: dados.cliente.telefone,
          rua: dados.cliente.rua,
          numero: dados.cliente.numero,
          bairroID: dados.cliente.bairroID,
        },
      });
    }

    // Pedido Logado
    return await this.prisma.pedido.create({
      data: {
        modalEntrega: dados.pedido.modalEntrega,
        pagamento: dados.pedido.pagamento,
        valorTotal: dados.pedido.valorTotal,
        tempoTotalEstimadoMinutos: 40, //TODO - AJUSTAR O TEMPO ESTIMADO
        anotacaoCliente: anotacaoFinal,
        clienteID: cliente.id,
        itens: {
          create: dados.pedido.itens.map((item) => ({
            quantidade: item.quantidade,
            precoProduto: item.precoProduto,
            produtoID: item.produtoID,
          })),
        },
      },
    });
  }

  async buscarPrimeiroAdmin() {
    return await this.prisma.admin.findFirst();
  }
}
