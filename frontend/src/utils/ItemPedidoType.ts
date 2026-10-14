export type ItemPedidoType = {
  id: number;
  produtoID: number;
  avaliacao: number | null;
  produto: { descricao: string };
};
