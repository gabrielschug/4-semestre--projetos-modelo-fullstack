import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.tsx";
import Login from "./Login.tsx";
import Cadastro from "./Cadastro.tsx";
import Layout from "./Layout.tsx";
import MeusPedidos from "./MeusPedidos.tsx";

// ----------------- Rotas de Admin
import AdminLayout from "./admin/AdminLayout.tsx";
import AdminLogin from "./admin/AdminLogin.tsx";
import AdminDashboard from "./admin/AdminDashboard.tsx";
import AdminKanban from "./admin/AdminKanban.tsx";
import AdminProdutos from "./admin/AdminProdutos.tsx";
import AdminLocais from "./admin/AdminLocais.tsx";

// import AdminRotaProtegida from "./admin/AdminRotaProtegida.tsx";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const rotas = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: "login", element: <Login /> },
      { path: "meusPedidos", element: <MeusPedidos /> },
      { path: "cadastro", element: <Cadastro /> },
    ],
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminKanban /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "produtos", element: <AdminProdutos /> },
      { path: "locais", element: <AdminLocais /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={rotas} />
  </StrictMode>,
);
