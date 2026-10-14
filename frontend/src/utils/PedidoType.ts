import type { ItemPedidoType } from "./ItemPedidoType";

export type PedidoType = {
  id: number;
  status: string;
  dataHora: string;
  tempoTotalEstimadoMinutos: number;
  modalEntrega: "DELIVERY" | "RETIRADA";
  valorTotal: number;
  itens: ItemPedidoType[];
};
