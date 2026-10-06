import { Outlet } from "react-router-dom";
import AdminTitulo from "./components/AdminTitulo";
import AdminSidebar from "./components/AdminSidebar";
import { Toaster } from "sonner";
import AdminRotaProtegida from "./AdminRotaProtegida";

export default function AdminLayout() {
  return (
    <AdminRotaProtegida>
      <>
        <AdminTitulo />
        <div className="flex min-h-[calc(100vh-4rem)]">
          <AdminSidebar />
          <main className="min-w-0 flex-1 p-4">
            <Outlet />
          </main>
        </div>
        <Toaster richColors position="top-right" />
      </>
    </AdminRotaProtegida>
  );
}
