import AdminPedidoCard from "./AdminPedidoCard";
import type {
  PedidoAdmin,
  StatusPedido,
} from "../utils/AdminPedidoType";

type CorColuna = "amber" | "orange" | "violet" | "blue" | "green" | "gray";

export type ConfiguracaoColunaKanban = {
  status: StatusPedido;
  titulo: string;
  cor: CorColuna;
};

type AdminKanbanColunaProps = {
  coluna: ConfiguracaoColunaKanban;
  pedidos: PedidoAdmin[];
  carregando: boolean;
  pedidoAtualizando: string | null;
  onAlterarStatus: (pedido: PedidoAdmin, status: StatusPedido) => void;
};

const estilosColuna: Record<CorColuna, string> = {
  amber: "border-amber-200 bg-amber-50",
  orange: "border-orange-200 bg-orange-50",
  violet: "border-violet-200 bg-violet-50",
  blue: "border-blue-200 bg-blue-50",
  green: "border-green-200 bg-green-50",
  gray: "border-gray-200 bg-gray-100",
};

const estilosCabecalho: Record<CorColuna, string> = {
  amber: "text-amber-900",
  orange: "text-orange-900",
  violet: "text-violet-900",
  blue: "text-blue-900",
  green: "text-green-900",
  gray: "text-gray-700",
};

export default function AdminKanbanColuna({
  coluna,
  pedidos,
  carregando,
  pedidoAtualizando,
  onAlterarStatus,
}: AdminKanbanColunaProps) {
  return (
    <section
      aria-label={`${coluna.titulo}: ${pedidos.length} pedidos`}
      className={`flex h-full min-h-0 w-[min(82vw,18rem)] shrink-0 flex-col rounded-lg border ${estilosColuna[coluna.cor]}`}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 px-3 py-2.5">
        <h6 className={`text-xs font-bold ${estilosCabecalho[coluna.cor]}`}>
          {coluna.titulo}
        </h6>
        <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold text-gray-700">
          {pedidos.length}
        </span>
      </header>

      <div className="admin-kanban-column-scroll min-h-0 flex-1 space-y-2 overflow-y-scroll px-2 pb-2">
        {!carregando && pedidos.length === 0 && (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white/60 px-2 py-4 text-center text-xs text-gray-500">
            Nenhum pedido nesta etapa.
          </p>
        )}
        {pedidos.map((pedido) => (
          <AdminPedidoCard
            key={pedido.id}
            pedido={pedido}
            atualizando={pedidoAtualizando === pedido.id}
            onAlterarStatus={onAlterarStatus}
          />
        ))}
      </div>
    </section>
  );
}
