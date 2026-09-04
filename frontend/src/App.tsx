import { CardProduto } from "./components/CardProduto";
// import { InputPesquisa } from "./components/InputPesquisa";
import type { ProdutoType } from "./utils/ProdutoType";
import { useEffect, useState } from "react";
import { useClienteStore } from "./context/ClienteContext"

const apiUrl = import.meta.env.VITE_API_URL

export default function App() {
  const [produtos, setProdutos] = useState<ProdutoType[]>([])
  const { logaCliente } = useClienteStore()  

  useEffect(() => {
    async function buscaDados() {
      const response = await fetch(`${apiUrl}/produtos`)
      const dados = await response.json()
//      console.log(dados)
      setProdutos(dados)
    }
    buscaDados()

    async function buscaCliente(id: string) {
      const response = await fetch(`${apiUrl}/clientes/${id}`)
      const dados = await response.json()
      logaCliente(dados)
    }
    if (localStorage.getItem("clienteKey")) {
      const idCliente = localStorage.getItem("clienteKey")
      buscaCliente(idCliente as string)
    }    
  }, [])

  const listaProdutos = produtos.map( produto => (
    <CardProduto data={produto} key={produto.id} />
  ))

  return (
    <>
      {/* <InputPesquisa setProdutos={setProdutos} /> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h1 className="pt-8 mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
          Seja bem-vindo ao <span className="underline underline-offset-3 decoration-8 decoration-cyan-400 ">###</span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {listaProdutos}
        </div>
      </div>
    </>
  );
}
