import { Outlet, useNavigate } from "react-router-dom"
import { Toaster } from "sonner"

import { useAdminStore } from "../context/AdminContext"

export default function AdminLayout() {
    const { admin, deslogaAdmin } = useAdminStore()
    const navigate = useNavigate()

    function adminSair() {
        if (confirm("Confirma saída da área administrativa?")) {
            deslogaAdmin()
            localStorage.removeItem("adminToken")
            navigate("/admin/login")
        }
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <nav className="border-b border-gray-800 bg-gray-900">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                    <span className="text-white font-semibold tracking-wide">
                        Painel Administrativo
                    </span>
                    {admin.id && (
                        <div className="flex items-center gap-4">
                            <span className="text-gray-300 text-sm">{admin.nome}</span>
                            <button onClick={adminSair}
                                className="text-sm font-medium text-orange-400 hover:text-orange-300 cursor-pointer">
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </nav>
            <Outlet />
            <Toaster richColors position="top-center" />
        </div>
    )
}
