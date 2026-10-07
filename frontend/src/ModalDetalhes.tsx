import { Modal, ModalBody, ModalHeader } from "flowbite-react";
import {
  calcularPrecoFinal,
  type ProdutoType,
} from "./utils/ProdutoType";
import { useState, useEffect } from "react";
import { useCarrinho } from "./context/useCarrinhoStore";
import { toast } from "sonner";
import { AvaliacaoEstrelas } from "./components/AvaliacaoEstrelas";

function gerarIdItemCarrinho() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (caractere) => {
    const valor = Math.floor(Math.random() * 16);
    const digito = caractere === "x" ? valor : (valor & 0x3) | 0x8;
    return digito.toString(16);
  });
}

interface ModalDetalhesProps {
  produto: ProdutoType | null;
  avaliacaoMedia: number | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalDetalhes({
  produto,
  avaliacaoMedia,
  isOpen,
  onClose,
}: ModalDetalhesProps) {
  const [count, setCount] = useState(1);
  const [observacao, setObservacao] = useState("");
  const adicionarAoCarrinho = useCarrinho((state) => state.adicionarAoCarrinho);

  useEffect(() => {
    if (isOpen) {
      setCount(1);
      setObservacao("");
    }
  }, [isOpen]);

  if (!produto) return null;

  const precoFinal = calcularPrecoFinal(produto);

  const handleAdicionar = () => {
    const novoItem = {
      id_item_carrinho: gerarIdItemCarrinho(),
      produto: produto,
      quantidade: count,
      observacao: observacao,
    };

    adicionarAoCarrinho(novoItem);

    onClose();
  };

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

  const produtoAdicionado = () => {
    toast.info("Produto adicionado ao carrinho");
  };

  return (
    <Modal dismissible show={isOpen} onClose={onClose} size="3xl">
      <ModalHeader className="border-none px-4 py-3 text-base text-secundaria sm:px-6 sm:py-4 sm:text-xl">
        {produto.descricao}
      </ModalHeader>
      <ModalBody className="h-[calc(100dvh-8rem)] max-h-[calc(100dvh-8rem)] overflow-hidden p-0 sm:h-auto sm:max-h-[80vh]">
        <div className="flex h-full max-h-full flex-col md:h-[min(70vh,38rem)] md:flex-row">
          <div className="h-[clamp(6rem,22dvh,9rem)] w-full shrink-0 bg-white sm:h-48 md:h-full md:w-1/2">
            <img
              src={produto.fotoUrl ?? ""}
              alt={produto.descricao}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex min-h-0 w-full flex-1 flex-col bg-white md:w-1/2">
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-6">
              <p className="mb-3 text-xs leading-relaxed text-secundaria/65 sm:mb-4 sm:text-sm">
                {produto.especificacoes}
              </p>
              <div className="mb-4 flex flex-wrap items-baseline gap-2 sm:mb-6 sm:gap-3">
                {(produto.valorDesconto ?? 0) > 0 && (
                  <span className="text-xs text-secundaria/60 line-through sm:text-sm">
                    {formatarMoeda(produto.precoBase)}
                  </span>
                )}
                <p className="text-lg font-bold text-secundaria sm:text-xl">
                  {formatarMoeda(precoFinal)}
                </p>
              </div>

              <AvaliacaoEstrelas media={avaliacaoMedia} compact />

              <div className="mt-3 sm:mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-secundaria sm:text-base">
                    Algum comentário?
                  </label>
                </div>
                <textarea
                  value={observacao}
                  onChange={(event) => setObservacao(event.target.value)}
                  className="w-full resize-none rounded-md border border-secundaria/20 bg-white p-2.5 text-sm text-secundaria shadow-sm transition-colors placeholder:text-secundaria/50 focus:border-primaria focus:bg-fundo focus:ring-primaria sm:p-3"
                  rows={2}
                  placeholder="Ex: tirar a cebola, maionese à parte etc."
                ></textarea>
              </div>
            </div>

            <div className="mt-auto flex shrink-0 items-center justify-between gap-2 border-t border-secundaria/10 bg-white p-3 sm:gap-4 sm:p-4">
              <div className="flex h-11 w-24 shrink-0 items-center justify-between rounded-md border border-secundaria/20 bg-fundo px-1 sm:h-12 sm:w-28 sm:px-2">
                <button
                  type="button"
                  aria-label="Diminuir quantidade"
                  className="flex h-10 w-10 items-center justify-center rounded pb-1 text-2xl text-secundaria transition-colors hover:bg-primaria/10"
                  onClick={() => setCount(count > 1 ? count - 1 : 1)}
                >
                  -
                </button>
                <span className="text-secundaria font-medium text-sm">
                  {count}
                </span>
                <button
                  type="button"
                  aria-label="Aumentar quantidade"
                  className="flex h-10 w-10 items-center justify-center rounded pb-1 text-2xl text-secundaria transition-colors hover:bg-primaria/10"
                  onClick={() => setCount(count + 1)}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className="mx-auto flex h-11 min-w-0 flex-1 items-center justify-between gap-2 rounded-md bg-primaria px-3 text-white transition-colors hover:bg-secundaria focus:outline-none focus:ring-4 focus:ring-primaria/30 sm:h-12 sm:px-4"
                onClick={() => {
                  handleAdicionar();
                  produtoAdicionado();
                }}
              >
                <span className="text-sm font-medium">Adicionar</span>
                <span className="text-sm font-medium">
                  {formatarMoeda(precoFinal * count)}
                </span>
              </button>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
