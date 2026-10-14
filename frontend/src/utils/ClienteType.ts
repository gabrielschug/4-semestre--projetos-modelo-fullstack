import type { BairroType } from "./BairroType";

export type ClienteType = {
  id: string;
  nome: string;
  telefone: string;
  enderecos?: {
    id: number;
    titulo: string;
    rua: string;
    numero: string;
    obs: string | null;
    bairroID: number;
    bairro: BairroType;
  }[];
};
