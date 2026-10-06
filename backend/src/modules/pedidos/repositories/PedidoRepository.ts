import { PrismaClient, type StatusPedido } from "@prisma/client";
import { CriarPedidoDTO } from "../types/PedidosType";

export class PedidoRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async listarPedidos() {
    return await this.prisma.pedido.findMany({
      orderBy: { dataHora: "desc" },
      select: {
        id: true,
        status: true,
        dataHora: true,
        tempoTotalEstimadoMinutos: true,
        modalEntrega: true,
        valorTotal: true,
        anotacaoCliente: true,
        cliente: {
          select: {
            nome: true,
            telefone: true,
            rua: true,
            numero: true,
            bairro: { select: { bairro: true } },
          },
        },
        itens: {
          select: {
            id: true,
            quantidade: true,
            precoProduto: true,
            produto: { select: { descricao: true } },
          },
        },
      },
    });
  }

  async buscarStatusPedido(id: string) {
    return await this.prisma.pedido.findUnique({
      where: { id },
      select: { status: true, modalEntrega: true },
    });
  }

  async atualizarStatusPedido(
    id: string,
    statusAtual: StatusPedido,
    novoStatus: StatusPedido,
  ) {
    const resultado = await this.prisma.pedido.updateMany({
      where: { id, status: statusAtual },
      data: { status: novoStatus },
    });
    return resultado.count > 0;
  }

  async contarPedidosPorStatus() {
    const contagens = await this.prisma.pedido.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    return contagens.map(({ status, _count }) => ({
      status,
      quantidade: _count._all,
    }));
  }

  async listarPedidosDoCliente(clienteID: string) {
    return await this.prisma.pedido.findMany({
      where: { clienteID },
      orderBy: { dataHora: "desc" },
      select: {
        id: true,
        status: true,
        dataHora: true,
        tempoTotalEstimadoMinutos: true,
        modalEntrega: true,
        valorTotal: true,
        itens: {
          select: {
            id: true,
            produtoID: true,
            avaliacao: true,
            produto: { select: { descricao: true } },
          },
        },
      },
    });
  }

  async cancelarPedido(clienteID: string, pedidoID: string) {
    const pedido = await this.prisma.pedido.findFirst({
      where: { id: pedidoID, clienteID },
      select: { status: true },
    });

    if (!pedido) {
      return { resultado: "NAO_ENCONTRADO" as const };
    }
    if (pedido.status !== "PENDENTE") {
      return { resultado: "NAO_CANCELAVEL" as const };
    }

    const atualizacao = await this.prisma.pedido.updateMany({
      where: { id: pedidoID, clienteID, status: "PENDENTE" },
      data: { status: "CANCELADO" },
    });

    if (atualizacao.count === 0) {
      const pedidoAtual = await this.prisma.pedido.findFirst({
        where: { id: pedidoID, clienteID },
        select: { id: true },
      });
      return {
        resultado: pedidoAtual ? ("NAO_CANCELAVEL" as const) : ("NAO_ENCONTRADO" as const),
      };
    }

    return { resultado: "CANCELADO" as const };
  }

  async avaliarItemPedido(
    clienteID: string,
    pedidoID: string,
    itemID: string,
    avaliacao: number,
  ) {
    const pedido = await this.prisma.pedido.findFirst({
      where: { id: pedidoID, clienteID },
      select: { status: true },
    });

    if (!pedido) {
      return { resultado: "NAO_ENCONTRADO" as const };
    }
    if (pedido.status !== "ENTREGUE") {
      return { resultado: "PEDIDO_NAO_ENTREGUE" as const };
    }

    const item = await this.prisma.itensPedido.findFirst({
      where: { id: itemID, pedidoID },
      select: { id: true },
    });
    if (!item) {
      return { resultado: "ITEM_NAO_ENCONTRADO" as const };
    }

    await this.prisma.itensPedido.update({
      where: { id: itemID },
      data: { avaliacao },
    });

    return { resultado: "AVALIADO" as const, avaliacao };
  }

  async buscarClientePorTelefone(telefone: string) {
    return await this.prisma.cliente.findFirst({
      where: { telefone },
      orderBy: { id: "desc" },
    });
  }

  private async calcularTempoEstimado(
    produtoIds: string[],
    modalEntrega: string,
    bairroID?: string,
  ): Promise<number> {
    const produtos = await this.prisma.produto.findMany({
      where: { id: { in: produtoIds } },
      select: { tempoPreparoMinutos: true },
    });

    const maxTempoPreparo =
      produtos.length > 0
        ? Math.max(...produtos.map((p) => p.tempoPreparoMinutos || 0))
        : 0;

    let tempoEntrega = 0;
    if (modalEntrega === "DELIVERY" && bairroID) {
      const bairro = await this.prisma.valorEntrega.findUnique({
        where: { id: bairroID },
        select: { tempoEntregaMinutos: true },
      });

      if (bairro) {
        tempoEntrega = bairro.tempoEntregaMinutos || 0;
      }
    }
    return maxTempoPreparo + tempoEntrega;
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
          senha: Math.random().toString(36).slice(-10),
        },
      });
    }

    const produtoIds = dados.pedido.itens.map((item) => item.produtoID);

    const tempoTotalEstimadoMinutos = await this.calcularTempoEstimado(
      produtoIds,
      dados.pedido.modalEntrega,
      dados.cliente.bairroID,
    );

    // Pedido Logado
    return await this.prisma.pedido.create({
      data: {
        modalEntrega: dados.pedido.modalEntrega,
        pagamento: dados.pedido.pagamento,
        valorTotal: dados.pedido.valorTotal,
        tempoTotalEstimadoMinutos: tempoTotalEstimadoMinutos,
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
