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
    <div className="flex mx-4 md:mx-auto max-w-5xl m-2 items-center">
      <form className="flex-1" onSubmit={handleSubmit(enviaPesquisa)}>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-1 pointer-events-none"></div>
          <input
            type="search"
            id="default-search"
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Busque o item"
            required
            {...register("termo")}
          />
          <button
            type="submit"
            className="text-blue-600 absolute end-1 bottom-2 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <Search />
          </button>
        </div>
      </form>

      <button
        type="button"
        className="ms-2 focus:outline-none text-white bg-gray-500 hover:bg-blue-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-6 py-4 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
        onClick={mostraDestaques}
      >
        Todos
      </button>
    </div>
  );
}
