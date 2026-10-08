import { PrismaClient } from "@prisma/client";
import type {
  AtualizarProdutoInput,
  CriarProdutoInput,
} from "../schemas/ProdutoSchema";

export class ProdutoRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async listarProdutosDisponiveis() {
    return await this.prisma.produto.findMany({
      where: { disponibilidade: true },
      orderBy: { categoria: "desc" },
    });
  }

  async listarTodos() {
    return await this.prisma.produto.findMany({
      orderBy: { categoria: "desc" },
    });
  }

  async listarDestaques() {
    return await this.prisma.produto.findMany({
      where: { disponibilidade: true, valorDesconto: { gt: 0 } },
      orderBy: { valorDesconto: "desc" },
    });
  }

  async pesquisarPorCategoria(categoria: string) {
    return await this.prisma.produto.findMany({
      where: {
        categoria: { equals: categoria, mode: "insensitive" },
        disponibilidade: true,
      },
      orderBy: { descricao: "asc" },
    });
  }

  async atualizar(id: string, dados: AtualizarProdutoInput) {
    const produto = await this.prisma.produto.findUnique({ where: { id } });
    if (!produto) {
      return null;
    }

    return await this.prisma.produto.update({
      where: { id },
      data: dados,
    });
  }

  async criar(dados: CriarProdutoInput, adminID: string) {
    return await this.prisma.produto.create({
      data: { ...dados, adminID },
    });
  }

  async excluir(id: string) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!produto) {
      return "NAO_ENCONTRADO" as const;
    }

    const itensPedido = await this.prisma.itensPedido.count({
      where: { produtoID: id },
    });
    if (itensPedido > 0) {
      return "EM_USO" as const;
    }

    await this.prisma.produto.delete({ where: { id } });
    return "EXCLUIDO" as const;
  }

  async PesquisarProdutoPorId(id: string) {
    return await this.prisma.produto.findFirst({
      where: { id: id, disponibilidade: true },
    });
  }

  async pesquisarTexto(termo: string) {
    return await this.prisma.produto.findMany({
      where: {
        OR: [
          { descricao: { contains: termo, mode: "insensitive" } },
          { categoria: { contains: termo, mode: "insensitive" } },
        ],
        disponibilidade: true,
      },
    });
  }

  async pesquisaPrecoMaximo(preco: number) {
    return await this.prisma.produto.findMany({
      where: { precoBase: { lte: preco }, disponibilidade: true },
    });
  }
}
