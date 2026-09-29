import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import type { BairroType } from "./utils/BairroType"

type Inputs = {
    nome: string
    telefone: string
    senha: string
    confirmarSenha: string
    rua: string
    numero: string
    obs: string
    bairroID: string
}

const apiUrl = import.meta.env.VITE_API_URL

export default function Cadastro() {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Inputs>()
    const [bairros, setBairros] = useState<BairroType[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        async function buscaBairros() {
            try {
                const response = await fetch(`${apiUrl}clientes/bairros`)
                const dados = await response.json()
                setBairros(dados)
            } catch (error) {
                console.error(error)
                toast.error("Não foi possível carregar os bairros de entrega")
            }
        }
        buscaBairros()
    }, [])

    async function cadastrarCliente(data: Inputs) {
        if (data.senha !== data.confirmarSenha) {
            toast.error("As senhas informadas não coincidem")
            return
        }

        try {
            const response = await fetch(`${apiUrl}clientes`, {
                headers: { "Content-Type": "application/json" },
                method: "POST",
                body: JSON.stringify({
                    nome: data.nome,
                    telefone: data.telefone,
                    senha: data.senha,
                    rua: data.rua,
                    numero: data.numero,
                    obs: data.obs || undefined,
                    bairroID: data.bairroID,
                })
            })

            if (response.status === 201) {
                toast.success("Cadastro realizado com sucesso! Faça login para continuar.")
                navigate("/login")
            } else if (response.status === 409) {
                toast.error("Já existe um cadastro com este telefone")
            } else {
                const dados = await response.json().catch(() => null)
                toast.error(dados?.error ?? "Não foi possível concluir o cadastro")
            }
        } catch (error) {
            console.error(error)
            toast.error("Não foi possível conectar ao servidor. Tente novamente.")
        }
    }

    return (
        <section className="bg-gray-50 dark:bg-gray-900">
            <p style={{ height: 48 }}></p>
            <div className="flex flex-col items-center px-6 py-8 mx-auto lg:py-0">
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-xl xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                            Criar Conta de Cliente
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(cadastrarCliente)}>
                            <div>
                                <label htmlFor="nome" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nome completo</label>
                                <input type="text" id="nome"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    {...register("nome", { required: "Informe seu nome", minLength: { value: 3, message: "Nome muito curto" } })} />
                                {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="telefone" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Telefone (DDD + número)</label>
                                <input type="tel" id="telefone" placeholder="Ex: 53999999999"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    {...register("telefone", {
                                        required: "Informe seu telefone",
                                        pattern: { value: /^\d{10,11}$/, message: "Informe DDD + número, apenas números" }
                                    })} />
                                {errors.telefone && <p className="text-sm text-red-600 mt-1">{errors.telefone.message}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="senha" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Senha</label>
                                    <input type="password" id="senha"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        {...register("senha", { required: "Informe uma senha", minLength: { value: 6, message: "Mínimo de 6 caracteres" } })} />
                                    {errors.senha && <p className="text-sm text-red-600 mt-1">{errors.senha.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="confirmarSenha" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Confirmar senha</label>
                                    <input type="password" id="confirmarSenha"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        {...register("confirmarSenha", {
                                            required: "Confirme sua senha",
                                            validate: (valor) => valor === watch("senha") || "As senhas não coincidem"
                                        })} />
                                    {errors.confirmarSenha && <p className="text-sm text-red-600 mt-1">{errors.confirmarSenha.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <label htmlFor="rua" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Rua</label>
                                    <input type="text" id="rua"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        {...register("rua", { required: "Informe a rua" })} />
                                    {errors.rua && <p className="text-sm text-red-600 mt-1">{errors.rua.message}</p>}
                                </div>
                                <div>
                                    <label htmlFor="numero" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Número</label>
                                    <input type="text" id="numero"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        {...register("numero", { required: "Informe o número" })} />
                                    {errors.numero && <p className="text-sm text-red-600 mt-1">{errors.numero.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="bairroID" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Bairro de entrega</label>
                                <select id="bairroID"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    {...register("bairroID", { required: "Selecione seu bairro" })}>
                                    <option value="">Selecione...</option>
                                    {bairros.map((bairro) => (
                                        <option key={bairro.id} value={bairro.id}>
                                            {bairro.bairro} (taxa: R$ {bairro.valor.toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                                {errors.bairroID && <p className="text-sm text-red-600 mt-1">{errors.bairroID.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="obs" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Observações (opcional)</label>
                                <input type="text" id="obs" placeholder="Ponto de referência, complemento, etc."
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    {...register("obs")} />
                            </div>

                            <button type="submit" disabled={isSubmitting}
                                className="w-full text-white bg-orange-600 hover:bg-orange-700 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-60">
                                {isSubmitting ? "Cadastrando..." : "Criar conta"}
                            </button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Já possui conta? <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Entrar</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}
