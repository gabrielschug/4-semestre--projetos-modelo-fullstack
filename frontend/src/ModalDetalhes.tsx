import { Modal, ModalBody, ModalHeader, ModalFooter } from "flowbite-react";
import {
  calcularPrecoFinal,
  type ProdutoType,
} from "./utils/ProdutoType";
import { useState, useEffect } from "react";
import { useCarrinho } from "./context/useCarrinhoStore";
import { toast } from "sonner";
import { AvaliacaoEstrelas } from "./components/AvaliacaoEstrelas";

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
      id_item_carrinho: crypto.randomUUID(),
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
      <ModalHeader className="border-none text-secundaria">
        {produto.descricao}
      </ModalHeader>
      <ModalBody className="p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Imagem - Topo no mobile, esquerda no desktop */}
          <div className="w-full md:w-1/2 h-56 md:h-auto bg-white shrink-0">
            <img
              src={produto.fotoUrl ?? ""}
              alt={produto.descricao}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-col bg-white">
            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              <p className="text-sm text-secundaria/65 mb-4 leading-relaxed">
                {produto.especificacoes}
              </p>
              <div className="mb-6 flex items-baseline gap-3">
                {(produto.valorDesconto ?? 0) > 0 && (
                  <span className="text-sm text-secundaria/60 line-through">
                    {formatarMoeda(produto.precoBase)}
                  </span>
                )}
                <p className="text-lg font-medium text-secundaria">
                  {formatarMoeda(precoFinal)}
                </p>
              </div>

              <AvaliacaoEstrelas media={avaliacaoMedia} />

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-base font-medium text-secundaria">
                    Algum comentário?
                  </label>
                </div>
                <textarea
                  value={observacao}
                  onChange={(event) => setObservacao(event.target.value)}
                  className="w-full resize-none rounded-md border border-secundaria/20 bg-white p-3 text-sm text-secundaria shadow-sm transition-colors placeholder:text-secundaria/50 focus:border-primaria focus:bg-fundo focus:ring-primaria"
                  rows={2}
                  placeholder="Ex: tirar a cebola, maionese à parte etc."
                ></textarea>
              </div>
            </div>

            <div className="p-4 border-t border-secundaria/10 bg-white flex items-center justify-between gap-4 mt-auto">
              <div className="flex items-center justify-between border border-secundaria/20 rounded-md h-12 w-28 px-2 bg-fundo">
                <button
                  className="text-secundaria text-2xl w-8 h-8 flex items-center justify-center hover:bg-primaria/10 rounded pb-1 transition-colors"
                  onClick={() => setCount(count > 1 ? count - 1 : 1)}
                >
                  -
                </button>
                <span className="text-secundaria font-medium text-sm">
                  {count}
                </span>
                <button
                  className="text-secundaria text-2xl w-8 h-8 flex items-center justify-center hover:bg-primaria/10 rounded pb-1 transition-colors"
                  onClick={() => setCount(count + 1)}
                >
                  +
                </button>
              </div>

              <button
                className="flex-1 h-12 bg-primaria hover:bg-secundaria text-white rounded-md px-4 flex items-center justify-between transition-colors mx-auto focus:outline-none focus:ring-4 focus:ring-primaria/30"
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
      <ModalFooter className="p-1 border-none"></ModalFooter>
    </Modal>
  );
}
