import { useEffect, useState } from "react";
import AdminDashboardCard from "./components/AdminDashboardCard";

const apiUrl = import.meta.env.VITE_API_URL;

const indicadores = [
  { label: "Solicitados", status: "PENDENTE", tone: "amber" },
  { label: "Cancelados", status: "CANCELADO", tone: "red" },
  { label: "Em Preparo", status: "PREPARANDO", tone: "orange" },
  { label: "Prontos", status: "PRONTO", tone: "violet" },
  { label: "Em Rota para Entrega", status: "EM_ROTA", tone: "blue" },
  { label: "Entregues", status: "ENTREGUE", tone: "green" },
] as const;

type StatusPedido = (typeof indicadores)[number]["status"];
type ContagemPedido = { status: StatusPedido; quantidade: number };
type TotaisPedidos = Record<StatusPedido, number>;

const totaisIniciais: TotaisPedidos = {
  PENDENTE: 0,
  CANCELADO: 0,
  PREPARANDO: 0,
  PRONTO: 0,
  EM_ROTA: 0,
  ENTREGUE: 0,
};

export default function AdminDashboard() {
  const [totais, setTotais] = useState(totaisIniciais);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarTotais() {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setErro("Sessão administrativa não encontrada. Entre novamente.");
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const response = await fetch(`${apiUrl}/pedidos/status/quantidades`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(
            `Falha ao carregar quantidades (HTTP ${response.status})`,
          );
        }

        const contagens: ContagemPedido[] = await response.json();
        const novosTotais = { ...totaisIniciais };
        for (const { status, quantidade } of contagens) {
          if (Object.hasOwn(novosTotais, status)) {
            novosTotais[status] = quantidade;
          }
        }
        setTotais(novosTotais);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Erro ao carregar totais dos pedidos:", error);
        setErro("Não foi possível carregar os totais dos pedidos.");
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarTotais();
    return () => controller.abort();
  }, [tentativa]);

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900">
        Dashboard
      </h2>
      {erro && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
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
      {carregando && <p role="status">Carregando quantidades de pedidos...</p>}
      <div className="flex w-full flex-wrap justify-between gap-4">
        {indicadores.map(({ label, status, tone }) => (
          <AdminDashboardCard
            key={status}
            label={label}
            value={totais[status]}
            tone={tone}
          />
        ))}
      </div>
    </section>
  );
}
