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
    <nav className=" bg-white">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link
          to="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img src="./logo.png" className="h-12" alt="Logo" />
          <span className="self-center text-md md:text-2xl font-semibold whitespace-nowrap text-secundaria">
            Restaurante Minuta Campeira
          </span>
        </Link>

        {totalItens > 0 && (
          <Button
            className="relative bg-primaria hover:bg-secundaria focus:ring-primaria"
            onClick={abrirDrawer}
          >
            <span className="text-white p-2 rounded-md">Carrinho</span>
            <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primaria bg-fundo text-xs font-bold text-primaria shadow-lg">
              {totalItens}
            </div>
          </Button>
        )}

        <button
          data-collapse-toggle="navbar-solid-bg"
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-secundaria/70 hover:bg-secundaria/5 focus:outline-none focus:ring-2 focus:ring-primaria md:hidden"
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
          <ul className="mt-4 flex flex-col rounded-lg bg-fundo font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-transparent">
            <li>
              {cliente.id ? (
                <>
                  <span className="text-secundaria">{cliente.nome}</span>
                  &nbsp;&nbsp;
                  <Link
                    to="/meusPedidos"
                    className="w-full rounded-lg bg-primaria px-3 py-2 text-center text-sm font-bold text-white hover:bg-secundaria focus:outline-none focus:ring-2 focus:ring-primaria sm:w-auto"
                  >
                    Meus Pedidos
                  </Link>
                  &nbsp;&nbsp;
                  <span
                    className="cursor-pointer font-bold text-secundaria/70 hover:text-primaria"
                    onClick={clienteSair}
                  >
                    Sair
                  </span>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block rounded-sm px-3 py-2 text-secundaria hover:bg-secundaria/5 md:border-0 md:p-0 md:hover:bg-transparent md:hover:text-primaria"
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
