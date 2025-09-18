import predios from "../assets/predios.jpg";
import logo from "../assets/logo-empresa.png";
import Notificacao from "../components/default/Notificacao.jsx";
import Loading from "../components/default/Loading.jsx";
import { logar } from "../services/auth/authService.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { tratarErro } from "../components/default/funcoes.js";

export default function Login() {
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(false);

  const [notificacao, setNotificacao] = useState({
    show: false,
    tipo: "sucesso",
    titulo: "",
    mensagem: "",
  });

  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");

  function enter(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      logarSistema();
    }
  }

  async function logarSistema() {
    if (login == "" || senha == "") {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Dados incompletos",
        mensagem: "Login e senha são necessários para logar no sistema",
      });
    } else {
      setCarregando(true);
      try {
        await logar(login, senha);

        setNotificacao({
          show: true,
          tipo: "sucesso",
          titulo: "Sucesso",
          mensagem:
            "Login realizado com sucesso! Redirezionando para o sistema",
        });

        setTimeout(() => {
          setNotificacao({
            show: false,
            tipo: "sucesso",
            titulo: "",
            mensagem: "",
          });
          navigate("/empresas", { replace: true });
        }, 1000);
      } catch (err) {
        if (err.message.includes("obrigatórios")) {
          setNotificacao({
            show: true,
            tipo: "erro",
            titulo: "Dados incompletos",
            mensagem: "Login e senha são necessários para logar no sistema",
          });
        } else if (err.message.includes("Login incorreto")) {
          setNotificacao({
            show: true,
            tipo: "erro",
            titulo: "Login Inválido",
            mensagem: "Usuário não encontrado no sistema",
          });
        } else if (err.message.includes("Usuário inativo")) {
          setNotificacao({
            show: true,
            tipo: "erro",
            titulo: "Usuário inativo",
            mensagem:
              "Seu usuário não está ativo, fale com um administrador do sistema",
          });
        } else if (err.message.includes("Senha incorreta")) {
          setNotificacao({
            show: true,
            tipo: "erro",
            titulo: "Senha incorreta",
            mensagem:
              "Senha incorreta, verifique a digitação e tente novamente",
          });
        } else {
          tratarErro(setNotificacao, err, navigate);
        }
      } finally {
        setCarregando(false);
      }
    }
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {notificacao.show && (
          <Notificacao
            tipo={notificacao.tipo}
            titulo={notificacao.titulo}
            mensagem={notificacao.mensagem}
            onClick={() => {
              setNotificacao({
                show: false,
                tipo: "sucesso",
                titulo: "",
                mensagem: "",
              });
            }}
          />
        )}
      </AnimatePresence>
      {carregando && <Loading />}
      <img
        src={predios}
        alt="Prédio"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#0A1633]/90 via-[#0A1633]/60 to-[#0A1633]/20"></div>

      <div className="relative z-10 flex items-center justify-start h-full px-20 shadow-xl">
        <div className="bg-[#14295c]/80 backdrop-blur-md text-white rounded-xl w-[400px] p-10 shadow-lg">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Logo da empresa" className="h-25" />
          </div>

          <h1 className="text-3xl font-bold mb-6 text-center">InfraHub</h1>

          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Login"
              onChange={(e) => setLogin(e.target.value)}
              className="p-3 rounded-md bg-[#0F1A36] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Senha"
              onKeyDown={enter}
              onChange={(e) => setSenha(e.target.value)}
              className="p-3 rounded-md bg-[#0F1A36] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={logarSistema}
              className="cursor-pointer mt-4 bg-blue-600 hover:bg-blue-700 transition-colors p-3 rounded-md font-semibold"
            >
              Entrar
            </button>
          </form>

          <div className="mt-4 text-sm text-center">
            <p className="text-blue-400 cursor-default">
              para conseguir seu login fale com o setor de TI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
