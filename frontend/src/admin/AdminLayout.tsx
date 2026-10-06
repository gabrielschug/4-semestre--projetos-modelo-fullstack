import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminTitulo from "./components/AdminTitulo";
import AdminSidebar from "./components/AdminSidebar";
import { Toaster } from "sonner";
import AdminRotaProtegida from "./AdminRotaProtegida";
import { Menu } from "lucide-react";

export default function AdminLayout() {
  const [sidebarMinimizado, setSidebarMinimizado] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const isKanban = useLocation().pathname === "/admin";

  return (
    <AdminRotaProtegida>
      <>
        <AdminTitulo />
        <div
          className={`relative flex min-h-0 ${
            isKanban
              ? "h-[calc(100dvh-4rem)] overflow-hidden"
              : "min-h-[calc(100vh-4rem)]"
          }`}
        >
          {menuMobileAberto && (
            <button
              type="button"
              aria-label="Fechar menu de navegação"
              onClick={() => setMenuMobileAberto(false)}
              className="fixed inset-x-0 bottom-0 top-16 z-30 bg-gray-950/40 md:hidden"
            />
          )}
          <AdminSidebar
            collapsed={sidebarMinimizado}
            mobileOpen={menuMobileAberto}
            onToggleCollapsed={() =>
              setSidebarMinimizado((minimizado) => !minimizado)
            }
            onCloseMobile={() => setMenuMobileAberto(false)}
          />
          <main
            className={`min-w-0 flex-1 p-3 sm:p-4 lg:p-6 ${
              isKanban
                ? "flex min-h-0 flex-col overflow-hidden"
                : "overflow-x-hidden"
            }`}
          >
            <button
              type="button"
              onClick={() => setMenuMobileAberto(true)}
              aria-label="Abrir menu de navegação"
              className="mb-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 md:hidden"
            >
              <Menu aria-hidden="true" className="h-4 w-4" />
              Menu
            </button>
            <div
              className={
                isKanban ? "flex min-h-0 flex-1 flex-col" : undefined
              }
            >
              <Outlet />
            </div>
          </main>
        </div>
        <Toaster richColors position="top-right" />
      </>
    </AdminRotaProtegida>
  );
}
