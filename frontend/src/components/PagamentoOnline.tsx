import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { PaymentIntent } from "@stripe/stripe-js";
import { Button, Spinner } from "flowbite-react";
import { Copy, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { confirmarPagamentoNoServidor, stripePromise } from "../utils/stripe";

type PagamentoOnlineProps = {
  pedidoId: number;
  clientSecret: string;
  total: number;
  nomeCliente: string;
  onPago: () => void;
  onVoltar: () => void;
};

// QR Code que o Stripe devolve em next_action (o Stripe.js não tipa esse campo)
type PixQrCode = {
  data: string; // código "Pix Copia e Cola"
  image_url_png: string;
  expires_at: number; // timestamp Unix, em segundos
};

const INTERVALO_VERIFICACAO_MS = 3000;

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

function lerPix(intencao: PaymentIntent): PixQrCode | null {
  const acao = intencao.next_action as {
    pix_display_qr_code?: PixQrCode;
  } | null;
  return acao?.pix_display_qr_code ?? null;
}

export function PagamentoOnline(props: PagamentoOnlineProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.clientSecret,
        locale: "pt-BR",
        appearance: {
          theme: "stripe",
          variables: { colorPrimary: "#c2410c", borderRadius: "8px" },
        },
      }}
    >
      <FormularioPagamento {...props} />
    </Elements>
  );
}

