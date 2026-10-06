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
    fotoUrl: z.string().nullable(),
    tempoPreparoMinutos: z.number().int().nonnegative().nullable(),
  })
  .strict();

export const criarProdutoSchema = atualizarProdutoSchema;

export type AtualizarProdutoInput = z.infer<typeof atualizarProdutoSchema>;
export type CriarProdutoInput = z.infer<typeof criarProdutoSchema>;
