export interface ProdutoType{
    id: string
    descricao: string
    categoria: string
    precoBase: number
    valorDesconto: number
    disponibilidade: boolean
    especificacoes: string | null
    fotoUrl: string
    tempoPreparoMinutos: number
    adminID: string
}