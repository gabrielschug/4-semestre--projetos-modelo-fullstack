import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.tsx";
import Login from "./Login.tsx";
import Cadastro from "./Cadastro.tsx";
import Layout from "./Layout.tsx";
import Detalhes from "./Detalhes.tsx";
import MeusPedidos from "./MeusPedidos.tsx";

// ----------------- Rotas de Admin
import AdminLayout from "./admin/AdminLayout.tsx";
import AdminLogin from "./admin/AdminLogin.tsx";
import AdminPainel from "./admin/AdminPainel.tsx";
import AdminRotaProtegida from "./admin/AdminRotaProtegida.tsx";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const rotas = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: "login", element: <Login /> },
      { path: "produtos/:produtoId", element: <Detalhes /> },
      { path: "meusPedidos", element: <MeusPedidos /> },
      { path: "cadastro", element: <Cadastro /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "login", element: <AdminLogin /> },
      {
        path: "painel",
        element: (
          <AdminRotaProtegida>
            <AdminPainel />
          </AdminRotaProtegida>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={rotas} />
  </StrictMode>,
);
