import { z } from "zod";

export const criarPedidoSchema = z.object({
  cliente: z.object({
    nome: z
      .string()
      .min(5, "O nome e sobrenome precisa ter pelo menos 5 caracteres"),
    telefone: z.string().max(12).min(10, "Telefone inválido"),
  }),
  pedido: z.object({
    modalEntrega: z.enum(["DELIVERY", "RETIRADA"], {
      error: "Modalidade de entrega é obrigatória",
    }),
    pagamento: z.enum(["DINHEIRO", "MAQUININHA_CARTAO"], {
      error: "Forma de pagamento é obrigatória",
    }),
    valorTotal: z.number().positive("O valor total deve ser positivo"),
    anotacaoGeral: z.string().optional(),
    ruaEntrega: z.string().optional(),
    numeroEntrega: z.string().optional(),
    valorTaxaEntrega: z.number().gte(0).optional(),
    nomeBairroEntrega: z.string().optional(),
    itens: z
      .array(
        z.object({
          produtoID: z.number().int().positive("ID do produto inválido"),
          nomeProduto: z.string(),
          quantidade: z
            .number()
            .int()
            .positive("A quantidade deve ser maior que zero"),
          precoProduto: z.number().positive(),
          observacao: z.string().optional(),
        }),
      )
      .min(1, "O pedido precisa ter pelo menos um item"),
  }),
});
