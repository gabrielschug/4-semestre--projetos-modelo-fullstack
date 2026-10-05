import { Button } from "flowbite-react";
import { Star } from "lucide-react";
import type { PedidoType } from "../utils/PedidoType";

interface PedidoCardProps {
  pedido: PedidoType;
  acaoEmAndamento: string;
  onCancelar: (pedidoID: string) => void;
  onAvaliar: (
    pedidoID: string,
    itemID: string,
    avaliacao: number,
  ) => void;
}

const statusPedido: Record<string, string> = {
  PENDENTE: "Pendente",
  PREPARANDO: "Em preparo",
  PRONTO: "Pronto",
  EM_ROTA: "Saiu para entrega",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

export function PedidoCard({
  pedido,
  acaoEmAndamento,
  onCancelar,
  onAvaliar,
}: PedidoCardProps) {
  return (
    <div className="flex flex-wrap items-start gap-y-4 py-6">
      <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
        <dt className="text-base font-medium text-gray-500  dark:text-gray-400 justify-start">
          Pedido:
        </dt>
        <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
          #{pedido.id}
        </dd>
      </dl>

      <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
        <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
          Data:
        </dt>
        <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
          {new Date(pedido.dataHora).toLocaleDateString("pt-BR")}
        </dd>
      </dl>

      <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
        <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
          Preço:
        </dt>
        <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
          {formatarMoeda(pedido.valorTotal)}
        </dd>
      </dl>

      <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
        <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
          Status:
        </dt>
        <dd
          className={`me-2 mt-1.5 inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium ${
            pedido.status === "PENDENTE"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
              : pedido.status === "ENTREGUE"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                : pedido.status === "CANCELADO"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  : "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
          }`}
        >
          {statusPedido[pedido.status] ?? pedido.status}
        </dd>
      </dl>

      <dl className="w-full sm:w-1/2 lg:w-auto lg:flex-1">
        <dt className="text-base font-medium text-gray-500 dark:text-gray-400">
          Entrega:
        </dt>
        <dd className="mt-1.5 text-sm text-gray-900 dark:text-white">
          {pedido.modalEntrega === "DELIVERY" ? "Delivery" : "Retirada"} (
          {pedido.tempoTotalEstimadoMinutos} min)
        </dd>
      </dl>

      <dl className="w-full lg:w-[260px] xl:w-auto lg:flex-1">
        <dt className="mb-1.5 text-base font-medium text-gray-500 dark:text-gray-400">
          Produtos e Avaliação:
        </dt>
        <dd>
          <ul className="space-y-3">
            {pedido.itens.map((item) => (
              <li key={item.id} className="flex flex-col gap-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.produto.descricao}
                </p>
                {pedido.status === "ENTREGUE" ? (
                  <div
                    className="flex items-center gap-1"
                    role="group"
                    aria-label={`Avaliação de ${item.produto.descricao}`}
                  >
                    {[1, 2, 3, 4, 5].map((estrela) => (
                      <button
                        key={estrela}
                        type="button"
                        disabled={
                          acaoEmAndamento === `${pedido.id}:${item.id}`
                        }
                        onClick={() =>
                          onAvaliar(pedido.id, item.id, estrela)
                        }
                        className="rounded p-0.5 text-amber-500 hover:text-amber-600 disabled:cursor-wait disabled:opacity-50"
                      >
                        <Star
                          className="h-4 w-4"
                          fill={
                            item.avaliacao !== null &&
                            item.avaliacao >= estrela
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    ))}
                    <span className="ml-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                      {item.avaliacao ? `${item.avaliacao}/5` : "Avalie"}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Avaliação após entrega
                  </p>
                )}
              </li>
            ))}
          </ul>
        </dd>
      </dl>

      <div className="mt-4 flex w-full flex-col gap-3 sm:mt-0 sm:grid sm:grid-cols-2 lg:flex lg:w-auto lg:min-w-[280px] lg:items-center lg:justify-end">
        {pedido.status === "PENDENTE" && (
          <Button
            color="red"
            outline
            className="w-full cursor-poiter lg:w-auto"
            disabled={acaoEmAndamento === pedido.id}
            onClick={() => onCancelar(pedido.id)}
          >
            {acaoEmAndamento === pedido.id
              ? "Cancelando..."
              : "Cancelar pedido"}
          </Button>
        )}
      </div>
    </div>
  );
}
