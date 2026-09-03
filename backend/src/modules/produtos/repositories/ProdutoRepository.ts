import { prisma } from "../../../lib/prisma";

export class ProdutoRepository {

  async listarProdutosDisponiveis() {
    
    return await prisma.produto.findMany({
      where: { disponibilidade: true },
      select: {
        id: true,
        descricao: true,
        categoria: true,
        precoBase: true,
        valorDesconto: true,
        especificacoes: true,
        fotoUrl: true,
        tempoPreparoMinutos: true,
      },
      orderBy: { categoria: 'asc' },
    });
  }
}