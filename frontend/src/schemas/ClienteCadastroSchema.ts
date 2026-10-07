import { z } from "zod";

export const clienteCadastroSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo"),
  telefone: z
    .string()
    .trim()
    .min(10, "Telefone inválido, informe DDD + número")
    .max(11, "Telefone inválido, informe DDD + número")
    .regex(/^\d+$/, "O telefone deve conter apenas números"),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  rua: z.string().trim().min(1, "Informe a rua"),
  numero: z.string().trim().min(1, "Informe o número"),
  obs: z.string().trim().max(200, "Observação muito longa").optional(),
  bairroID: z.string().uuid("Selecione um bairro válido"),
});

export type CadastrarClienteInput = z.infer<typeof clienteCadastroSchema>;
