import type { BairroType } from './BairroType'

export type ClienteType = {
    id: string
    nome: string
    telefone: string
    rua: string
    numero: string
    obs: string | null
    bairroID: string
    bairro?: BairroType
}
