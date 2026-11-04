import type Stripe from "stripe";
import { stripe } from "../../../lib/stripe";
import { PagamentoRepository } from "../repositories/PagamentoRepository";

type PedidoPagamento = NonNullable<
  Awaited<ReturnType<PagamentoRepository["buscarPedido"]>>
>;

const emCentavos = (valor: number) => Math.round(valor * 100);

// Tempo para o cliente pagar o Pix antes de o QR Code expirar
const VALIDADE_PIX_SEGUNDOS = 30 * 60;

export class PagamentoService {
  constructor(private readonly pagamentoRepository: PagamentoRepository) {}

  get disponivel() {
    return stripe !== null;
  }

  // Cria a cobrança no Stripe e devolve o client_secret que o navegador
  // usa para mostrar o formulário de pagamento
  async criarIntencaoPagamento(pedidoID: number, valorTotal: number) {
    if (!stripe) {
      throw new Error("Pagamento online indisponível no momento.");
    }

    const intencao = await stripe.paymentIntents.create({
      amount: emCentavos(valorTotal),
      currency: "brl",
      // "card" cobre cartões de crédito e de débito; o Pix precisa estar
      // ativado em https://dashboard.stripe.com/settings/payment_methods
      allowed_payment_method_types: ["card", "pix"],
      payment_method_options: {
        pix: { expires_after_seconds: VALIDADE_PIX_SEGUNDOS },
      },
      description: `Pedido #${pedidoID} - Minuta Campeira`,
      metadata: { pedidoId: String(pedidoID) },
    });
    if (!intencao.client_secret) {
      throw new Error("O Stripe não retornou o client_secret do pagamento.");
    }

    await this.pagamentoRepository.salvarPaymentIntent(pedidoID, intencao.id);
    return intencao.client_secret;
  }

  // Quem decide se o pedido foi pago é o Stripe, não o navegador
  async confirmarPagamento(pedidoID: number) {
    const pedido = await this.pagamentoRepository.buscarPedido(pedidoID);
    if (
      !pedido ||
      pedido.pagamento !== "ONLINE" ||
      !pedido.stripePaymentIntentId
    ) {
      return { resultado: "NAO_ENCONTRADO" as const };
    }
    if (pedido.pagoEm) {
      return { resultado: "PAGO" as const, pedido };
    }
    if (!stripe) {
      return { resultado: "INDISPONIVEL" as const };
    }

    const intencao = await stripe.paymentIntents.retrieve(
      pedido.stripePaymentIntentId,
    );
    if (!this.pagamentoAprovado(intencao, pedido)) {
      return { resultado: "NAO_PAGO" as const, status: intencao.status };
    }

    await this.pagamentoRepository.marcarComoPago(intencao.id);
    return { resultado: "PAGO" as const, pedido };
  }

  // Garante a confirmação mesmo se o cliente fechar a página logo após pagar
  async processarWebhook(corpo: Buffer, assinatura: string) {
    const segredo = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripe || !segredo) {
      throw new Error("Webhook do Stripe não configurado.");
    }

    // constructEvent confere a assinatura: só o Stripe consegue gerar o evento
    const evento = stripe.webhooks.constructEvent(corpo, assinatura, segredo);
    if (evento.type !== "payment_intent.succeeded") {
      return;
    }

    const intencao = evento.data.object;
    const pedidoID = Number(intencao.metadata.pedidoId);
    if (!Number.isInteger(pedidoID)) {
      return;
    }

    const pedido = await this.pagamentoRepository.buscarPedido(pedidoID);
    if (pedido && this.pagamentoAprovado(intencao, pedido)) {
      await this.pagamentoRepository.marcarComoPago(intencao.id);
    }
  }

  private pagamentoAprovado(
    intencao: Stripe.PaymentIntent,
    pedido: PedidoPagamento,
  ) {
    return (
      intencao.status === "succeeded" &&
      intencao.id === pedido.stripePaymentIntentId &&
      intencao.amount_received === emCentavos(pedido.valorTotal)
    );
  }
}
