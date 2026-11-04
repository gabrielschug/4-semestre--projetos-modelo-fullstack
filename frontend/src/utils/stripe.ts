import { loadStripe } from "@stripe/stripe-js";

const apiUrl = import.meta.env.VITE_API_URL;
const chavePublicavel = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Sem a chave publicável, a opção "Pagar online" não aparece no carrinho
export const stripePromise = chavePublicavel
  ? loadStripe(chavePublicavel)
  : null;

export type PedidoPagoOnline = {
  pedidoId: number;
  tempoEstimadoMinutos: number;
  modalEntrega: "DELIVERY" | "RETIRADA";
};

// Avisa o backend, que consulta o Stripe e libera o pedido para a cozinha.
// Tenta de novo algumas vezes porque o cliente já pagou neste ponto.
export async function confirmarPagamentoNoServidor(
  pedidoId: number,
): Promise<PedidoPagoOnline | null> {
  const tentativas = 3;
  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    try {
      const response = await fetch(
        `${apiUrl}/pagamentos/pedidos/${pedidoId}/confirmar`,
        { method: "POST" },
      );
      if (response.ok) {
        const dados = await response.json();
        if (
          typeof dados.pedidoId === "number" &&
          typeof dados.tempoTotalEstimadoMinutos === "number" &&
          (dados.modalEntrega === "DELIVERY" ||
            dados.modalEntrega === "RETIRADA")
        ) {
          return {
            pedidoId: dados.pedidoId,
            tempoEstimadoMinutos: dados.tempoTotalEstimadoMinutos,
            modalEntrega: dados.modalEntrega,
          };
        }
        console.error("Resposta de confirmação inválida:", dados);
        return null;
      }
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
    }
    if (tentativa < tentativas) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  return null;
}
