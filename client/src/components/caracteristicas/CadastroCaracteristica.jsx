/* eslint-disable react-hooks/exhaustive-deps */
import Desktop from "./cadastro/Desktop.jsx";
import Notebook from "./cadastro/Notebook.jsx";
import Movel from "./cadastro/Movel.jsx";
import Cadeira from "./cadastro/Cadeira.jsx";
import Monitor from "./cadastro/Monitor.jsx";
import Ferramenta from "./cadastro/Ferramenta.jsx";
import Ap from "./cadastro/Ap.jsx";
import ArCondicionado from "./cadastro/ArCondicionado.jsx";
import Switch from "./cadastro/Switch.jsx";
import Periferico from "./cadastro/Periferico.jsx";
import Impressora from "./cadastro/Impressora.jsx";
import NoBreak from "./cadastro/NoBreak.jsx";
import Celular from "./cadastro/Celular.jsx";
import { useEffect } from "react";

export default function CadastroCaracteristica({
  tipo,
  setCaracteristicas,
  resetCaracteristicas,
  caracteristicas,
}) {
  useEffect(() => {
    resetCaracteristicas();
  }, [tipo]);

  const selecionado = tipo;
  switch (selecionado) {
    case "desktop":
      return (
        <Desktop
          setCaracteristicas={setCaracteristicas}
          caracteristicas={caracteristicas}
        />
      );
    case "notebook":
      return (
        <Notebook
          setCaracteristicas={setCaracteristicas}
          caracteristicas={caracteristicas}
        />
      );
    case "movel":
      return (
        <Movel
          setCaracteristicas={setCaracteristicas}
          caracteristicas={caracteristicas}
        />
      );
    case "cadeira":
      return (
        <Cadeira
          setCaracteristicas={setCaracteristicas}
          caracteristicas={caracteristicas}
        />
      );
    case "monitor":
      return (
        <Monitor
          setCaracteristicas={setCaracteristicas}
          caracteristicas={caracteristicas}
        />
      );
    case "ferramenta":
      return (
        <Ferramenta
          setCaracteristicas={setCaracteristicas}
          caracteristicas={caracteristicas}
        />
      );
    case "ap":
      return (
        <Ap
          setCaracteristicas={setCaracteristicas}
          caracteristicas={caracteristicas}
        />
      );
    case "ar-condicionado":
      return (
        <ArCondicionado
          setCaracteristicas={setCaracteristicas}
          caracteristicas={caracteristicas}
        />
      );
    case "switch":
      return (
        <Switch
          setCaracteristicas={setCaracteristicas}
          caracteristicas={caracteristicas}
        />
      );
    case "periferico":
      return (
        <Periferico
          setCaracteristicas={setCaracteristicas}
          caracteristicas={caracteristicas}
        />
      );
    case "impressora":
      return (
        <Impressora
          setCaracteristicas={setCaracteristicas}
          caracteristicas={caracteristicas}
        />
      );
    case "no-break":
      return (
        <NoBreak
          setCaracteristicas={setCaracteristicas}
          caracteristicas={caracteristicas}
        />
      );
    case "celular":
      return (
        <Celular
          setCaracteristicas={setCaracteristicas}
          caracteristicas={caracteristicas}
        />
      );
  }
}
