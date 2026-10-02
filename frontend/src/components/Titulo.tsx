import { Link } from "react-router-dom";
import { useClienteStore } from "../context/ClienteContext";
import { useNavigate } from "react-router-dom";
import { useCarrinho } from "../context/useCarrinhoStore";
import { Button } from "flowbite-react";

export default function Titulo() {
  const navigate = useNavigate();

  const { cliente, deslogaCliente } = useClienteStore();
  const { itens, abrirDrawer } = useCarrinho();

  const totalItens = itens.reduce(
    (acumulador, item) => acumulador + item.quantidade,
    0,
  );

  function clienteSair() {
    if (confirm("Confirma saída do sistema?")) {
      deslogaCliente();
      if (localStorage.getItem("clienteKey")) {
        localStorage.removeItem("clienteKey");
      }
      navigate("/login");
    }
  }

  return (
    <nav className="border-cyan-500 bg-cyan-100 border-b-2">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link
          to="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img src="./logo.png" className="h-12" alt="Logo" />
          <span className="self-center text-md md:text-2xl font-semibold whitespace-nowrap ">
            Restaurante Minuta Campeira
          </span>
        </Link>

        {totalItens > 0 && (
          <Button className="relative" onClick={abrirDrawer}>
            <span className="text-white p-2 rounded-md">Carrinho</span>
            <div className=" absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-brand-brand text-xs font-bold text-brand-strong shadow-lg">
              {totalItens}
            </div>
          </Button>
        )}

        <button
          data-collapse-toggle="navbar-solid-bg"
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-controls="navbar-solid-bg"
          aria-expanded="false"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>
        <div className="hidden w-full md:block md:w-auto" id="navbar-solid-bg">
          <ul className="flex flex-col font-medium mt-4 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
            <li>
              {cliente.id ? (
                <>
                  <span className="text-black">{cliente.nome}</span>&nbsp;&nbsp;
                  <Link
                    to="/propostas"
                    className="text-white font-bold bg-gray-600 hover:bg-gray-700 focus:ring-2 focus:outline-none focus:ring-gray-400 rounded-lg text-sm w-full sm:w-auto px-3 py-2 text-center"
                  >
                    Pedidos
                  </Link>
                  &nbsp;&nbsp;
                  <span
                    className="cursor-pointer font-bold text-gray-600"
                    onClick={clienteSair}
                  >
                    Sair
                  </span>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-2 px-3 md:p-0 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700"
                  >
                    Login
                  </Link>
                </>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
