import { PrismaClient } from "@prisma/client";

export class PagamentoRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async buscarPedido(id: number) {
    return await this.prisma.pedido.findUnique({
      where: { id },
      select: {
        id: true,
        pagamento: true,
        valorTotal: true,
        modalEntrega: true,
        tempoTotalEstimadoMinutos: true,
        pagoEm: true,
        stripePaymentIntentId: true,
      },
    });
  }

  async salvarPaymentIntent(pedidoID: number, paymentIntentId: string) {
    await this.prisma.pedido.update({
      where: { id: pedidoID },
      data: { stripePaymentIntentId: paymentIntentId },
    });
  }

  // O filtro pagoEm: null evita gravar duas vezes quando a confirmação
  // do navegador e o webhook chegam ao mesmo tempo
  async marcarComoPago(paymentIntentId: string) {
    await this.prisma.pedido.updateMany({
      where: { stripePaymentIntentId: paymentIntentId, pagoEm: null },
      data: { pagoEm: new Date() },
    });
  }
}
