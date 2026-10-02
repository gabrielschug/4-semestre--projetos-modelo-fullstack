import { create } from "zustand";
import type { ProdutoType } from "../utils/ProdutoType";

export interface ItemCarrinho {
  produto: ProdutoType;
  quantidade: number;
  observacao: string;
}

interface CarrinhoState {
  itens: ItemCarrinho[];
  adicionarAoCarrinho: (item: ItemCarrinho) => void;
}

export const useCarrinho = create<CarrinhoState>((set) => ({
  itens: [],
  adicionarAoCarrinho: (novoItem) =>
    set((state) => ({
      itens: [...state.itens, novoItem],
    })),
}));
