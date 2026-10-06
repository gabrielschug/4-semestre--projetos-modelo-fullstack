import { useEffect, useState, type ReactNode } from "react"
import { Navigate } from "react-router-dom"

import { useAdminStore } from "../context/AdminContext"

const apiUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, "")

type Props = {
    children: ReactNode
}

export default function AdminRotaProtegida({ children }: Props) {
    const { admin, token, logaAdmin, deslogaAdmin } = useAdminStore()
    const [carregando, setCarregando] = useState(true)
    const [autorizado, setAutorizado] = useState(false)

    useEffect(() => {
        async function validarSessao() {
            const tokenSalvo = token || localStorage.getItem("adminToken")

            if (!tokenSalvo) {
                setCarregando(false)
                setAutorizado(false)
                return
            }

            try {
                const response = await fetch(`${apiUrl}/admins/me`, {
                    headers: { Authorization: `Bearer ${tokenSalvo}` }
                })

                if (response.status === 200) {
                    const dadosAdmin = await response.json()
                    logaAdmin(dadosAdmin, tokenSalvo)
                    setAutorizado(true)
                } else {
                    deslogaAdmin()
                    localStorage.removeItem("adminToken")
                    setAutorizado(false)
                }
            } catch (error) {
                console.error(error)
                setAutorizado(false)
            } finally {
                setCarregando(false)
            }
        }

        if (admin.id) {
            setAutorizado(true)
            setCarregando(false)
            return
        }

        validarSessao()
    }, [])

    if (carregando) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <span className="text-gray-400">Verificando acesso...</span>
            </div>
        )
    }

    if (!autorizado) {
        return <Navigate to="/admin/login" replace />
    }

    return <>{children}</>
}
