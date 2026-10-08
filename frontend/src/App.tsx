import { CardProduto } from "./components/CardProduto";
import { InputPesquisa } from "./components/InputPesquisa";
import { FiltroCategorias } from "./components/FiltroCategorias";
import type { ProdutoType } from "./utils/ProdutoType";
import { useEffect, useState } from "react";
import { useClienteStore } from "./context/ClienteContext";
import ModalDetalhes from "./ModalDetalhes";
import { CarrinhoDrawer } from "./components/CarrinhoDrawer";
import { toast } from "sonner";

const apiUrl = import.meta.env.VITE_API_URL;

interface AvaliacaoProduto {
  produtoID: string;
  avaliacaoMedia: number;
}

export default function App() {
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Record<string, number>>({});
  const { logaCliente } = useClienteStore();
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoType | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    string | null
  >(null);

  const handleCliqueProduto = (produto: ProdutoType) => {
    setProdutoSelecionado(produto);
    setModalAberto(true);
  };

  useEffect(() => {
    async function buscaDados() {
      const response = await fetch(`${apiUrl}/produtos`);
      const dados = await response.json();
      setProdutos(dados);
    }
    buscaDados();

    async function buscaAvaliacoes() {
      try {
        const response = await fetch(`${apiUrl}/itens-pedido/avaliacoes`);
        if (!response.ok) {
          throw new Error(
            `Falha ao buscar avaliações: HTTP ${response.status}`,
          );
        }

        const dados: AvaliacaoProduto[] = await response.json();
        setAvaliacoes(
          Object.fromEntries(
            dados.map(({ produtoID, avaliacaoMedia }) => [
              produtoID,
              avaliacaoMedia,
            ]),
          ),
        );
      } catch (error) {
        console.error("Erro ao buscar avaliações dos produtos:", error);
        toast.error("Não foi possível carregar as avaliações dos produtos.");
      }
    }
    buscaAvaliacoes();

    async function buscaCliente(id: string) {
      try {
        const response = await fetch(`${apiUrl}/clientes/${id}`);
        if (response.status === 200) {
          const dados = await response.json();
          logaCliente(dados);
        } else {
          localStorage.removeItem("clienteKey");
        }
      } catch (error) {
        console.error(error);
      }
    }

    const idCliente = localStorage.getItem("clienteKey");
    if (idCliente) {
      buscaCliente(idCliente);
    }
  }, [logaCliente]);

  // Agrupa categorias ignorando maiúsculas/minúsculas e espaços extras
  const categorias = Array.from(
    new Map(
      produtos.map((produto) => [
        produto.categoria.trim().toLowerCase(),
        produto.categoria.trim(),
      ]),
    ).values(),
  ).sort((a, b) => a.localeCompare(b, "pt-BR"));

  // Se uma pesquisa remover a categoria selecionada, volta a mostrar todas
  const categoriaAtiva =
    categoriaSelecionada &&
    categorias.some(
      (categoria) =>
        categoria.toLowerCase() === categoriaSelecionada.toLowerCase(),
    )
      ? categoriaSelecionada
      : null;

  const produtosFiltrados = categoriaAtiva
    ? produtos.filter(
        (produto) =>
          produto.categoria.trim().toLowerCase() ===
          categoriaAtiva.toLowerCase(),
      )
    : produtos;

  const temDestaques = produtosFiltrados.some(
    (produto) => (produto.valorDesconto ?? 0) > 0,
  );
  const temNormais = produtosFiltrados.some(
    (produto) => (produto.valorDesconto ?? 0) === 0,
  );

  const listaProdutosNormais = produtosFiltrados.map(
    (produto) =>
      (produto.valorDesconto ?? 0) === 0 && (
        <CardProduto
          data={produto}
          key={produto.id}
          aoClicar={handleCliqueProduto}
          avaliacaoMedia={avaliacoes[produto.id]}
        />
      ),
  );

  const listaProdutosDestaques = produtosFiltrados.map(
    (produto) =>
      (produto.valorDesconto ?? 0) > 0 && (
        <CardProduto
          data={produto}
          key={produto.id}
          aoClicar={handleCliqueProduto}
          avaliacaoMedia={avaliacoes[produto.id]}
        />
      ),
  );

  return (
    <div className="min-h-screen bg-fundo">
      <InputPesquisa setProdutos={setProdutos} />
      <FiltroCategorias
        categorias={categorias}
        categoriaSelecionada={categoriaAtiva}
        aoSelecionar={setCategoriaSelecionada}
      />
      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {temDestaques && (
            <section className="my-4">
              <div className="mb-5 flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-secundaria">
                  Ofertas especiais
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {listaProdutosDestaques}
              </div>
            </section>
          )}

          {temNormais && (
            <section
              className={
                temDestaques ? "border-t border-secundaria/10 pt-8" : "my-4"
              }
            >
              <div className="mb-5 flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-secundaria">
                  {categoriaAtiva ?? "Cardápio"}
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {listaProdutosNormais}
              </div>
            </section>
          )}

          {!temDestaques && !temNormais && (
            <p className="my-10 text-center text-secundaria/60">
              Nenhum produto encontrado.
            </p>
          )}
        </div>
      </main>

      <ModalDetalhes
        produto={produtoSelecionado}
        avaliacaoMedia={
          produtoSelecionado
            ? avaliacoes[produtoSelecionado.id]
            : undefined
        }
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      />

      <CarrinhoDrawer />
    </div>
  );
}
