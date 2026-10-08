import { z } from "zod";

export const checkoutSchema = z
  .object({
    nome: z.string()
    .trim()
    .min(3, "O nome precisa ter pelo menos 3 letras"),
    telefone: z
    .string()
    .min(1, "O telefone é obrigatório")
    .transform((val) =>val.replace(/\D/g,''))
    .refine((val) => /^\d{2}9\d{8}$/.test(val),{
      message:"O telefone deve conter o DDD de 2 dígitos seguido de um celular com 9 dígitos"
    }),
    modalEntrega: z.enum(["DELIVERY", "RETIRADA"]),
    pagamento: z.enum(["DINHEIRO", "MAQUININHA_CARTAO"]),
    bairroID: z.string().trim().optional(),
    rua: z.string().trim().optional(),
    numero: z.string().trim().optional(),
    anotacaoGeral: z.string().trim().optional(),
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
