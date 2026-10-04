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

        const response = await fetch(
          `${apiUrl}/pedidos/cliente/${cliente.id}`,
        );
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
        throw new Error(resultado.error || "Não foi possível cancelar o pedido");
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
        throw new Error(resultado.error || "Não foi possível salvar a avaliação");
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
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Meus Pedidos</h1>

      {erro && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          {erro}
        </p>
      )}
      {feedback && (
        <p
          role="status"
          className="mb-4 rounded-lg bg-green-50 p-4 text-green-700"
        >
          {feedback}
        </p>
      )}

      {pedidos.length === 0 ? (
        <p className="rounded-lg bg-gray-100 p-6 text-gray-700">
          Você ainda não fez nenhum pedido.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-sm">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeadCell>Pedido</TableHeadCell>
                <TableHeadCell>Data</TableHeadCell>
                <TableHeadCell>Produtos e avaliação</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Entrega</TableHeadCell>
                <TableHeadCell>Previsão</TableHeadCell>
                <TableHeadCell>Total</TableHeadCell>
                <TableHeadCell>Ações</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {pedidos.map((pedido) => (
                <TableRow
                  key={pedido.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {pedido.id}
                  </TableCell>
                  <TableCell>
                    {new Date(pedido.dataHora).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <ul className="space-y-3">
                      {pedido.itens.map((item) => (
                        <li key={item.id}>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {item.produto.descricao}
                          </p>
                          {pedido.status === "ENTREGUE" ? (
                            <div
                              className="mt-1 flex items-center gap-1"
                              role="group"
                              aria-label={`Avaliação de ${item.produto.descricao}`}
                            >
                              {[1, 2, 3, 4, 5].map((estrela) => (
                                <button
                                  key={estrela}
                                  type="button"
                                  title={`${estrela} ${
                                    estrela === 1 ? "estrela" : "estrelas"
                                  }`}
                                  aria-label={`Avaliar ${item.produto.descricao} com ${estrela} ${
                                    estrela === 1 ? "estrela" : "estrelas"
                                  }`}
                                  aria-pressed={item.avaliacao === estrela}
                                  disabled={
                                    acaoEmAndamento === `${pedido.id}:${item.id}`
                                  }
                                  onClick={() =>
                                    avaliarItem(pedido.id, item.id, estrela)
                                  }
                                  className="rounded p-0.5 text-amber-500 hover:text-amber-600 disabled:cursor-wait disabled:opacity-50"
                                >
                                  <Star
                                    className="h-5 w-5"
                                    fill={
                                      item.avaliacao !== null &&
                                      item.avaliacao >= estrela
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                </button>
                              ))}
                              <span className="ml-1 text-xs text-gray-500">
                                {item.avaliacao
                                  ? `${item.avaliacao}/5`
                                  : "Avalie"}
                              </span>
                            </div>
                          ) : (
                            <p className="mt-1 text-xs text-gray-500">
                              Avaliação disponível após a entrega
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-800">
                      {statusPedido[pedido.status] ?? pedido.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {pedido.modalEntrega === "DELIVERY" ? "Delivery" : "Retirada"}
                  </TableCell>
                  <TableCell>{pedido.tempoTotalEstimadoMinutos} min</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatarMoeda(pedido.valorTotal)}
                  </TableCell>
                  <TableCell>
                    {pedido.status === "PENDENTE" && (
                      <Button
                        size="xs"
                        color="red"
                        disabled={acaoEmAndamento === pedido.id}
                        onClick={() => cancelarPedido(pedido.id)}
                      >
                        {acaoEmAndamento === pedido.id
                          ? "Cancelando..."
                          : "Cancelar Pedido"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </main>
  );
}
