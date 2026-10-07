import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  clienteCadastroSchema,
  type CadastrarClienteInput,
} from "./schemas/ClienteCadastroSchema";
import type { BairroType } from "./utils/BairroType";

const formularioCadastroSchema = clienteCadastroSchema
  .extend({
    confirmarSenha: clienteCadastroSchema.shape.senha,
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

type Inputs = CadastrarClienteInput & { confirmarSenha: string };

type ErroApi = {
  error?: string;
  detalhe?: Record<string, string[] | undefined>;
};

const apiUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, "");

function isBairroTypeArray(value: unknown): value is BairroType[] {
  return (
    Array.isArray(value) &&
    value.every(
      (bairro) =>
        typeof bairro.id === "string" &&
        typeof bairro.bairro === "string" &&
        typeof bairro.valor === "number" &&
        typeof bairro.tempoEntregaMinutos === "number",
    )
  );
}

export default function Cadastro() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    mode: "onBlur",
    resolver: zodResolver(formularioCadastroSchema),
  });
  const [bairros, setBairros] = useState<BairroType[]>([]);
  const [carregandoBairros, setCarregandoBairros] = useState(true);
  const [erroBairros, setErroBairros] = useState(false);
  const [tentativaBairros, setTentativaBairros] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    const controller = new AbortController();

    async function buscaBairros() {
      setCarregandoBairros(true);
      setErroBairros(false);

      try {
        const response = await fetch(`${apiUrl}/clientes/bairros`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Falha ao carregar bairros: HTTP ${response.status}`);
        }

        const dados: unknown = await response.json();
        if (!isBairroTypeArray(dados)) {
          throw new Error("A resposta de bairros tem formato inválido");
        }

        setBairros(dados);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Erro ao carregar bairros de entrega:", error);
        setErroBairros(true);
        toast.error("Não foi possível carregar os bairros de entrega.");
      } finally {
        if (!controller.signal.aborted) {
          setCarregandoBairros(false);
        }
      }
    }

    buscaBairros();
    return () => controller.abort();
  }, [tentativaBairros]);

  async function cadastrarCliente(data: Inputs) {
    try {
      const response = await fetch(`${apiUrl}/clientes`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({
          nome: data.nome.trim(),
          telefone: data.telefone,
          senha: data.senha,
          rua: data.rua.trim(),
          numero: data.numero.trim(),
          obs: data.obs?.trim() || undefined,
          bairroID: data.bairroID,
        }),
      });

      if (response.status === 201) {
        toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
        navigate("/login");
        return;
      }

      const dados: ErroApi = await response.json().catch(() => ({}));
      if (response.status === 409) {
        toast.error(dados.error ?? "Já existe um cadastro com este telefone.");
        return;
      }

      const erroValidacao = dados.detalhe
        ? Object.values(dados.detalhe).flat().find(Boolean)
        : undefined;
      toast.error(
        erroValidacao ??
          dados.error ??
          "Não foi possível concluir o cadastro. Tente novamente.",
      );
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      toast.error("Não foi possível conectar ao servidor. Tente novamente.");
    }
  }

  const classeCampo =
    "block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-orange-600 focus:ring-orange-600";
  const classeLabel = "mb-2 block text-sm font-medium text-gray-900";
  const classeErro = "mt-1 text-sm text-red-600";

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-fundo px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-2xl rounded-xl bg-white shadow-md ring-1 ring-secundaria/10">
        <div className="space-y-6 p-5 sm:p-8">
          <header>
            <h1 className="text-xl font-bold tracking-tight text-secundaria sm:text-2xl">
              Criar conta de cliente
            </h1>
            <p className="mt-1 text-sm text-secundaria/65">
              Preencha seus dados para fazer pedidos e acompanhar as entregas.
            </p>
          </header>

          <form
            className="space-y-5"
            noValidate
            onSubmit={handleSubmit(cadastrarCliente)}
          >
            <div>
              <label htmlFor="nome" className={classeLabel}>
                Nome completo
              </label>
              <input
                type="text"
                id="nome"
                autoComplete="name"
                className={classeCampo}
                aria-invalid={Boolean(errors.nome)}
                {...register("nome")}
              />
              {errors.nome && (
                <p className={classeErro}>{errors.nome.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="telefone" className={classeLabel}>
                Telefone (DDD + número)
              </label>
              <input
                type="tel"
                id="telefone"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ex.: (53) 99999-9999"
                className={classeCampo}
                aria-invalid={Boolean(errors.telefone)}
                {...register("telefone", {
                  setValueAs: (valor: string) => valor.replace(/\D/g, ""),
                })}
              />
              {errors.telefone && (
                <p className={classeErro}>{errors.telefone.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="senha" className={classeLabel}>
                  Senha
                </label>
                <input
                  type="password"
                  id="senha"
                  autoComplete="new-password"
                  className={classeCampo}
                  aria-invalid={Boolean(errors.senha)}
                  {...register("senha")}
                />
                {errors.senha && (
                  <p className={classeErro}>{errors.senha.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmarSenha" className={classeLabel}>
                  Confirmar senha
                </label>
                <input
                  type="password"
                  id="confirmarSenha"
                  autoComplete="new-password"
                  className={classeCampo}
                  aria-invalid={Boolean(errors.confirmarSenha)}
                  {...register("confirmarSenha")}
                />
                {errors.confirmarSenha && (
                  <p className={classeErro}>
                    {errors.confirmarSenha.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label htmlFor="rua" className={classeLabel}>
                  Rua
                </label>
                <input
                  type="text"
                  id="rua"
                  autoComplete="address-line1"
                  className={classeCampo}
                  aria-invalid={Boolean(errors.rua)}
                  {...register("rua")}
                />
                {errors.rua && (
                  <p className={classeErro}>{errors.rua.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="numero" className={classeLabel}>
                  Número
                </label>
                <input
                  type="text"
                  id="numero"
                  autoComplete="address-line2"
                  className={classeCampo}
                  aria-invalid={Boolean(errors.numero)}
                  {...register("numero")}
                />
                {errors.numero && (
                  <p className={classeErro}>{errors.numero.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="bairroID" className={classeLabel}>
                Bairro de entrega
              </label>
              <select
                id="bairroID"
                className={classeCampo}
                disabled={carregandoBairros || erroBairros || bairros.length === 0}
                aria-invalid={Boolean(errors.bairroID)}
                {...register("bairroID")}
              >
                <option value="">
                  {carregandoBairros
                    ? "Carregando bairros..."
                    : erroBairros
                      ? "Não foi possível carregar"
                      : bairros.length === 0
                        ? "Nenhum bairro disponível"
                        : "Selecione seu bairro"}
                </option>
                {bairros.map((bairro) => (
                  <option key={bairro.id} value={bairro.id}>
                    {bairro.bairro} (taxa:{" "}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(bairro.valor)}
                    )
                  </option>
                ))}
              </select>
              {errors.bairroID && (
                <p className={classeErro}>{errors.bairroID.message}</p>
              )}
              {erroBairros && (
                <button
                  type="button"
                  onClick={() => setTentativaBairros((tentativa) => tentativa + 1)}
                  className="mt-2 text-sm font-semibold text-primaria hover:underline"
                >
                  Tentar carregar os bairros novamente
                </button>
              )}
            </div>

            <div>
              <label htmlFor="obs" className={classeLabel}>
                Observações <span className="font-normal text-secundaria/60">(opcional)</span>
              </label>
              <input
                type="text"
                id="obs"
                maxLength={200}
                placeholder="Ponto de referência, complemento, etc."
                className={classeCampo}
                {...register("obs")}
              />
              {errors.obs && (
                <p className={classeErro}>{errors.obs.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                carregandoBairros ||
                erroBairros ||
                bairros.length === 0
              }
              className="w-full rounded-lg bg-primaria px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-secundaria focus:outline-none focus:ring-4 focus:ring-primaria/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Cadastrando..." : "Criar conta"}
            </button>

            <p className="text-center text-sm text-secundaria/70">
              Já possui conta?{" "}
              <Link
                to="/login"
                className="font-semibold text-primaria hover:underline"
              >
                Entrar
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
