import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import AppLayout from "./pages/AppLayout.jsx";
import Login from "./pages/Login.jsx";
import Empresas from "./pages/Empresas.jsx";
import App from "./pages/App.jsx";
import Inventario from "./pages/Inventario.jsx";
import Manutencoes from "./pages/Manutencoes.jsx";
import Senhas from "./pages/Senhas.jsx";
import Configuracoes from "./pages/Configuracoes.jsx";
import Workstations from "./pages/Workstations.jsx";
import CadastroItem from "./pages/CadastroItem.jsx";
import Perfil from "./pages/Perfil.jsx";
import Usuarios from "./pages/Usuarios.jsx";
import PageTransition from "./components/default/PageTransition.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PageTransition>
        <Login />
      </PageTransition>
    ),
  },
  {
    path: "/empresas",
    element: (
      <PageTransition>
        <Empresas />
      </PageTransition>
    ),
  },
  {
    path: "/app",
    element: (
      <AppLayout>
        <App />
      </AppLayout>
    ),
  },
  {
    path: "/senha",
    element: (
      <AppLayout>
        <Senhas />
      </AppLayout>
    ),
  },
  {
    path: "/manutencao",
    element: (
      <AppLayout>
        <Manutencoes />
      </AppLayout>
    ),
  },
  {
    path: "/inventario",
    element: (
      <AppLayout>
        <Inventario />
      </AppLayout>
    ),
  },
  {
    path: "/config",
    element: (
      <AppLayout>
        <Configuracoes />
      </AppLayout>
    ),
  },
  {
    path: "/workstations",
    element: (
      <AppLayout>
        <Workstations />
      </AppLayout>
    ),
  },
  {
    path: "/cadastro",
    element: (
      <PageTransition>
        <CadastroItem />
      </PageTransition>
    ),
  },
  {
    path: "/usuarios",
    element: (
      <PageTransition>
        <Usuarios />
      </PageTransition>
    ),
  },
  {
    path: "/perfil",
    element: (
      <AppLayout>
        <Perfil />
      </AppLayout>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
