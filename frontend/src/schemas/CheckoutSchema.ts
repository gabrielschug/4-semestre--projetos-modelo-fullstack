import { z } from "zod";

export const checkoutSchema = z
  .object({
    nome: z.string().min(3, "O nome precisa ter pelo menos 3 letras"),
    telefone: z.string().min(10, "Telefone inválido"),
    modalEntrega: z.enum(["DELIVERY", "RETIRADA"]),
    pagamento: z.enum(["DINHEIRO", "MAQUININHA_CARTAO"]),
    bairroID: z.string().optional(),
    rua: z.string().optional(),
    numero: z.string().optional(),
    anotacaoGeral: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.modalEntrega === "DELIVERY") {
      if (!data.bairroID || data.bairroID === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecione um bairro",
          path: ["bairroID"],
        });
      }

      if (!data.rua || data.rua.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A rua é obrigatória para entrega",
          path: ["rua"],
        });
      }

      if (!data.numero || data.numero.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O número é obrigatório",
          path: ["numero"],
        });
      }
    }
  });

export type CheckoutData = z.infer<typeof checkoutSchema>;
