import { z } from "zod"
import { ModalEntrega } from "@prisma/client"
import { MetodoPagamento } from "@prisma/client"

export const planoSchema = z.object({

  ModalEntrega: z.enum(['DELIVERY','RETIRADA']),
  MetodoPagamento: z.enum(['DINHEIRO', 'MAQUININHA_CARTAO']),
  anotacaoCliente: z.string().trim().max(200)
})