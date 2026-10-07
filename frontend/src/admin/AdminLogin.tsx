import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAdminStore } from "../context/AdminContext";

type Inputs = {
  email: string;
  senha: string;
};

const apiUrl = import.meta.env.VITE_API_URL

export default function AdminLogin() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Inputs>();
  const { logaAdmin } = useAdminStore();
  const navigate = useNavigate();

  async function verificaLoginAdmin(data: Inputs) {
    try {
      const response = await fetch(`${apiUrl}/admins/login`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ email: data.email, senha: data.senha }),
      });

      if (response.status === 200) {
        const dados = await response.json();

        logaAdmin(dados.admin, dados.token);
        localStorage.setItem("adminToken", dados.token);

        toast.success(`Bem-vindo(a), ${dados.admin.nome}!`);
        navigate("/admin", { replace: true });
      } else {
        toast.error("E-mail ou senha incorretos");
      }
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível conectar ao servidor. Tente novamente.");
    }
  }

  return (
    <section className="bg-gray-950 min-h-screen flex items-center">
      <div className="flex flex-col items-center px-6 py-8 mx-auto w-full">
        <div className="w-full bg-gray-900 rounded-lg shadow-lg border border-gray-800 sm:max-w-md p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <span className="inline-block text-xs tracking-widest uppercase text-orange-400 font-semibold">
              Área restrita
            </span>
            <h1 className="text-xl font-bold text-white md:text-2xl">
              Acesso Administrativo
            </h1>
            <p className="text-sm text-gray-400">
              Esta área é exclusiva para administradores do sistema.
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={handleSubmit(verificaLoginAdmin)}
          >
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-300"
              >
                E-mail administrativo
              </label>
              <input
                type="email"
                id="email"
                className="bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                required
                {...register("email", { required: true })}
              />
            </div>
            <div>
              <label
                htmlFor="senha"
                className="block mb-2 text-sm font-medium text-gray-300"
              >
                Senha
              </label>
              <input
                type="password"
                id="senha"
                className="bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-orange-500 focus:border-orange-500 block w-full p-2.5"
                required
                {...register("senha", { required: true })}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white bg-orange-600 hover:bg-orange-700 focus:ring-4 focus:outline-none focus:ring-orange-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-60"
            >
              {isSubmitting ? "Verificando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
