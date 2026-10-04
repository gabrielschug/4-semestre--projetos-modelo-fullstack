import { Card } from "flowbite-react";
import type { ProdutoType } from "../utils/ProdutoType";

interface CardProdutoProps {
  data: ProdutoType;
  aoClicar: (produto: ProdutoType) => void;
}

export function CardProduto({ data, aoClicar }: CardProdutoProps) {
  // Calcula o preço final aplicando o desconto
  const precoFinal = data.precoBase - data.valorDesconto;

  // Formata os valores para a moeda local (Real)
  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

  return (
    <Card
      className="max-w-sm [&_img]:aspect-square [&_img]:object-cover [&_img]:w-full"
      imgAlt={data.descricao}
      imgSrc={data.fotoUrl}
    >
      <a
        // href={`produtos/${data.id}`}
        onClick={(e) => {
          e.preventDefault();
          aoClicar(data);
        }}
      >
        <h5 className="text-xl font-semibold tracking-tight text-secundaria">
          {data.descricao}
        </h5>
      </a>

      <div className="mb-5 mt-2.5 flex items-center justify-between">
        <span className="rounded bg-primaria/10 px-2.5 py-0.5 text-xs font-semibold text-primaria">
          {data.categoria}
        </span>
        <span className="text-sm font-medium text-secundaria/65">
          ⏳ {data.tempoPreparoMinutos} min
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          {/* Exibe o preço original riscado caso exista desconto */}
          {data.valorDesconto > 0 && (
            <span className="text-sm text-secundaria/60 line-through">
              {formatarMoeda(data.precoBase)}
            </span>
          )}
          <span className="text-3xl font-bold text-secundaria">
            {formatarMoeda(precoFinal)}
          </span>
        </div>

        <button
          disabled={!data.disponibilidade}
          onClick={() => aoClicar(data)}
          className={`rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4 ${
            data.disponibilidade
              ? "bg-primaria hover:bg-secundaria"
              : "cursor-not-allowed bg-secundaria/40"
          }`}
        >
          {data.disponibilidade ? "Comprar" : "Esgotado"}
        </button>
      </div>
    </Card>
  );
}
