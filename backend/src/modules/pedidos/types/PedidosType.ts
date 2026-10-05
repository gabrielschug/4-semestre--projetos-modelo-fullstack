import { z } from "zod";

import { criarPedidoSchema } from "../schemas/PedidoSchema";

// DTO (Data Transfer Object)
// z.infer extrai a tipagem do Schema. Se mudar a regra no Zod, o DTO atualiza automatico
export type CriarPedidoDTO = z.infer<typeof criarPedidoSchema>;
