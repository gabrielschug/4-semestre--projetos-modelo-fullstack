import { useState } from "react";
import { useAdminStore } from "../../context/AdminContext";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BoxIcon,
  ChevronLeft,
  ChevronRight,
  X,
  KanbanSquare,
  LayoutDashboardIcon,
  LocationEdit,
  LogOutIcon,
  UserPlus,
} from "lucide-react";
import AdminCadastroModal from "./AdminCadastroModal";

type AdminSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
};

const links = [
  { to: "/admin", label: "Kanban", icon: KanbanSquare, end: true },
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
    end: false,
  },
  { to: "/admin/produtos", label: "Produtos", icon: BoxIcon, end: false },
  { to: "/admin/locais", label: "Locais", icon: LocationEdit, end: false },
];

export default function AdminSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapsed,
  onCloseMobile,
}: AdminSidebarProps) {
  const navigate = useNavigate();
  const deslogaAdmin = useAdminStore((state) => state.deslogaAdmin);
  const [cadastroAberto, setCadastroAberto] = useState(false);

  function adminSair() {
    if (confirm("Confirma Saída?")) {
      deslogaAdmin();
      localStorage.removeItem("adminToken");
      navigate("/", { replace: true });
    }
  }

  return (
    <aside
      aria-label="Navegação administrativa"
      className={`fixed inset-y-16 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white shadow-lg transition-[width,transform] duration-200 md:sticky md:inset-y-auto md:top-0 md:bottom-auto md:z-auto md:h-[calc(100vh-4rem)] md:translate-x-0 md:shadow-none ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } ${collapsed ? "md:w-20" : "md:w-64"}`}
    >
      <div
        className={`flex h-16 shrink-0 items-center border-b border-gray-100 ${
          collapsed ? "md:justify-center md:px-2" : "justify-between px-4"
        }`}
      >
        <Link
          to="/admin"
          onClick={onCloseMobile}
          aria-label="Minuta Campeira, página inicial administrativa"
          className={`flex min-w-0 items-center gap-3 ${
            collapsed ? "md:justify-center" : ""
          }`}
        >
          <img
            src="/favicon.svg"
            alt=""
            className="h-8 w-8 shrink-0"
          />
          <span
            className={`truncate font-semibold text-gray-900 ${
              collapsed ? "md:hidden" : ""
            }`}
          >
            Minuta Campeira
          </span>
        </Link>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Fechar menu"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          title={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          className="hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:inline-flex"
        >
          {collapsed ? (
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          ) : (
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onCloseMobile}
            title={collapsed ? label : undefined}
            aria-label={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange-50 text-orange-800"
                  : "text-gray-700 hover:bg-gray-100"
              } ${collapsed ? "md:justify-center md:px-2" : ""}`
            }
          >
            <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span className={collapsed ? "md:hidden" : ""}>{label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            setCadastroAberto(true);
          }}
          title={collapsed ? "Novo admin" : undefined}
          aria-label={collapsed ? "Novo admin" : undefined}
          className={`mt-auto flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-800 ${
            collapsed ? "md:justify-center md:px-2" : ""
          }`}
        >
          <UserPlus aria-hidden="true" className="h-5 w-5 shrink-0" />
          <span className={collapsed ? "md:hidden" : ""}>Novo admin</span>
        </button>

        <button
          type="button"
          onClick={adminSair}
          title={collapsed ? "Sair" : undefined}
          aria-label={collapsed ? "Sair" : undefined}
          className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-700 ${
            collapsed ? "md:justify-center md:px-2" : ""
          }`}
        >
          <LogOutIcon aria-hidden="true" className="h-5 w-5 shrink-0" />
          <span className={collapsed ? "md:hidden" : ""}>Sair</span>
        </button>
      </nav>

      <AdminCadastroModal
        open={cadastroAberto}
        onClose={() => setCadastroAberto(false)}
      />
    </aside>
  );
}
