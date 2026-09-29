import { useAdminStore } from "../context/AdminContext"

export default function AdminPainel() {
    const { admin } = useAdminStore()

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold text-white mb-2">
                Olá, {admin.nome}
            </h1>
            <p className="text-gray-400">
                Você está autenticado na área restrita de administradores ({admin.email}).
            </p>
            <p className="text-gray-500 text-sm mt-4">
                Este é um painel de exemplo — as demais funcionalidades administrativas
                (produtos, pedidos, etc.) podem ser construídas aqui, já protegidas por este login.
            </p>
        </div>
    )
}
