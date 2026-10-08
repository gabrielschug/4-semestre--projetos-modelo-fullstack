export type ItemPedidoType = {
  id: string;
  produtoID: string;
  avaliacao: number | null;
  produto: { descricao: string };
};
