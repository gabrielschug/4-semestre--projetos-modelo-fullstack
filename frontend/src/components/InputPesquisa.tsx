import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ProdutoType } from "../utils/ProdutoType";
import { Search } from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;

type Inputs = {
  termo: string;
};

type InputPesquisaProps = {
  setProdutos: React.Dispatch<React.SetStateAction<ProdutoType[]>>;
};

export function InputPesquisa({ setProdutos }: InputPesquisaProps) {
  const { register, handleSubmit } = useForm<Inputs>();

  async function enviaPesquisa(data: Inputs) {
    const termo = data.termo.trim();
    if (termo.length < 2) {
      toast.error("Informe, no mínimo, 2 caracteres");
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/produtos/pesquisa/${encodeURIComponent(termo)}`,
      );
      if (!response.ok) {
        throw new Error(`Falha na pesquisa (HTTP ${response.status})`);
      }

      const dados: ProdutoType[] = await response.json();
      setProdutos(dados);
      if (dados.length === 0) {
        toast.info("Nenhum produto encontrado.");
      }
    } catch (error) {
      console.error("Erro ao pesquisar produtos:", error);
      toast.error("Não foi possível realizar a busca. Tente novamente.");
    }
  }

  async function mostraTodos() {
    try {
      const response = await fetch(`${apiUrl}/produtos`);
      if (!response.ok) {
        throw new Error(`Falha ao listar produtos (HTTP ${response.status})`);
      }

      const dados: ProdutoType[] = await response.json();
      setProdutos(dados);
    } catch (error) {
      console.error("Erro ao listar produtos:", error);
      toast.error("Não foi possível carregar os produtos. Tente novamente.");
    }
  }

  return (
    <div className="flex mx-4 md:mx-auto max-w-5xl m-2 items-center pt-4">
      <form className="flex-1" onSubmit={handleSubmit(enviaPesquisa)}>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-1 pointer-events-none"></div>
          <input
            type="search"
            id="default-search"
            className="block w-full rounded-lg border border-secundaria/20 bg-white p-4 ps-10 text-sm text-secundaria placeholder:text-secundaria/50 focus:border-primaria focus:ring-primaria"
            placeholder="Busque o item"
            required
            {...register("termo", {
              // Ao limpar o campo, volta a listar todos os produtos
              onChange: (evento) => {
                if (evento.target.value.trim() === "") {
                  mostraTodos();
                }
              },
            })}
          />
          <button
            type="submit"
            className="absolute end-1 bottom-2 rounded-lg bg-primaria px-4 py-2 text-sm font-medium text-white hover:bg-secundaria focus:outline-none focus:ring-4 focus:ring-primaria/30"
          >
            <Search />
          </button>
        </div>
      </form>
    </div>
  );
}