function FormularioPagamento({
  pedidoId,
  clientSecret,
  total,
  nomeCliente,
  onPago,
  onVoltar,
}: PagamentoOnlineProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processando, setProcessando] = useState(false);
  // Pix gerado (ou pagamento em processamento) esperando a confirmação do banco
  const [aguardando, setAguardando] = useState(false);
  const [pix, setPix] = useState<PixQrCode | null>(null);

  // onPago muda a cada render do carrinho; a ref evita reiniciar os efeitos
  const onPagoRef = useRef(onPago);
  useEffect(() => {
    onPagoRef.current = onPago;
  }, [onPago]);

  // A verificação periódica pode ver o pagamento aprovado mais de uma vez
  const finalizadoRef = useRef(false);
  const finalizar = useCallback(async () => {
    if (finalizadoRef.current) {
      return;
    }
    finalizadoRef.current = true;

    const pedido = await confirmarPagamentoNoServidor(pedidoId);
    if (!pedido) {
      toast.warning(
        `Pagamento recebido, mas não conseguimos avisar o restaurante. Se o pedido #${pedidoId} não aparecer em alguns minutos, fale conosco pelo WhatsApp.`,
        { duration: 15000 },
      );
    }
    onPagoRef.current();
  }, [pedidoId]);

  // Escolhe a próxima tela conforme o status do pagamento no Stripe
  const acompanhar = useCallback(
    async (intencao: PaymentIntent) => {
      if (intencao.status === "succeeded") {
        await finalizar();
        return;
      }
      const qrCode = lerPix(intencao);
      if (intencao.status === "processing" || qrCode) {
        setPix(qrCode);
        setAguardando(true);
      }
    },
    [finalizar],
  );

  // Ao reabrir o carrinho, retoma um Pix já gerado ou um pagamento já aprovado
  useEffect(() => {
    if (!stripe) {
      return;
    }
    let ativo = true;
    stripe
      .retrievePaymentIntent(clientSecret)
      .then(({ paymentIntent }) => {
        if (ativo && paymentIntent) {
          return acompanhar(paymentIntent);
        }
      })
      .catch((error) => console.error("Erro ao consultar pagamento:", error));
    return () => {
      ativo = false;
    };
  }, [stripe, clientSecret, acompanhar]);

  // O Pix é pago no app do banco: consulta o Stripe até ser aprovado ou expirar
  useEffect(() => {
    if (!stripe || !aguardando) {
      return;
    }
    const intervalo = setInterval(async () => {
      try {
        const { paymentIntent } =
          await stripe.retrievePaymentIntent(clientSecret);
        if (!paymentIntent) {
          return;
        }
        if (paymentIntent.status === "requires_payment_method") {
          setAguardando(false);
          setPix(null);
          toast.error(
            "O Pix expirou ou não foi concluído. Escolha a forma de pagamento e tente de novo.",
          );
          return;
        }
        await acompanhar(paymentIntent);
      } catch (error) {
        console.error("Erro ao consultar pagamento:", error);
      }
    }, INTERVALO_VERIFICACAO_MS);
    return () => clearInterval(intervalo);
  }, [stripe, aguardando, clientSecret, acompanhar]);

  const pagar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setProcessando(true);
    try {
      // Cartões são confirmados aqui mesmo (inclusive o 3D Secure). Se o
      // Stripe precisar redirecionar, ele volta para a página inicial com o
      // número do pedido, e o CarrinhoDrawer conclui a confirmação.
      const retorno = new URL("/", window.location.origin);
      retorno.searchParams.set("pedido", String(pedidoId));

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
        confirmParams: { return_url: retorno.toString() },
      });
      if (error) {
        toast.error(error.message ?? "Não foi possível concluir o pagamento.");
        return;
      }
      await acompanhar(paymentIntent);
    } finally {
      setProcessando(false);
    }
  };

  const copiarCodigoPix = async () => {
    if (!pix) {
      return;
    }
    try {
      await navigator.clipboard.writeText(pix.data);
      toast.success("Código Pix copiado.");
    } catch {
      toast.error("Não foi possível copiar. Selecione o código e copie.");
    }
  };

  if (aguardando) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto bg-fundo p-4 text-center">
          <h3 className="mb-1 text-lg font-bold text-secundaria">
            {pix ? "Pague com Pix" : "Pagamento em processamento"}
          </h3>
          <p className="mb-4 text-sm text-secundaria/70">
            Pedido #{pedidoId} · Total{" "}
            <strong className="text-secundaria">{formatarMoeda(total)}</strong>
          </p>

          {pix && (
            <>
              <p className="mb-3 text-sm text-secundaria/80">
                Abra o app do seu banco, escolha pagar com Pix e escaneie o QR
                Code ou use o Pix Copia e Cola.
              </p>
              <img
                src={pix.image_url_png}
                alt="QR Code do Pix"
                className="mx-auto mb-3 h-56 w-56 rounded-lg bg-white p-2"
              />
              <textarea
                readOnly
                value={pix.data}
                aria-label="Código Pix Copia e Cola"
                rows={3}
                onFocus={(event) => event.currentTarget.select()}
                className="mb-2 w-full resize-none rounded-lg border border-secundaria/20 bg-white p-2 text-xs text-secundaria"
              />
              <Button
                type="button"
                onClick={copiarCodigoPix}
                className="mx-auto mb-3 cursor-pointer bg-primaria text-white hover:bg-secundaria focus:ring-primaria"
              >
                <Copy aria-hidden="true" className="mr-2 h-4 w-4" />
                Copiar código Pix
              </Button>
              <p className="mb-4 text-xs text-secundaria/60">
                Válido até{" "}
                {new Date(pix.expires_at * 1000).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </>
          )}

          <p
            role="status"
            className="flex items-center justify-center gap-2 text-sm text-secundaria/80"
          >
            <Spinner size="sm" aria-hidden="true" />
            Aguardando a confirmação do pagamento...
          </p>
          <p className="mt-1 text-xs text-secundaria/60">
            O pedido vai para a cozinha assim que o pagamento for aprovado.
          </p>
        </div>

        <div className="flex gap-3 border-t border-secundaria/10 bg-fundo p-4">
          <Button
            type="button"
            onClick={() => {
              setAguardando(false);
              setPix(null);
            }}
            className="flex-1 cursor-pointer border border-secundaria/20 bg-fundo text-secundaria hover:bg-secundaria/5 focus:ring-primaria"
          >
            Trocar forma de pagamento
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={pagar} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto bg-fundo p-4">
        <h3 className="mb-1 text-lg font-bold text-secundaria">
          Pagamento online
        </h3>
        <p className="mb-4 text-sm text-secundaria/70">
          Pedido #{pedidoId} · Total{" "}
          <strong className="text-secundaria">{formatarMoeda(total)}</strong>
        </p>

        <PaymentElement
          options={{
            paymentMethodOrder: ["pix", "card"],
            defaultValues: { billingDetails: { name: nomeCliente } },
          }}
        />

        <p className="mt-4 flex items-start gap-2 text-xs text-secundaria/60">
          <LockKeyhole
            aria-hidden="true"
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
          />
          Pagamento processado pelo Stripe. Os dados do cartão e do Pix não
          passam pelo nosso servidor.
        </p>
      </div>

      <div className="flex gap-3 border-t border-secundaria/10 bg-fundo p-4">
        <Button
          type="button"
          onClick={onVoltar}
          disabled={processando}
          className="flex-1 cursor-pointer border border-secundaria/20 bg-fundo text-secundaria hover:bg-secundaria/5 focus:ring-primaria"
        >
          Voltar
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || processando}
          className="flex-1 cursor-pointer bg-primaria font-bold text-white hover:bg-secundaria focus:ring-primaria"
        >
          {processando ? "Processando..." : `Pagar ${formatarMoeda(total)}`}
        </Button>
      </div>
    </form>
  );
}
