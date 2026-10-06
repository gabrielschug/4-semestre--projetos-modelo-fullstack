import { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
} from "flowbite-react";
import { Plus } from "lucide-react";
import { useAdminStore } from "../context/AdminContext";
import type { BairroType } from "../utils/BairroType";
import AdminLocaisRow, {
  type BairroFormData,
} from "./components/AdminLocaisRow";

const apiUrl = import.meta.env.VITE_API_URL;

export default function AdminLocais() {
  const token = useAdminStore((state) => state.token);
  const [bairros, setBairros] = useState<BairroType[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [criandoBairro, setCriandoBairro] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarBairros() {
      setCarregando(true);
      setErro(null);

      try {
        const response = await fetch(`${apiUrl}/valores_entregas`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Falha ao carregar locais (HTTP ${response.status})`);
        }

        const dados: BairroType[] = await response.json();
        setBairros(dados);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error("Erro ao carregar locais:", error);
        setErro("Não foi possível carregar os locais. Tente novamente.");
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarBairros();
    return () => controller.abort();
  }, [tentativa]);

  async function enviarLocal(
    id: string | null,
    dados: BairroFormData,
  ): Promise<BairroType> {
    const tokenAdmin = token || localStorage.getItem("adminToken");
    if (!tokenAdmin) {
      throw new Error("Sessão administrativa não encontrada. Entre novamente.");
    }

    const response = await fetch(
      id
        ? `${apiUrl}/valores_entregas/${encodeURIComponent(id)}`
        : `${apiUrl}/valores_entregas`,
      {
        method: id ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${tokenAdmin}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dados),
      },
    );
    const resultado = await response.json();
    if (!response.ok) {
      throw new Error(
        resultado.error ??
          `Não foi possível salvar o local (HTTP ${response.status}).`,
      );
    }

    const bairroSalvo = resultado as BairroType;
    if (id) {
      setBairros((atuais) =>
        atuais
          .map((bairro) =>
            bairro.id === bairroSalvo.id ? bairroSalvo : bairro,
          )
          .sort((a, b) => a.bairro.localeCompare(b.bairro, "pt-BR")),
      );
    } else {
      setBairros((atuais) =>
        [...atuais, bairroSalvo].sort((a, b) =>
          a.bairro.localeCompare(b.bairro, "pt-BR"),
        ),
      );
      setCriandoBairro(false);
    }
    return bairroSalvo;
  }

  async function excluirLocal(id: string): Promise<void> {
    const tokenAdmin = token || localStorage.getItem("adminToken");
    if (!tokenAdmin) {
      throw new Error("Sessão administrativa não encontrada. Entre novamente.");
    }

    const response = await fetch(
      `${apiUrl}/valores_entregas/${encodeURIComponent(id)}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${tokenAdmin}` } },
    );
    if (!response.ok) {
      const resultado = await response.json();
      throw new Error(
        resultado.error ??
          `Não foi possível excluir o local (HTTP ${response.status}).`,
      );
    }
    setBairros((atuais) => atuais.filter((bairro) => bairro.id !== id));
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-700">
          Administração
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Locais de entrega
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-gray-600">
            {bairros.length}{" "}
            {bairros.length === 1 ? "local cadastrado" : "locais cadastrados"}
          </p>
          <Button
            color="primary"
            onClick={() => setCriandoBairro(true)}
            disabled={carregando || criandoBairro}
          >
            <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
            Novo local
          </Button>
        </div>
      </header>

      {erro && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
        >
          <span>{erro}</span>
          <Button
            size="xs"
            color="light"
            onClick={() => setTentativa((n) => n + 1)}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table striped>
          <TableHead>
            <TableHeadCell>Bairro</TableHeadCell>
            <TableHeadCell>Taxa de entrega</TableHeadCell>
            <TableHeadCell>Tempo estimado</TableHeadCell>
            <TableHeadCell>Ações</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {criandoBairro && (
              <AdminLocaisRow
                key="novo-local"
                bairro={{
                  id: "",
                  bairro: "",
                  valor: 0,
                  tempoEntregaMinutos: 30,
                }}
                isNew
                onSave={enviarLocal}
                onCancel={() => setCriandoBairro(false)}
              />
            )}
            {carregando ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-600">
                  Carregando locais...
                </td>
              </tr>
            ) : !erro && bairros.length === 0 && !criandoBairro ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-600">
                  Nenhum local cadastrado.
                </td>
              </tr>
            ) : (
              bairros.map((bairro) => (
                <AdminLocaisRow
                  key={bairro.id}
                  bairro={bairro}
                  onSave={enviarLocal}
                  onDelete={excluirLocal}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
