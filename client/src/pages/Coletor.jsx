import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Download, LogOut } from "lucide-react";
import Notificacao from "../components/default/Notificacao.jsx";
import Loading from "../components/default/Loading.jsx";
import { tratarErro } from "../components/default/funcoes.js";
import { baixarColetor } from "../services/api/coletorServices.js";
import { deslogar } from "../services/auth/authService.js";

// Tela única do papel "coletor": baixar o pacote do coletor (ZIP com o script + um
// .bat de duplo-clique que já carrega a URL e o token). O funcionário roda o .bat,
// informa nome e setor, e este PC é enviado ao inventário.
export default function Coletor() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [notificacao, setNotificacao] = useState({
    show: false,
    tipo: "sucesso",
    titulo: "",
    mensagem: "",
  });

  async function baixar() {
    setCarregando(true);
    try {
      const blob = await baixarColetor();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "coletor-infrahub.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Coletor gerado com sucesso",
        mensagem:
          "Extraia o ZIP e dê um duplo-clique em Coletar.bat para enviar este computador.",
      });
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
    } finally {
      setCarregando(false);
    }
  }

  async function sair() {
    await deslogar();
    navigate("/", { replace: true });
  }

  return (
    <div className="relative min-h-screen w-screen bg-[#0A1633] text-white flex items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {notificacao.show && (
          <Notificacao
            tipo={notificacao.tipo}
            titulo={notificacao.titulo}
            mensagem={notificacao.mensagem}
            onClick={() =>
              setNotificacao({
                show: false,
                tipo: "sucesso",
                titulo: "",
                mensagem: "",
              })
            }
          />
        )}
      </AnimatePresence>
      {carregando && <Loading />}

      <button
        onClick={sair}
        className="absolute right-4 top-4 flex cursor-pointer items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70 ring-1 ring-white/10 hover:bg-white/10"
      >
        <LogOut size={16} />
        Sair
      </button>

      <div className="w-full max-w-md rounded-xl bg-white/[0.03] ring-1 ring-white/10 p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Coletor de computador</h1>
        <p className="text-sm text-white/70 mb-6">
          Baixe o coletor, extraia o arquivo e dê um duplo-clique em{" "}
          <span className="text-white">Coletar.bat</span>. Informe o nome e o
          setor quando pedido — pronto, este PC entra no inventário.
        </p>

        <button
          onClick={baixar}
          disabled={carregando}
          className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-medium text-white transition ${
            carregando
              ? "cursor-not-allowed bg-white/10 text-white/40"
              : "cursor-pointer bg-sky-600 hover:bg-sky-500"
          }`}
        >
          <Download size={18} />
          Baixar coletor
        </button>
      </div>
    </div>
  );
}
