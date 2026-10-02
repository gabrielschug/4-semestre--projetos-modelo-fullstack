import { create } from "zustand";
import type { ProdutoType } from "../utils/ProdutoType";

export interface ItemCarrinho {
  id_item_carrinho: string;
  produto: ProdutoType;
  quantidade: number;
  observacao: string;
}

interface CarrinhoState {
  itens: ItemCarrinho[];
  adicionarAoCarrinho: (item: ItemCarrinho) => void;
  abrirDrawer: () => void;
  fecharDrawer: () => void;
  drawerAberto: boolean;
}

export const useCarrinho = create<CarrinhoState>((set) => ({
  itens: [],
  drawerAberto: false,
  adicionarAoCarrinho: (novoItem) =>
    set((state) => ({
      itens: [...state.itens, novoItem],
    })),
  abrirDrawer: () => set({ drawerAberto: true }),
  fecharDrawer: () => set({ drawerAberto: false }),
}));
