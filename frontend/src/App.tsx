import { CardProduto } from "./components/CardProduto";
// import { InputPesquisa } from "./components/InputPesquisa";
import type { ProdutoType } from "./utils/ProdutoType";
import { useEffect, useState } from "react";
import { useClienteStore } from "./context/ClienteContext";

const apiUrl = import.meta.env.VITE_API_URL;

export default function App() {
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const { logaCliente } = useClienteStore();

  useEffect(() => {
    async function buscaDados() {
      const response = await fetch(`${apiUrl}/produtos`);
      const dados = await response.json();
      setProdutos(dados);
    }
    buscaDados();

    async function buscaCliente(id: string) {
      try {
        const response = await fetch(`${apiUrl}clientes/${id}`);
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
        <CardProduto data={produto} key={produto.id} />
      ),
  );

  const listaProdutosDestaques = produtos.map(
    (produto) =>
      produto.valorDesconto > 0 && (
        <CardProduto data={produto} key={produto.id} />
      ),
  );

  return (
    <>
      {/* <InputPesquisa setProdutos={setProdutos} /> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div>
          {listaProdutosDestaques && (
            <>
              <h3 className="text-3xl font-bold text-heading my-2">
                Temos <span className="text-fg-brand ">promoção para você</span>
                !
              </h3>
              <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {listaProdutosDestaques}
              </div>
            </>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {listaProdutosNormais}
          </div>
        </div>
      </div>
    </>
  );
}
