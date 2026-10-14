export interface ProdutoType {
  id: number;
  descricao: string;
  categoria: string;
  precoBase: number;
  valorDesconto: number | null;
  disponibilidade: boolean;
  especificacoes: string | null;
  fraseVenda: string | null;
  fotoUrl: string | null;
  tempoPreparoMinutos: number | null;
  adminID: string;
}

export function validarListaProdutos(dados: unknown): ProdutoType[] {
  if (!Array.isArray(dados)) {
    throw new Error("Resposta inválida: era esperada uma lista de produtos.");
  }

  return dados as ProdutoType[];
}

export function calcularPrecoFinal(
  produto: Pick<ProdutoType, "precoBase" | "valorDesconto">,
): number {
  return produto.precoBase - (produto.valorDesconto ?? 0);
}

export type ProdutoEdicaoType = Pick<
  ProdutoType,
  | "descricao"
  | "categoria"
  | "precoBase"
  | "valorDesconto"
  | "disponibilidade"
  | "especificacoes"
  | "fraseVenda"
  | "fotoUrl"
  | "tempoPreparoMinutos"
>;
