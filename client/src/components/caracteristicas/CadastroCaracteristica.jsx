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

export default function CadastroCaracteristica({ tipo }) {
  const selecionado = tipo;
  switch (selecionado) {
    case "desktop":
      return <Desktop />;
    case "notebook":
      return <Notebook />;
    case "movel":
      return <Movel />;
    case "cadeira":
      return <Cadeira />;
    case "monitor":
      return <Monitor />;
    case "ferramenta":
      return <Ferramenta />;
    case "ap":
      return <Ap />;
    case "ar-condicionado":
      return <ArCondicionado />;
    case "switch":
      return <Switch />;
    case "periferico":
      return <Periferico />;
    case "impressora":
      return <Impressora />;
    case "no-break":
      return <NoBreak />;
    case "celular":
      return <Celular />;
  }
}
