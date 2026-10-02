import { Modal, ModalBody, ModalHeader, ModalFooter } from "flowbite-react";
import type { ProdutoType } from "./utils/ProdutoType";
import { useState, useEffect } from "react";
import { useCarrinho } from "./context/useCarrinhoStore";

interface ModalDetalhesProps {
  produto: ProdutoType | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalDetalhes({
  produto,
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

  const handleAdicionar = () => {
    const novoItem = {
      item_item_carrinho: crypto.randomUUID(),
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

  return (
    <Modal dismissible show={isOpen} onClose={onClose} size="3xl">
      <ModalHeader className=" border-none">{produto.descricao}</ModalHeader>
      <ModalBody className="p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Imagem - Topo no mobile, esquerda no desktop */}
          <div className="w-full md:w-1/2 h-56 md:h-auto bg-gray-100 shrink-0">
            <img
              src={produto.fotoUrl}
              alt={produto.descricao}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-col bg-white">
            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                {produto.especificacoes}
              </p>
              <p className="text-lg font-medium text-gray-800 mb-6">
                {formatarMoeda(produto.precoBase)}
              </p>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-base font-medium text-gray-800">
                    Algum comentário?
                  </label>
                </div>
                <textarea
                  className="w-full rounded-md border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700 shadow-sm focus:border-[var(--color-brand)] focus:ring-[var(--color-brand)] focus:bg-white resize-none transition-colors"
                  rows="2" //bug funcionando
                  placeholder="Ex: tirar a cebola, maionese à parte etc."
                ></textarea>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between gap-4 mt-auto">
              <div className="flex items-center justify-between border border-gray-300 rounded-md h-12 w-28 px-2 bg-white">
                <button
                  className="text-[var(--color-fg-brand)] text-2xl w-8 h-8 flex items-center justify-center hover:bg-[var(--color-brand-softer)] rounded pb-1 transition-colors"
                  onClick={() => setCount(count > 1 ? count - 1 : 1)}
                >
                  -
                </button>
                <span className="text-gray-800 font-medium text-sm">
                  {count}
                </span>
                <button
                  className="text-[var(--color-fg-brand)] text-2xl w-8 h-8 flex items-center justify-center hover:bg-[var(--color-brand-softer)] rounded pb-1 transition-colors"
                  onClick={() => setCount(count + 1)}
                >
                  +
                </button>
              </div>

              <button
                className="flex-1 h-12 bg-[var(--color-brand)] hover:bg-[var(--color-brand-strong)] text-white rounded-md px-4 flex items-center justify-between transition-colors mx-auto"
                onClick={handleAdicionar}
              >
                <span className="text-sm font-medium">Adicionar</span>
                <span className="text-sm font-medium">
                  {formatarMoeda(produto.precoBase * count)}
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
