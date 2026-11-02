import { z } from "zod";

export const produtoIdSchema = z.coerce.number().int().positive();
export const termoPesquisaSchema = z.string();

export const atualizarProdutoSchema = z
  .object({
    descricao: z.string().trim().min(1, "Informe a descrição do produto"),
    categoria: z.string().trim().min(1, "Informe a categoria do produto"),
    precoBase: z.coerce.number().finite().nonnegative(),
    valorDesconto: z.coerce.number().finite().nonnegative().nullable(),
    disponibilidade: z.preprocess((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    }, z.boolean().optional()),
    especificacoes: z.string().nullable(),
    fraseVenda: z
      .string()
      .trim()
      .max(200, "A frase de venda deve ter no máximo 200 caracteres")
      .nullable()
      .optional(),
    fotoUrl: z.string().nullable().optional(),
    tempoPreparoMinutos: z.coerce.number().int().nonnegative().nullable(),
  })
  .strict();

export const criarProdutoSchema = atualizarProdutoSchema;

export const gerarFraseVendaSchema = z.object({
  descricao: z.string().trim().min(1, "Informe a descrição do produto"),
  categoria: z.string().trim().nullable().optional(),
  especificacoes: z.string().trim().nullable().optional(),
});

export type AtualizarProdutoInput = z.infer<typeof atualizarProdutoSchema>;
export type CriarProdutoInput = z.infer<typeof criarProdutoSchema>;
export type GerarFraseVendaInput = z.infer<typeof gerarFraseVendaSchema>;
