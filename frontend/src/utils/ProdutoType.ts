export interface ProdutoType{
    id: string
    descricao: string
    categoria: string
    precoBase: number
    valorDesconto: number | null
    disponibilidade: boolean
    especificacoes: string | null
    fotoUrl: string | null
    tempoPreparoMinutos: number | null
    adminID: string
}

export function calcularPrecoFinal(
    produto: Pick<ProdutoType, "precoBase" | "valorDesconto">,
): number {
    return produto.precoBase - (produto.valorDesconto ?? 0)
}

export type ProdutoEdicaoType = Pick<
    ProdutoType,
    | "descricao"
    | "categoria"
    | "precoBase"
    | "valorDesconto"
    | "disponibilidade"
    | "especificacoes"
    | "fotoUrl"
    | "tempoPreparoMinutos"
>