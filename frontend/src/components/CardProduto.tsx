import { Card } from "flowbite-react";
import type { ProdutoType } from "../utils/ProdutoType";

interface CardProdutoProps {
  data: ProdutoType;
}

export function CardProduto({ data }: CardProdutoProps) {
  // Calcula o preço final aplicando o desconto
  const precoFinal = data.precoBase - data.valorDesconto;
  
  // Formata os valores para a moeda local (Real)
  const formatarMoeda = (valor: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  return (
    <Card
      className="max-w-sm"
      imgAlt={data.descricao}
      imgSrc={data.fotoUrl}
    >
      <a href={`/produto/${data.id}`}>
        <h5 className="text-xl font-semibold tracking-tight text-gray-900">
          {data.descricao}
        </h5>
      </a>
      
      <div className="mb-5 mt-2.5 flex items-center justify-between">
        <span className="rounded bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-800">
          {data.categoria}
        </span>
        <span className="text-sm font-medium text-gray-500 ">
          ⏳ {data.tempoPreparoMinutos} min
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          {/* Exibe o preço original riscado caso exista desconto */}
          {data.valorDesconto > 0 && (
            <span className="text-sm line-through text-gray-500 ">
              {formatarMoeda(data.precoBase)}
            </span>
          )}
          <span className="text-3xl font-bold text-gray-900 ">
            {formatarMoeda(precoFinal)}
          </span>
        </div>
        
        <button
          disabled={!data.disponibilidade}
          onClick={() => console.log(`Adicionando ${data.id} ao carrinho`)}
          className={`rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4 ${
            data.disponibilidade
              ? "bg-cyan-700 hover:bg-cyan-800 focus:ring-cyan-300"
              : "cursor-not-allowed bg-gray-400"
          }`}
        >
          {data.disponibilidade ? "Comprar" : "Esgotado"}
        </button>
      </div>
    </Card>
  );
}