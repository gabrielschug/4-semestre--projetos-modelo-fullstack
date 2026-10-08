import { z } from "zod";

export const produtoIdSchema = z.string();
export const termoPesquisaSchema = z.string();

export const atualizarProdutoSchema = z
  .object({
    descricao: z.string().trim().min(1, "Informe a descrição do produto"),
    categoria: z.string().trim().min(1, "Informe a categoria do produto"),
    precoBase: z.number().finite().nonnegative(),
    valorDesconto: z.number().finite().nonnegative().nullable(),
    disponibilidade: z.boolean(),
    especificacoes: z.string().nullable(),
    fraseVenda: z
      .string()
      .trim()
      .max(200, "A frase de venda deve ter no máximo 200 caracteres")
      .nullable()
      .optional(),
    fotoUrl: z.string().nullable(),
    tempoPreparoMinutos: z.number().int().nonnegative().nullable(),
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
