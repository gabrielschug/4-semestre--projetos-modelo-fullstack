import {z} from "zod"

import {planoSchema} from "../schemas/pedidoSchema"

export type CriarPedidosInput = z.infer<typeof planoSchema>

export type ModalEntrega = "DELIVERY" | "RETIRADA"

export type MetodoPagamento = "DINHEIRO" |"MAQUININHA_CARTAO"