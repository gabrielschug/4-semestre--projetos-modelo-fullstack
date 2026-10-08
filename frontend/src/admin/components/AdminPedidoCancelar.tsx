import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import { CircleAlert } from "lucide-react";

type AdminPedidoCancelarProps = {
  open: boolean;
  pedidoId: string;
  salvando: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function AdminPedidoCancelar({
  open,
  pedidoId,
  salvando,
  onClose,
  onConfirm,
}: AdminPedidoCancelarProps) {
  return (
    <Modal show={open} size="md" onClose={onClose} popup>
      <ModalHeader />
      <ModalBody>
        <div className="text-center">
          <CircleAlert
            aria-hidden="true"
            className="mx-auto mb-4 h-12 w-12 text-red-600"
          />
          <h3 className="mb-2 text-base font-semibold text-gray-900">
            Cancelar pedido?
          </h3>
          <p className="text-sm text-gray-600">
            Tem certeza de que deseja cancelar o pedido #
            {pedidoId.slice(0, 8).toUpperCase()}? Esta ação não poderá ser
            desfeita.
          </p>
        </div>
      </ModalBody>
      <ModalFooter className="justify-center gap-3">
        <Button color="light" onClick={onClose} disabled={salvando}>
          Manter pedido
        </Button>
        <Button color="red" onClick={onConfirm} disabled={salvando}>
          {salvando ? "Cancelando..." : "Confirmar cancelamento"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
