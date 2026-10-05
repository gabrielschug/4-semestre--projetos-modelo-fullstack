import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PedidoCard } from "./components/PedidoCard";
import { useClienteStore } from "./context/ClienteContext";
import type { PedidoType } from "./utils/PedidoType";

const apiUrl = import.meta.env.VITE_API_URL;

export default function MeusPedidos() {
  const cliente = useClienteStore((state) => state.cliente);
  const logaCliente = useClienteStore((state) => state.logaCliente);
  const [pedidos, setPedidos] = useState<PedidoType[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [clienteDesconhecido, setClienteDesconhecido] = useState(false);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState("");
  const [acaoEmAndamento, setAcaoEmAndamento] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function buscaPedidos() {
      setCarregando(true);
      setErro("");
      setClienteDesconhecido(false);

      try {
        if (!cliente.id) {
          const clienteIDSalvo = localStorage.getItem("clienteKey");
          if (!clienteIDSalvo) {
            setClienteDesconhecido(true);
            return;
          }

          const respostaCliente = await fetch(
            `${apiUrl}/clientes/${clienteIDSalvo}`,
          );
          if (!respostaCliente.ok) {
            localStorage.removeItem("clienteKey");
            setClienteDesconhecido(true);
            return;
          }

          const clienteCarregado = await respostaCliente.json();
          if (!cancelado) {
            logaCliente(clienteCarregado);
          }
          return;
        }

        const response = await fetch(`${apiUrl}/pedidos/cliente/${cliente.id}`);
        if (!response.ok) {
          throw new Error(`Falha ao buscar pedidos: HTTP ${response.status}`);
        }

        const dados: PedidoType[] = await response.json();
        if (!cancelado) {
          setPedidos(dados);
        }
      } catch (error) {
        console.error("Erro ao buscar pedidos do cliente:", error);
        if (!cancelado) {
          setErro("Não foi possível carregar seus pedidos. Tente novamente.");
        }
      } finally {
        if (!cancelado) {
          setCarregando(false);
        }
      }
    }

    buscaPedidos();
    return () => {
      cancelado = true;
    };
  }, [cliente.id, logaCliente]);

  const cancelarPedido = async (pedidoID: string) => {
    if (!cliente.id) return;

    setAcaoEmAndamento(pedidoID);
    setErro("");
    setFeedback("");
    try {
      const response = await fetch(
        `${apiUrl}/pedidos/cliente/${cliente.id}/${pedidoID}/cancelar`,
        { method: "PATCH" },
      );
      const resultado = await response.json();
      if (!response.ok) {
        throw new Error(
          resultado.error || "Não foi possível cancelar o pedido",
        );
      }

      setPedidos((atuais) =>
        atuais.map((pedido) =>
          pedido.id === pedidoID ? { ...pedido, status: "CANCELADO" } : pedido,
        ),
      );
      setFeedback("Pedido cancelado com sucesso.");
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error);
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível cancelar o pedido.",
      );
    } finally {
      setAcaoEmAndamento("");
    }
  };

  const avaliarItem = async (
    pedidoID: string,
    itemID: string,
    avaliacao: number,
  ) => {
    if (!cliente.id) return;

    const chaveAcao = `${pedidoID}:${itemID}`;
    setAcaoEmAndamento(chaveAcao);
    setErro("");
    setFeedback("");
    try {
      const response = await fetch(
        `${apiUrl}/pedidos/cliente/${cliente.id}/${pedidoID}/itens/${itemID}/avaliacao`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avaliacao }),
        },
      );
      const resultado = await response.json();
      if (!response.ok) {
        throw new Error(
          resultado.error || "Não foi possível salvar a avaliação",
        );
      }

      setPedidos((atuais) =>
        atuais.map((pedido) =>
          pedido.id === pedidoID
            ? {
                ...pedido,
                itens: pedido.itens.map((item) =>
                  item.id === itemID
                    ? { ...item, avaliacao: resultado.avaliacao }
                    : item,
                ),
              }
            : pedido,
        ),
      );
      setFeedback("Sua avaliação foi registrada.");
    } catch (error) {
      console.error("Erro ao avaliar produto:", error);
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a avaliação.",
      );
    } finally {
      setAcaoEmAndamento("");
    }
  };

  if (carregando) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 text-center text-gray-600">
        Carregando seus pedidos...
      </main>
    );
  }

  if (clienteDesconhecido) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 text-center">
        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Entre na sua conta para acompanhar seus pedidos
        </h1>
        <Link
          to="/login"
          className="font-semibold text-orange-700 hover:text-orange-800"
        >
          Fazer login
        </Link>
      </main>
    );
  }

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 gap-4 sm:flex sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Meus Pedidos
            </h2>
          </div>

          {erro && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-gray-800 dark:text-red-400"
            >
              {erro}
            </p>
          )}
          {feedback && (
            <p
              role="status"
              className="mb-4 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-gray-800 dark:text-green-400"
            >
              {feedback}
            </p>
          )}

          {pedidos.length === 0 ? (
            <p className="rounded-lg bg-gray-100 p-6 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              Você ainda não fez nenhum pedido.
            </p>
          ) : (
            <div className="mt-6 flow-root sm:mt-8">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {pedidos.map((pedido) => (
                  <PedidoCard
                    key={pedido.id}
                    pedido={pedido}
                    acaoEmAndamento={acaoEmAndamento}
                    onCancelar={cancelarPedido}
                    onAvaliar={avaliarItem}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
