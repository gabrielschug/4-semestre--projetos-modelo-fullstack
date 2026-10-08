import { Card } from "flowbite-react";
import { calcularPrecoFinal, type ProdutoType } from "../utils/ProdutoType";
import { AvaliacaoEstrelas } from "./AvaliacaoEstrelas";

interface CardProdutoProps {
  data: ProdutoType;
  aoClicar: (produto: ProdutoType) => void;
  avaliacaoMedia: number | undefined;
}

export function CardProduto({
  data,
  aoClicar,
  avaliacaoMedia,
}: CardProdutoProps) {
  // Calcula o preço final aplicando o desconto
  const precoFinal = calcularPrecoFinal(data);

  // Formata os valores para a moeda local (Real)
  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

  return (
    <Card
      className="h-full w-full max-w-sm overflow-hidden [&>div:last-child]:gap-3 [&>div:last-child]:p-3 [&_img]:h-32 [&_img]:w-full [&_img]:object-cover sm:[&>div:last-child]:gap-4 sm:[&>div:last-child]:p-6 sm:[&_img]:h-48"
      imgAlt={data.descricao}
      imgSrc={data.fotoUrl ?? ""}
    >
      <a
        // href={`produtos/${data.id}`}
        onClick={(e) => {
          e.preventDefault();
          aoClicar(data);
        }}
      >
        <h5 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 tracking-tight text-secundaria sm:min-h-0 sm:text-xl sm:leading-normal">
          {data.descricao}
        </h5>
      </a>

      <div className="flex flex-wrap items-center justify-between gap-1">
        <span className="max-w-full truncate rounded bg-primaria/10 px-2 py-0.5 text-[10px] font-semibold text-primaria sm:px-2.5 sm:text-xs">
          {data.categoria}
        </span>
        <span className="whitespace-nowrap text-[10px] font-medium text-secundaria/65 sm:text-sm">
          ⏳ {data.tempoPreparoMinutos} min
        </span>
      </div>

      <AvaliacaoEstrelas media={avaliacaoMedia} compact />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col">
          {/* Exibe o preço original riscado caso exista desconto */}
          {(data.valorDesconto ?? 0) > 0 && (
            <span className="text-xs text-secundaria/60 line-through sm:text-sm">
              {formatarMoeda(data.precoBase)}
            </span>
          )}
          <span className="text-lg font-bold leading-tight text-secundaria sm:text-3xl">
            {formatarMoeda(precoFinal)}
          </span>
        </div>

        <button
          disabled={!data.disponibilidade}
          onClick={() => aoClicar(data)}
          className={`w-full whitespace-nowrap rounded-lg px-3 py-2 text-center text-xs font-medium text-white focus:outline-none focus:ring-4 sm:w-auto sm:px-5 sm:py-2.5 sm:text-sm ${
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
