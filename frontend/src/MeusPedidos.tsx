import { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useClienteStore } from "./context/ClienteContext";

const apiUrl = import.meta.env.VITE_API_URL;

type ItemPedidoType = {
  id: string;
  produtoID: string;
  avaliacao: number | null;
  produto: { descricao: string };
};

type PedidoType = {
  id: string;
  status: string;
  dataHora: string;
  tempoTotalEstimadoMinutos: number;
  modalEntrega: "DELIVERY" | "RETIRADA";
  valorTotal: number;
  itens: ItemPedidoType[];
};

const statusPedido: Record<string, string> = {
  PENDENTE: "Pendente",
  PREPARANDO: "Em preparo",
  PRONTO: "Pronto",
  EM_ROTA: "Saiu para entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

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

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

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
                  <div
                    key={pedido.id}
                    className="flex flex-wrap items-start gap-y-4 py-6"
                  >
                    <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
                      <dt className="text-base font-medium text-gray-500  dark:text-gray-400 justify-start">
                        Pedido:
                      </dt>
                      <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                        #{pedido.id}
                      </dd>
                    </dl>

                    <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
                      <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
                        Data:
                      </dt>
                      <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                        {new Date(pedido.dataHora).toLocaleDateString("pt-BR")}
                      </dd>
                    </dl>

                    <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
                      <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
                        Preço:
                      </dt>
                      <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                        {formatarMoeda(pedido.valorTotal)}
                      </dd>
                    </dl>

                    <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
                      <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
                        Status:
                      </dt>
                      <dd
                        className={`me-2 mt-1.5 inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
                          pedido.status === "PENDENTE"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            : pedido.status === "ENTREGUE"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : pedido.status === "CANCELADO"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
                        }`}
                      >
                        {statusPedido[pedido.status] ?? pedido.status}
                      </dd>
                    </dl>

                    {/* Secções adicionais em lista completa no mobile (w-full) */}
                    <dl className="w-full sm:w-1/2 lg:w-auto lg:flex-1">
                      <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
                        Entrega:
                      </dt>
                      <dd className="mt-1.5 text-sm text-gray-900 dark:text-white">
                        {pedido.modalEntrega === "DELIVERY"
                          ? "Delivery"
                          : "Retirada"}{" "}
                        ({pedido.tempoTotalEstimadoMinutos} min)
                      </dd>
                    </dl>

                    <dl className="w-full lg:w-[260px] xl:w-auto lg:flex-1">
                      <dt className="text-base font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                        Produtos e Avaliação:
                      </dt>
                      <dd>
                        <ul className="space-y-3">
                          {pedido.itens.map((item) => (
                            <li key={item.id} className="flex flex-col gap-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {item.produto.descricao}
                              </p>
                              {pedido.status === "ENTREGUE" ? (
                                <div
                                  className="flex items-center gap-1"
                                  role="group"
                                  aria-label={`Avaliação de ${item.produto.descricao}`}
                                >
                                  {[1, 2, 3, 4, 5].map((estrela) => (
                                    <button
                                      key={estrela}
                                      type="button"
                                      disabled={
                                        acaoEmAndamento ===
                                        `${pedido.id}:${item.id}`
                                      }
                                      onClick={() =>
                                        avaliarItem(pedido.id, item.id, estrela)
                                      }
                                      className="rounded p-0.5 text-amber-500 hover:text-amber-600 disabled:cursor-wait disabled:opacity-50"
                                    >
                                      <Star
                                        className="h-4 w-4"
                                        fill={
                                          item.avaliacao !== null &&
                                          item.avaliacao >= estrela
                                            ? "currentColor"
                                            : "none"
                                        }
                                      />
                                    </button>
                                  ))}
                                  <span className="ml-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {item.avaliacao
                                      ? `${item.avaliacao}/5`
                                      : "Avalie"}
                                  </span>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Avaliação após entrega
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </dl>

                    {/* Botões: Empilhados (flex-col e w-full) no mobile, alinhados à direita no desktop */}
                    <div className="mt-4 flex w-full flex-col gap-3 sm:mt-0 sm:grid sm:grid-cols-2 lg:flex lg:w-auto lg:min-w-[280px] lg:items-center lg:justify-end">
                      {pedido.status === "PENDENTE" && (
                        <Button
                          color="red"
                          outline
                          className="w-full lg:w-auto cursor-poiter"
                          disabled={acaoEmAndamento === pedido.id}
                          onClick={() => cancelarPedido(pedido.id)}
                        >
                          {acaoEmAndamento === pedido.id
                            ? "Cancelando..."
                            : "Cancelar pedido"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
