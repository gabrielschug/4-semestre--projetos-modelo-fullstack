import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import AdminKanbanColuna, {
  type ConfiguracaoColunaKanban,
} from "./components/AdminKanbanColuna";
import type { PedidoAdmin, StatusPedido } from "./utils/AdminPedidoType";
import {
  linkWhatsapp,
  mensagemMudancaStatus,
} from "./utils/mensagemWhatsapp";

const apiUrl = import.meta.env.VITE_API_URL;
const intervaloAtualizacaoMs = 60_000;

const colunas: ConfiguracaoColunaKanban[] = [
  { status: "PENDENTE", titulo: "Novos pedidos", cor: "amber" },
  { status: "PREPARANDO", titulo: "Em preparo", cor: "orange" },
  { status: "PRONTO", titulo: "Prontos", cor: "violet" },
  { status: "EM_ROTA", titulo: "Em rota", cor: "blue" },
  { status: "ENTREGUE", titulo: "Entregues", cor: "green" },
  { status: "CANCELADO", titulo: "Cancelados", cor: "gray" },
] as const;

export default function AdminKanban() {
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pesquisa, setPesquisa] = useState("");
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let buscando = false;
    let primeiraCarga = true;

    async function carregarPedidos() {
      if (buscando) {
        return;
      }

      buscando = true;
      if (primeiraCarga) {
        setCarregando(true);
      }

      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          throw new Error(
            "Sessão administrativa não encontrada. Entre novamente.",
          );
        }

        const response = await fetch(`${apiUrl}/pedidos`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Falha ao carregar pedidos (HTTP ${response.status})`);
        }
        const dados: PedidoAdmin[] = await response.json();
        setPedidos(dados);
        setErro(null);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Erro ao carregar pedidos para o Kanban:", error);
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os pedidos.",
        );
      } finally {
        buscando = false;
        if (!controller.signal.aborted) {
          if (primeiraCarga) {
            primeiraCarga = false;
            setCarregando(false);
          }
        }
      }
    }

    void carregarPedidos();
    const intervalo = window.setInterval(
      () => void carregarPedidos(),
      intervaloAtualizacaoMs,
    );

    return () => {
      window.clearInterval(intervalo);
      controller.abort();
    };
  }, [tentativa]);

  const pedidosFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLocaleLowerCase("pt-BR");
    if (!termo) {
      return pedidos;
    }

    return pedidos.filter((pedido) =>
      [
        pedido.id,
        pedido.cliente.nome,
        pedido.cliente.telefone,
        pedido.cliente.bairro.bairro,
        ...pedido.itens.map((item) => item.produto.descricao),
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(termo),
    );
  }, [pedidos, pesquisa]);

  async function alterarStatus(pedido: PedidoAdmin, status: StatusPedido) {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Sessão administrativa não encontrada. Entre novamente.");
      return;
    }

    // A aba precisa ser aberta ainda no clique; depois do await o
    // navegador trata como pop-up e bloqueia
    const mensagemAviso = mensagemMudancaStatus(pedido, status);
    const janelaWhatsapp = mensagemAviso ? window.open("", "_blank") : null;
    if (janelaWhatsapp) {
      janelaWhatsapp.opener = null;
      janelaWhatsapp.document.title = "Abrindo WhatsApp...";
    }

    setAtualizando(pedido.id);
    try {
      const response = await fetch(
        `${apiUrl}/pedidos/${encodeURIComponent(pedido.id)}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );
      const resultado = await response.json();
      if (!response.ok) {
        throw new Error(
          resultado.error ??
            `Não foi possível atualizar o pedido (HTTP ${response.status}).`,
        );
      }

      setPedidos((atuais) =>
        atuais.map((atual) =>
          atual.id === pedido.id ? { ...atual, status } : atual,
        ),
      );
      const tituloStatus =
        colunas.find((coluna) => coluna.status === status)?.titulo ?? status;
      toast.success(`Pedido atualizado: ${tituloStatus}.`);

      if (mensagemAviso) {
        const link = linkWhatsapp(pedido.cliente.telefone, mensagemAviso);
        if (janelaWhatsapp && !janelaWhatsapp.closed) {
          janelaWhatsapp.location.href = link;
        } else {
          // Pop-up bloqueado: oferece abrir com um novo clique
          toast.info("Avise o cliente pelo WhatsApp.", {
            action: {
              label: "Abrir WhatsApp",
              onClick: () => window.open(link, "_blank", "noopener"),
            },
            duration: 15_000,
          });
        }
      }
    } catch (error) {
      janelaWhatsapp?.close();
      console.error("Erro ao atualizar status do pedido:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o pedido.",
      );
    } finally {
      setAtualizando(null);
    }
  }

  return (
    <section className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-1 flex-col gap-3 overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            Pedidos
          </h2>
        </div>
        <label className="relative w-full sm:w-72">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={pesquisa}
            onChange={(event) => setPesquisa(event.target.value)}
            placeholder="Buscar pedido, cliente ou produto"
            aria-label="Buscar pedidos"
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-xs text-gray-900 shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
        </label>
      </header>

      {erro && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
        >
          <span>{erro}</span>
          <button
            type="button"
            onClick={() => setTentativa((valor) => valor + 1)}
            className="font-semibold text-red-900 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {carregando && (
        <p role="status" className="shrink-0 text-xs text-gray-600">
          Carregando pedidos...
        </p>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <p className="mb-2 text-[11px] text-gray-500 md:hidden">
          Deslize para o lado para ver todas as etapas do quadro.
        </p>
        <div
          className="admin-kanban-scroll min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden"
          role="region"
          aria-label="Quadro de pedidos. Deslize horizontalmente para ver todas as etapas."
          tabIndex={0}
        >
          <div className="flex h-full min-h-0 w-max items-stretch gap-3 pr-1">
            {colunas.map((coluna) => (
              <AdminKanbanColuna
                key={coluna.status}
                coluna={coluna}
                pedidos={pedidosFiltrados.filter(
                  (pedido) => pedido.status === coluna.status,
                )}
                carregando={carregando}
                pedidoAtualizando={atualizando}
                onAlterarStatus={alterarStatus}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
