import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, ShoppingCart, X } from "lucide-react";
import { useClienteStore } from "../context/ClienteContext";
import { useCarrinho } from "../context/useCarrinhoStore";

export default function Titulo() {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);
  const limparCarrinho = useCarrinho((state) => state.limparCarrinho);
  const abrirDrawer = useCarrinho((state) => state.abrirDrawer);
  const itens = useCarrinho((state) => state.itens);
  const cliente = useClienteStore((state) => state.cliente);
  const deslogaCliente = useClienteStore((state) => state.deslogaCliente);

  const totalItens = itens.reduce(
    (acumulador, item) => acumulador + item.quantidade,
    0,
  );

  function fecharMenu() {
    setMenuAberto(false);
  }

  function clienteSair() {
    if (confirm("Confirma saída do sistema?")) {
      deslogaCliente();
      localStorage.removeItem("clienteKey");
      limparCarrinho();
      fecharMenu();
      navigate("/login");
    }
  }

  return (
    <nav className="relative border-b border-secundaria/10 bg-white shadow-sm">
      <div className="mx-auto max-w-screen-xl px-3 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between gap-2 py-2 sm:gap-4">
          <Link
            to="/"
            onClick={fecharMenu}
            className="flex min-w-0 items-center gap-2 sm:gap-3"
          >
            <img
              src="/logo.png"
              className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
              alt=""
            />
            <span className="min-w-0 text-sm font-bold leading-tight text-secundaria sm:text-lg md:text-2xl">
              Restaurante Minuta Campeira
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            {totalItens > 0 && (
              <button
                type="button"
                onClick={() => {
                  fecharMenu();
                  abrirDrawer();
                }}
                aria-label={`Abrir carrinho com ${totalItens} ${
                  totalItens === 1 ? "item" : "itens"
                }`}
                className="relative inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primaria px-3 text-sm font-semibold text-white transition-colors hover:bg-secundaria focus:outline-none focus:ring-2 focus:ring-primaria focus:ring-offset-2 sm:px-4"
              >
                <ShoppingCart aria-hidden="true" className="h-4 w-4" />
                <span className="hidden sm:inline">Carrinho</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                  {totalItens}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMenuAberto((aberto) => !aberto)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-secundaria transition-colors hover:bg-secundaria/5 focus:outline-none focus:ring-2 focus:ring-primaria md:hidden"
              aria-controls="menu-principal"
              aria-expanded={menuAberto}
              aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            >
              {menuAberto ? (
                <X aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Menu aria-hidden="true" className="h-5 w-5" />
              )}
            </button>
          </div>

          <div
            id="menu-principal"
            className={`${
              menuAberto ? "block" : "hidden"
            } absolute left-0 right-0 top-full z-50 border-b border-secundaria/10 bg-white px-3 pb-3 shadow-lg md:static md:block md:w-auto md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
          >
            <ul className="flex flex-col gap-1 md:flex-row md:items-center md:gap-2">
              {cliente.id ? (
                <>
                  <li className="border-b border-secundaria/10 px-3 py-3 md:border-0 md:px-2 md:py-2">
                    <span className="block truncate text-sm font-semibold text-secundaria">
                      {cliente.nome}
                    </span>
                    <span className="text-xs text-secundaria/60 md:hidden">
                      Conta conectada
                    </span>
                  </li>
                  <li>
                    <Link
                      to="/meusPedidos"
                      onClick={fecharMenu}
                      className="block rounded-lg px-3 py-3 text-sm font-semibold text-secundaria transition-colors hover:bg-primaria/10 hover:text-primaria md:px-4 md:py-2"
                    >
                      Meus pedidos
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={clienteSair}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 md:px-4 md:py-2"
                    >
                      <LogOut aria-hidden="true" className="h-4 w-4" />
                      Sair
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    onClick={fecharMenu}
                    className="block rounded-lg px-3 py-3 text-sm font-semibold text-secundaria transition-colors hover:bg-primaria/10 hover:text-primaria md:px-4 md:py-2"
                  >
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
