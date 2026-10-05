import { CardProduto } from "./components/CardProduto";
import { InputPesquisa } from "./components/InputPesquisa";
import type { ProdutoType } from "./utils/ProdutoType";
import { useEffect, useState } from "react";
import { useClienteStore } from "./context/ClienteContext";
import ModalDetalhes from "./ModalDetalhes";
import { CarrinhoDrawer } from "./components/CarrinhoDrawer";

const apiUrl = import.meta.env.VITE_API_URL;

export default function App() {
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const { logaCliente } = useClienteStore();
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoType | null>(null);

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
  }, []);

  const listaProdutosNormais = produtos.map(
    (produto) =>
      produto.valorDesconto === 0 && (
        <CardProduto
          data={produto}
          key={produto.id}
          aoClicar={handleCliqueProduto}
        />
      ),
  );

  const listaProdutosDestaques = produtos.map(
    (produto) =>
      produto.valorDesconto > 0 && (
        <CardProduto
          data={produto}
          key={produto.id}
          aoClicar={handleCliqueProduto}
        />
      ),
  );

  return (
    <div className="min-h-screen bg-fundo">
      <InputPesquisa setProdutos={setProdutos} />
      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="space-y-10">
          <section className="my-4">
            <div className="mb-5 flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-secundaria">
                Ofertas especiais
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {listaProdutosDestaques}
            </div>
          </section>

          <section className="border-t border-secundaria/10 pt-8">
            <div className="mb-5 flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-secundaria">
                Cardápio
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {listaProdutosNormais}
            </div>
          </section>
        </div>
      </main>

      <ModalDetalhes
        produto={produtoSelecionado}
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
      />

      <CarrinhoDrawer />
    </div>
  );
}
