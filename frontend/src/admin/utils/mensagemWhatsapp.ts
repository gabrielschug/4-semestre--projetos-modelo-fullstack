import type { PedidoAdmin, StatusPedido } from "./AdminPedidoType";

const nomeRestaurante = "Minuta Campeira";

const nomesPagamento: Record<PedidoAdmin["pagamento"], string> = {
  DINHEIRO: "Dinheiro",
  MAQUININHA_CARTAO: "Cartão (maquininha)",
};

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

const numeroPedido = (pedido: PedidoAdmin) =>
  pedido.id.slice(0, 8).toUpperCase();

const enderecoCliente = (pedido: PedidoAdmin) =>
  `${pedido.cliente.rua}, ${pedido.cliente.numero} · ${pedido.cliente.bairro.bairro}`;

// O cadastro guarda só DDD + número; o wa.me exige o código do país
export function linkWhatsapp(telefone: string, mensagem: string) {
  const digitos = telefone.replace(/\D/g, "");
  const numero = digitos.length <= 11 ? `55${digitos}` : digitos;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export function mensagemResumoPedido(pedido: PedidoAdmin) {
  const subtotal = pedido.itens.reduce(
    (soma, item) => soma + item.quantidade * item.precoProduto,
    0,
  );
  const taxaEntrega = pedido.valorTotal - subtotal;
  const ehDelivery = pedido.modalEntrega === "DELIVERY";

  const linhas = [
    `Olá, *${pedido.cliente.nome}*! 👋`,
    `Recebemos seu pedido *#${numeroPedido(pedido)}* no ${nomeRestaurante}.`,
    "",
    "*Itens*",
    ...pedido.itens.map(
      (item) =>
        `• ${item.quantidade}x ${item.produto.descricao} — ${formatarMoeda(item.quantidade * item.precoProduto)}`,
    ),
    "",
    `Subtotal: ${formatarMoeda(subtotal)}`,
  ];

  if (ehDelivery && taxaEntrega > 0.009) {
    linhas.push(`Taxa de entrega: ${formatarMoeda(taxaEntrega)}`);
  }

  linhas.push(
    `*Total: ${formatarMoeda(pedido.valorTotal)}*`,
    "",
    `Pagamento: ${nomesPagamento[pedido.pagamento] ?? pedido.pagamento}`,
    ehDelivery
      ? `Entrega em: ${enderecoCliente(pedido)}`
      : "Retirada no local",
    `Tempo estimado: ${pedido.tempoTotalEstimadoMinutos} min`,
  );

  if (pedido.anotacaoCliente) {
    linhas.push(`Observações: ${pedido.anotacaoCliente}`);
  }

  linhas.push(
    "",
    ehDelivery
      ? "Avisaremos por aqui quando seu pedido sair para entrega."
      : "Avisaremos por aqui quando seu pedido estiver pronto para retirada.",
  );

  return linhas.join("\n");
}

export function mensagemSaiuParaEntrega(pedido: PedidoAdmin) {
  return [
    `Olá, *${pedido.cliente.nome}*! 🛵`,
    `Seu pedido *#${numeroPedido(pedido)}* saiu para entrega e logo chega em ${enderecoCliente(pedido)}.`,
    "",
    `Total a pagar: *${formatarMoeda(pedido.valorTotal)}* (${nomesPagamento[pedido.pagamento] ?? pedido.pagamento})`,
    "",
    `Obrigado pela preferência! — ${nomeRestaurante}`,
  ].join("\n");
}

export function mensagemProntoParaRetirada(pedido: PedidoAdmin) {
  return [
    `Olá, *${pedido.cliente.nome}*! ✅`,
    `Seu pedido *#${numeroPedido(pedido)}* está pronto para retirada.`,
    "",
    `Total a pagar: *${formatarMoeda(pedido.valorTotal)}* (${nomesPagamento[pedido.pagamento] ?? pedido.pagamento})`,
    "",
    `Obrigado pela preferência! — ${nomeRestaurante}`,
  ].join("\n");
}

// Mensagem a abrir automaticamente quando o pedido avança de etapa
export function mensagemMudancaStatus(
  pedido: PedidoAdmin,
  novoStatus: StatusPedido,
) {
  if (pedido.status === "PRONTO" && novoStatus === "EM_ROTA") {
    return mensagemSaiuParaEntrega(pedido);
  }
  if (
    pedido.modalEntrega === "RETIRADA" &&
    pedido.status === "PREPARANDO" &&
    novoStatus === "PRONTO"
  ) {
    return mensagemProntoParaRetirada(pedido);
  }
  return null;
}

// Mensagem do botão do card, conforme a etapa em que o pedido está
export function mensagemDoCard(pedido: PedidoAdmin) {
  if (pedido.status === "EM_ROTA") {
    return { rotulo: "Avisar saída", texto: mensagemSaiuParaEntrega(pedido) };
  }
  if (pedido.status === "PRONTO" && pedido.modalEntrega === "RETIRADA") {
    return {
      rotulo: "Avisar retirada",
      texto: mensagemProntoParaRetirada(pedido),
    };
  }
  return { rotulo: "Enviar resumo", texto: mensagemResumoPedido(pedido) };
}
