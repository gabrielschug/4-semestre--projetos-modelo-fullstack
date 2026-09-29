import { z } from "zod"

import { clienteCadastroSchema, clienteLoginSchema } from "../schemas/ClienteSchema"

export type CadastrarClienteInput = z.infer<typeof clienteCadastroSchema>

export type LoginClienteInput = z.infer<typeof clienteLoginSchema>
