import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useAdminStore } from "../../context/AdminContext";

const apiUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, "");

type Inputs = {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
};

type AdminCadastroModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function AdminCadastroModal({
  open,
  onClose,
}: AdminCadastroModalProps) {
  const token = useAdminStore((state) => state.token);
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();

  function fechar() {
    if (isSubmitting) return;
    reset();
    onClose();
  }

  async function cadastrarAdmin(data: Inputs) {
    const tokenAdmin = token || localStorage.getItem("adminToken");

    try {
      const response = await fetch(`${apiUrl}/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenAdmin}`,
        },
        body: JSON.stringify({
          nome: data.nome,
          email: data.email,
          senha: data.senha,
        }),
      });

      if (response.status === 201) {
        const adminCriado = await response.json();
        toast.success(`Administrador(a) ${adminCriado.nome} cadastrado(a)!`);
        reset();
        onClose();
        return;
      }

      const dados = await response.json().catch(() => null);
      // E-mail duplicado chega como erro 500 com a mensagem de unique do Prisma
      if (String(dados?.detalhe ?? "").includes("Unique constraint")) {
        toast.error("Já existe um administrador com este e-mail.");
      } else if (response.status === 400) {
        toast.error("Dados inválidos. Confira os campos e tente novamente.");
      } else {
        toast.error("Não foi possível cadastrar o administrador.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível conectar ao servidor. Tente novamente.");
    }
  }

  const classeInput =
    "block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-orange-500";
  const classeLabel = "mb-2 block text-sm font-medium text-gray-900";
  const classeErro = "mt-1 text-sm text-red-600";

  return (
    <Modal show={open} size="md" onClose={fechar}>
      <ModalHeader>Cadastrar administrador</ModalHeader>
      <form onSubmit={handleSubmit(cadastrarAdmin)} noValidate>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label htmlFor="admin-nome" className={classeLabel}>
                Nome
              </label>
              <input
                id="admin-nome"
                type="text"
                autoComplete="name"
                className={classeInput}
                {...register("nome", {
                  validate: (valor) =>
                    valor.trim().length >= 3 || "Informe o nome completo",
                })}
              />
              {errors.nome && (
                <p className={classeErro}>{errors.nome.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="admin-email" className={classeLabel}>
                E-mail
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="off"
                className={classeInput}
                {...register("email", {
                  required: "Informe o e-mail",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Informe um e-mail válido",
                  },
                })}
              />
              {errors.email && (
                <p className={classeErro}>{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="admin-senha" className={classeLabel}>
                Senha
              </label>
              <input
                id="admin-senha"
                type="password"
                autoComplete="new-password"
                className={classeInput}
                {...register("senha", {
                  minLength: {
                    value: 6,
                    message: "A senha deve ter no mínimo 6 caracteres",
                  },
                  required: "Informe a senha",
                })}
              />
              {errors.senha && (
                <p className={classeErro}>{errors.senha.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="admin-confirmar-senha" className={classeLabel}>
                Confirmar senha
              </label>
              <input
                id="admin-confirmar-senha"
                type="password"
                autoComplete="new-password"
                className={classeInput}
                {...register("confirmarSenha", {
                  validate: (valor) =>
                    valor === getValues("senha") || "As senhas não conferem",
                })}
              />
              {errors.confirmarSenha && (
                <p className={classeErro}>{errors.confirmarSenha.message}</p>
              )}
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="justify-end gap-3">
          <Button color="light" onClick={fechar} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" color="primary" disabled={isSubmitting}>
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
