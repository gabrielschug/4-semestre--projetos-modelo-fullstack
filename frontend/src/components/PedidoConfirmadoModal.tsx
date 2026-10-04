import { Button, Modal, ModalBody, ModalHeader } from "flowbite-react";
import { CircleCheck, Clock3, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

type PedidoConfirmadoModalProps = {
  pedidoId: string;
  tempoEstimadoMinutos: number;
  modalEntrega: "DELIVERY" | "RETIRADA";
  clienteLogado: boolean;
  onClose: () => void;
};

export function PedidoConfirmadoModal({
  pedidoId,
  tempoEstimadoMinutos,
  modalEntrega,
  clienteLogado,
  onClose,
}: PedidoConfirmadoModalProps) {
  const navigate = useNavigate();

  const acompanharPedido = () => {
    onClose();
    navigate("/meusPedidos");
  };

  return (
    <Modal show size="md" onClose={onClose} popup>
      <ModalHeader />
      <ModalBody>
        <div className="text-center px-2 pb-2 sm:px-4">
          {/* Ícone de Sucesso */}
          <CircleCheck
            className="mx-auto mb-4 h-16 w-16 text-[#c2410c] dark:text-[#ea580c]"
            strokeWidth={2.5}
          />

          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
            Pedido confirmado!
          </h2>

          {/* Número do pedido com break-all para não quebrar o layout no mobile */}
          <p className="mb-6 text-base text-gray-600 dark:text-gray-400">
            Número do pedido:{" "}
            <strong className="break-all font-bold text-gray-900 dark:text-white">
              {pedidoId}
            </strong>
          </p>

          {/* Previsão - com flex-wrap para telas muito pequenas */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-base text-gray-700 dark:text-gray-300">
            <Clock3 className="h-5 w-5 shrink-0 text-[#c2410c] dark:text-[#ea580c]" />
            <span>
              {modalEntrega === "DELIVERY"
                ? "Previsão de entrega:"
                : "Previsão de preparo:"}{" "}
              <strong className="font-bold text-gray-900 dark:text-white">
                {tempoEstimadoMinutos}{" "}
                {tempoEstimadoMinutos === 1 ? "minuto" : "minutos"}
              </strong>
            </span>
          </div>

          {/* Aviso WhatsApp */}
          <div className="mb-8 flex items-center justify-center gap-3 text-base text-gray-600 dark:text-gray-400">
            <MessageCircle className="h-5 w-5 shrink-0 text-green-600 dark:text-green-500" />
            <p className="leading-snug">
              Enviaremos atualizações sobre seu pedido pelo WhatsApp informado.
            </p>
          </div>

          {/* Botões - Empilham no mobile e ficam lado a lado no desktop */}
          <div className="flex w-full flex-col justify-center gap-3 sm:flex-row">
            {clienteLogado && (
              <Button
                onClick={acompanharPedido}
                className="w-full bg-[#c2410c] text-white hover:bg-[#9a3412] focus:ring-4 focus:ring-orange-300 dark:bg-[#ea580c] dark:hover:bg-[#c2410c] sm:w-auto transition-colors"
              >
                Acompanhar pedido
              </Button>
            )}
            <Button
              color="alternative"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Fechar
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
