export type StatusPedido =
  | "PENDENTE"
  | "PREPARANDO"
  | "PRONTO"
  | "EM_ROTA"
  | "ENTREGUE"
  | "CANCELADO";

export type PedidoAdmin = {
  id: number;
  status: StatusPedido;
  dataHora: string;
  tempoTotalEstimadoMinutos: number;
  modalEntrega: "DELIVERY" | "RETIRADA";
  pagamento: "DINHEIRO" | "MAQUININHA_CARTAO";
  valorTotal: number;
  anotacaoCliente: string | null;
  cliente: {
    nome: string;
    telefone: string;
  };
  ruaEntrega: string | null;
  numeroEntrega: string | null;
  nomeBairroEntrega: string | null;
  valorTaxaEntrega: number | null;
  itens: {
    id: number;
    quantidade: number;
    precoProduto: number;
    produto: { descricao: string };
  }[];
};
