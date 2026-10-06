import { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableHead,
  TableHeadCell,
} from "flowbite-react";
import { useAdminStore } from "../context/AdminContext";
import type { ProdutoEdicaoType, ProdutoType } from "../utils/ProdutoType";
import AdminProdutoRow from "./components/AdminProdutoRow";
import { Plus } from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, "");

export default function AdminProdutos() {
  const token = useAdminStore((state) => state.token);
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [criandoProduto, setCriandoProduto] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarProdutos() {
      const tokenAdmin = token || localStorage.getItem("adminToken");

      if (!tokenAdmin) {
        setErro("Sessão administrativa não encontrada. Entre novamente.");
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const response = await fetch(`${apiUrl}/produtos/todos`, {
          headers: { Authorization: `Bearer ${tokenAdmin}` },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Falha ao carregar produtos (HTTP ${response.status})`);
        }

        const dados: ProdutoType[] = await response.json();
        setProdutos(dados);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Erro ao carregar os produtos:", error);
        setErro("Não foi possível carregar os produtos. Tente novamente.");
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarProdutos();
    return () => controller.abort();
  }, [token, tentativa]);

  async function salvarProduto(
    id: string | null,
    dados: ProdutoEdicaoType,
  ): Promise<ProdutoType> {
    const tokenAdmin = token || localStorage.getItem("adminToken");
    if (!tokenAdmin) {
      throw new Error("Sessão administrativa não encontrada. Entre novamente.");
    }

    const response = await fetch(
      id ? `${apiUrl}/produtos/${encodeURIComponent(id)}` : `${apiUrl}/produtos`,
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
        resultado.error ?? `Não foi possível atualizar o produto (HTTP ${response.status}).`,
      );
    }

    const produtoAtualizado = resultado as ProdutoType;
    if (id) {
      setProdutos((atuais) =>
        atuais.map((produto) =>
          produto.id === produtoAtualizado.id ? produtoAtualizado : produto,
        ),
      );
    } else {
      setProdutos((atuais) => [produtoAtualizado, ...atuais]);
      setCriandoProduto(false);
    }
    return produtoAtualizado;
  }

  async function excluirProduto(id: string): Promise<void> {
    const tokenAdmin = token || localStorage.getItem("adminToken");
    if (!tokenAdmin) {
      throw new Error("Sessão administrativa não encontrada. Entre novamente.");
    }

    const response = await fetch(
      `${apiUrl}/produtos/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenAdmin}` },
      },
    );

    if (!response.ok) {
      const resultado = await response.json();
      throw new Error(
        resultado.error ??
          `Não foi possível excluir o produto (HTTP ${response.status}).`,
      );
    }

    setProdutos((atuais) => atuais.filter((produto) => produto.id !== id));
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-700">
          Administração
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Cadastro de Produtos
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-gray-600">
            {produtos.length}{" "}
            {produtos.length === 1
              ? "produto cadastrado"
              : "produtos cadastrados"}
          </p>
          <Button
            color="primary"
            onClick={() => setCriandoProduto(true)}
            disabled={carregando || criandoProduto}
          >
            <Plus aria-hidden="true" className="mr-2 h-4 w-4" />
            Novo produto
          </Button>
        </div>
      </header>
      <div className="overflow-x-auto">
        <Table striped>
          <TableHead>
            <TableHeadCell>ID</TableHeadCell>
            <TableHeadCell>Produto</TableHeadCell>
            <TableHeadCell>Categoria</TableHeadCell>
            <TableHeadCell>Preço base</TableHeadCell>
            <TableHeadCell>Desconto</TableHeadCell>
            <TableHeadCell>Disponibilidade</TableHeadCell>
            <TableHeadCell>Especificações</TableHeadCell>
            <TableHeadCell>URL da foto</TableHeadCell>
            <TableHeadCell>Preparo (min)</TableHeadCell>
            <TableHeadCell>Ações</TableHeadCell>
          </TableHead>
          <TableBody className="divide-y">
            {criandoProduto && (
              <AdminProdutoRow
                key="novo-produto"
                produto={{
                  id: "",
                  descricao: "",
                  categoria: "",
                  precoBase: 0,
                  valorDesconto: 0,
                  disponibilidade: true,
                  especificacoes: null,
                  fotoUrl: null,
                  tempoPreparoMinutos: null,
                  adminID: "",
                }}
                isNew
                onSave={salvarProduto}
                onCancel={() => setCriandoProduto(false)}
              />
            )}
            {carregando ? (
              <tr>
                <td colSpan={10} className="p-6 text-center text-gray-600">
                  Carregando produtos...
                </td>
              </tr>
            ) : erro ? (
              <tr>
                <td colSpan={10} className="p-6 text-center">
                  <p className="text-red-700">{erro}</p>
                  <button
                    type="button"
                    onClick={() => setTentativa((valor) => valor + 1)}
                    className="mt-2 font-medium text-orange-700 hover:underline"
                  >
                    Tentar novamente
                  </button>
                </td>
              </tr>
            ) : produtos.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-6 text-center text-gray-600">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            ) : (
              produtos.map((produto) => (
                <AdminProdutoRow
                  key={produto.id}
                  produto={produto}
                  onSave={salvarProduto}
                  onDelete={excluirProduto}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
