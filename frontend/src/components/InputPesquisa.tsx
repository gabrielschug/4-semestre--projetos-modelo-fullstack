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
  const { register, handleSubmit, reset } = useForm<Inputs>();

  async function enviaPesquisa(data: Inputs) {
    if (data.termo.length < 2) {
      toast.error("Informe, no mínimo, 2 caracteres");
      return;
    }

    const response = await fetch(`${apiUrl}produtos/pesquisa/${data.termo}`);
    const dados = await response.json();
    // console.log(dados)
    setProdutos(dados);
  }

  async function mostraDestaques() {
    const response = await fetch(`${apiUrl}produtos`);
    const dados = await response.json();
    reset({ termo: "" });
    setProdutos(dados);
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
            {...register("termo")}
          />
          <button
            type="submit"
            className="absolute end-1 bottom-2 rounded-lg bg-primaria px-4 py-2 text-sm font-medium text-white hover:bg-secundaria focus:outline-none focus:ring-4 focus:ring-primaria/30"
          >
            <Search />
          </button>
        </div>
      </form>

      <button
        type="button"
        className="ms-2 rounded-lg bg-secundaria px-6 py-4 text-sm font-medium text-white hover:bg-primaria focus:outline-none focus:ring-4 focus:ring-primaria/30"
        onClick={mostraDestaques}
      >
        Todos
      </button>
    </div>
  );
}
