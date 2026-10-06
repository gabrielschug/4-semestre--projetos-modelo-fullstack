import { z } from "zod";

export const adminCadastroSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo"),
  email: z.string().trim().email("Informe um e-mail válido"),
  senha: z.string(),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido"),
  senha: z.string(),
});
