/* eslint-disable react-hooks/exhaustive-deps */
import { X } from "lucide-react";
import { useState } from "react";
import { postUsuario } from "../../services/api/usuariosServices.js";
import { tratarErro } from "../default/funcoes.js";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ModalAdicionaUsuario({
  setNotificacao,
  setAdicionaUsuario,
  buscaUsuarios,
  setLoading,
}) {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [tipo, setTipo] = useState("");

  async function salvarUsuario() {
    if (nome == "" || usuario == "" || tipo == "") {
      setNotificacao({
        show: true,
        tipo: "erro",
        titulo: "Dados inválidos",
        mensagem: "Todos os dados são necessários para cadastro de usuários",
      });
    }
    setLoading(true);
    try {
      await postUsuario(nome, tipo, usuario);

      setNotificacao({
        show: true,
        tipo: "sucesso",
        titulo: "Usuário cadastrado com sucesso",
        mensagem: `O usuário foi cadastrado com a senha padrão "12345"`,
      });
      setLoading(false);
      await buscaUsuarios();
      setTimeout(() => {
        setNotificacao({
          show: false,
          tipo: "sucesso",
          titulo: "",
          mensagem: "",
        });
        setAdicionaUsuario(false);
      }, 700);
    } catch (err) {
      setLoading(false);
      tratarErro(setNotificacao, err, navigate);
    }
  }

  useEffect(() => {
    function onKeyDown(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") setAdicionaUsuario(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div
      onClick={() => setAdicionaUsuario(false)}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white/5 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-white/10 p-6 space-y-6"
      >
        <div className="flex justify-between items-center border-b border-white/20 pb-3">
          <h2 className="text-lg font-semibold text-white">
            Adicionar Usuário
          </h2>
          <button
            onClick={() => setAdicionaUsuario(false)}
            className="cursor-pointer text-white/60 hover:text-white"
          >
            <X />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-white/70">Nome Completo</label>
              <span className="text-xs text-white/50">{nome.length}/100</span>
            </div>
            <input
              type="text"
              value={nome}
              maxLength={100}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João da Silva"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-white/70">Usuário</label>
              <span className="text-xs text-white/50">{usuario.length}/50</span>
            </div>
            <input
              type="text"
              value={usuario}
              maxLength={50}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ex: joao.silva"
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option hidden value="">
                Selecione...
              </option>
              <option value="adm">Administrador</option>
              <option value="usuario">Usuário</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button
            onClick={salvarUsuario}
            disabled={!nome || !usuario || !tipo}
            className={`px-4 py-2 rounded-lg text-white font-medium transition 
              ${
                nome && usuario && tipo
                  ? "cursor-pointer bg-sky-600 hover:bg-sky-500"
                  : "cursor-not-allowed bg-white/10 text-white/40"
              }`}
          >
            Salvar Usuário
          </button>
        </div>
      </div>
    </div>
  );
}
