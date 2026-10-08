import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CircleX,
  Clock3,
  MapPin,
  MessageCircle,
  Package,
  Phone,
} from "lucide-react";
import type { PedidoAdmin, StatusPedido } from "../utils/AdminPedidoType";
import { linkWhatsapp, mensagemDoCard } from "../utils/mensagemWhatsapp";
import AdminPedidoCancelar from "./AdminPedidoCancelar";

type AdminPedidoCardProps = {
  pedido: PedidoAdmin;
  atualizando: boolean;
  onAlterarStatus: (pedido: PedidoAdmin, status: StatusPedido) => void;
};

const nomesStatus: Record<StatusPedido, string> = {
  PENDENTE: "Novos pedidos",
  PREPARANDO: "Em preparo",
  PRONTO: "Prontos",
  EM_ROTA: "Em rota",
  ENTREGUE: "Entregues",
  CANCELADO: "Cancelados",
};

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);

function proximoStatus(pedido: PedidoAdmin): StatusPedido | null {
  switch (pedido.status) {
    case "PENDENTE":
      return "PREPARANDO";
    case "PREPARANDO":
      return "PRONTO";
    case "PRONTO":
      return pedido.modalEntrega === "RETIRADA" ? "ENTREGUE" : "EM_ROTA";
    case "EM_ROTA":
      return "ENTREGUE";
    default:
      return null;
  }
}

function statusAnterior(pedido: PedidoAdmin): StatusPedido | null {
  switch (pedido.status) {
    case "PREPARANDO":
      return "PENDENTE";
    case "PRONTO":
      return "PREPARANDO";
    case "EM_ROTA":
      return "PRONTO";
    default:
      return null;
  }
}

export default function AdminPedidoCard({
  pedido,
  atualizando,
  onAlterarStatus,
}: AdminPedidoCardProps) {
  const [confirmacaoAberta, setConfirmacaoAberta] = useState(false);
  const destino = proximoStatus(pedido);
  const statusAnteriorPedido = statusAnterior(pedido);
  const mensagemWhatsapp =
    pedido.status === "CANCELADO" || pedido.status === "ENTREGUE"
      ? null
      : mensagemDoCard(pedido);

  return (
    <article className="space-y-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-gray-900">
            {pedido.cliente.nome}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-500">
            Pedido #{pedido.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <time
          dateTime={pedido.dataHora}
          className="shrink-0 text-right text-xs text-gray-500"
        >
          {new Date(pedido.dataHora).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>

      <ul className="space-y-1 border-y border-gray-100 py-2">
        {pedido.itens.map((item) => (
          <li
            key={item.id}
            className="flex justify-between gap-2 text-xs"
          >
            <span className="min-w-0 text-gray-700">
              <strong className="mr-1 text-gray-900">{item.quantidade}x</strong>
              {item.produto.descricao}
            </span>
            <span className="shrink-0 text-[11px] text-gray-600">
              {formatarMoeda(item.quantidade * item.precoProduto)}
            </span>
          </li>
        ))}
      </ul>

      <div className="space-y-1.5 text-xs text-gray-600">
        <p className="flex items-center gap-2">
          <Package aria-hidden="true" className="h-3 w-3 shrink-0" />
          {pedido.modalEntrega === "DELIVERY" ? "Entrega" : "Retirada"}
          <span aria-hidden="true">·</span>
          <Clock3 aria-hidden="true" className="h-3 w-3 shrink-0" />
          {pedido.tempoTotalEstimadoMinutos} min
        </p>
        {pedido.modalEntrega === "DELIVERY" && (
          <p className="flex items-start gap-2">
            <MapPin
              aria-hidden="true"
              className="mt-0.5 h-3 w-3 shrink-0"
            />
            <span>
              {pedido.cliente.rua}, {pedido.cliente.numero}
              {" · "}
              {pedido.cliente.bairro.bairro}
            </span>
          </p>
        )}
        <a
          href={`https://wa.me/55${pedido.cliente.telefone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-orange-800 hover:underline"
        >
          <Phone aria-hidden="true" className="h-3 w-3" />
          {pedido.cliente.telefone}
        </a>
        {pedido.anotacaoCliente && (
          <p className="rounded-md bg-amber-50 p-1.5 text-xs text-amber-900">
            {pedido.anotacaoCliente}
          </p>
        )}
      </div>

      {mensagemWhatsapp && (
        <a
          href={linkWhatsapp(pedido.cliente.telefone, mensagemWhatsapp.texto)}
          target="_blank"
          rel="noopener noreferrer"
          title="Abre o WhatsApp com a mensagem pronta para enviar ao cliente"
          className="flex w-full items-center justify-center gap-1.5 rounded-md bg-green-600 px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-green-700"
        >
          <MessageCircle aria-hidden="true" className="h-3.5 w-3.5" />
          WhatsApp: {mensagemWhatsapp.rotulo}
        </a>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
        <span className="text-xs font-bold text-gray-900">
          {formatarMoeda(pedido.valorTotal)}
        </span>
        <div className="flex items-center gap-1">
          {statusAnteriorPedido && (
            <button
              type="button"
              onClick={() => onAlterarStatus(pedido, statusAnteriorPedido)}
              disabled={atualizando}
              aria-label={`Voltar para ${nomesStatus[statusAnteriorPedido]}`}
              title={`Voltar para ${nomesStatus[statusAnteriorPedido]}`}
              className="inline-flex items-center gap-0.5 rounded-md border border-gray-300 px-1.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-wait disabled:opacity-60"
            >
              <ArrowLeft aria-hidden="true" className="h-3 w-3" />
              Voltar
            </button>
          )}
          {destino && (
            <button
              type="button"
              onClick={() => onAlterarStatus(pedido, destino)}
              disabled={atualizando}
              className="inline-flex items-center gap-0.5 rounded-md bg-gray-900 px-1.5 py-1 text-[11px] font-semibold text-white hover:bg-gray-700 disabled:cursor-wait disabled:opacity-60"
            >
              {atualizando
                ? "Salvando..."
                : pedido.status === "PRONTO" &&
                    pedido.modalEntrega === "RETIRADA"
                  ? "Entregue"
                  : nomesStatus[destino]}
              <ArrowRight aria-hidden="true" className="h-3 w-3" />
            </button>
          )}
          {(pedido.status === "PENDENTE" ||
            pedido.status === "PREPARANDO") && (
            <button
              type="button"
              onClick={() => setConfirmacaoAberta(true)}
              disabled={atualizando}
              aria-label="Cancelar pedido"
              title="Cancelar pedido"
              className="inline-flex items-center justify-center rounded-md p-1.5 text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
            >
              <CircleX aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <AdminPedidoCancelar
        open={confirmacaoAberta}
        pedidoId={pedido.id}
        salvando={atualizando}
        onClose={() => setConfirmacaoAberta(false)}
        onConfirm={() => {
          onAlterarStatus(pedido, "CANCELADO");
          setConfirmacaoAberta(false);
        }}
      />
    </article>
  );
}
