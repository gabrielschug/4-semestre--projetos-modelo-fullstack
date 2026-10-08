export type StatusPedido =
  | "PENDENTE"
  | "PREPARANDO"
  | "PRONTO"
  | "EM_ROTA"
  | "ENTREGUE"
  | "CANCELADO";

export type PedidoAdmin = {
  id: string;
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
    rua: string;
    numero: string;
    bairro: { bairro: string };
  };
  itens: {
    id: string;
    quantidade: number;
    precoProduto: number;
    produto: { descricao: string };
  }[];
};
