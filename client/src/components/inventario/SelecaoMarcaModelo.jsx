/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Settings2 } from "lucide-react";
import { getMarcas, postMarca } from "../../services/api/marcaServices.js";
import { getModelos, postModelo } from "../../services/api/modeloServices.js";
import { temSubtipo } from "./tiposComSubtipo.js";
import { tratarErro } from "../default/funcoes.js";

// Combobox reaproveitavel "selecionar ou adicionar" para marca + modelo do
// cadastro central. dominio = "item" | "peca". Controlado: marcaId/modeloId vem
// por prop; mudancas sao emitidas por onChange(patch) -> { marcaId } | { modeloId }.
// Modelo so habilita depois de escolher a marca; marca/modelo novos sao criados
// na hora (postMarca/postModelo) e ja selecionados.
export default function SelecaoMarcaModelo({
  dominio = "item",
  tipo = "",
  subtipo = "",
  marcaId = null,
  modeloId = null,
  onChange,
  setNotificacao,
}) {
  const navigate = useNavigate();

  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [buscaMarca, setBuscaMarca] = useState("");
  const [buscaModelo, setBuscaModelo] = useState("");
  const [abertoMarca, setAbertoMarca] = useState(false);
  const [abertoModelo, setAbertoModelo] = useState(false);

  // Guardam o último marcaId/modeloId que o texto refletiu. Servem para separar
  // mudança INTERNA (usuário digitando, que zera o id mas mantém o texto) de
  // mudança EXTERNA (seleção programática ou reset do pai, que deve refletir no
  // texto). Sem isso, o reset do pai deixava "texto fantasma" no input.
  const marcaIdRef = useRef(marcaId);
  const modeloIdRef = useRef(modeloId);

  function falhar(err) {
    if (setNotificacao) tratarErro(setNotificacao, err, navigate);
  }

  // Marca depende do tipo e, nos tipos de ITEM com subtipo, também do subtipo.
  // Subtipo só escopa no domínio "item" — peças (ex.: tipo "outros") nunca travam.
  const marcaBloqueada =
    !tipo || (dominio === "item" && temSubtipo(tipo) && !subtipo);

  async function carregarMarcas() {
    if (marcaBloqueada) {
      setMarcas([]);
      return;
    }
    try {
      const lista = await getMarcas(dominio, tipo, subtipo);
      setMarcas(lista || []);
    } catch (err) {
      falhar(err);
    }
  }
  useEffect(() => {
    carregarMarcas();
  }, [dominio, tipo, subtipo]);

  // Reconcilia o texto da marca: quando marcaId muda POR FORA (seleção
  // programática/edição ou reset do pai) o texto segue; quando as marcas
  // carregam depois, preenche a seleção inicial; e NÃO apaga o que o usuário
  // está digitando (a digitação marca o ref antes do re-render).
  useEffect(() => {
    if (marcaId !== marcaIdRef.current) {
      marcaIdRef.current = marcaId;
      const sel = marcas.find((m) => m.marca_id === marcaId);
      setBuscaMarca(marcaId && sel ? sel.marca_nome : "");
    } else if (marcaId && !buscaMarca) {
      const sel = marcas.find((m) => m.marca_id === marcaId);
      if (sel) setBuscaMarca(sel.marca_nome);
    }
  }, [marcas, marcaId]);

  async function carregarModelos(id) {
    try {
      const lista = await getModelos(id);
      setModelos(lista || []);
    } catch (err) {
      falhar(err);
    }
  }
  useEffect(() => {
    if (marcaId) {
      carregarModelos(marcaId);
    } else {
      setModelos([]);
    }
  }, [marcaId]);

  useEffect(() => {
    if (modeloId !== modeloIdRef.current) {
      modeloIdRef.current = modeloId;
      const sel = modelos.find((m) => m.modelo_id === modeloId);
      setBuscaModelo(modeloId && sel ? sel.modelo_nome : "");
    } else if (modeloId && !buscaModelo) {
      const sel = modelos.find((m) => m.modelo_id === modeloId);
      if (sel) setBuscaModelo(sel.modelo_nome);
    }
  }, [modelos, modeloId]);

  const marcasFiltradas = marcas.filter((m) =>
    m.marca_nome.toLowerCase().includes(buscaMarca.trim().toLowerCase())
  );
  const modelosFiltrados = modelos.filter((m) =>
    m.modelo_nome.toLowerCase().includes(buscaModelo.trim().toLowerCase())
  );
  const marcaExata = marcas.some(
    (m) => m.marca_nome.toLowerCase() === buscaMarca.trim().toLowerCase()
  );
  const modeloExato = modelos.some(
    (m) => m.modelo_nome.toLowerCase() === buscaModelo.trim().toLowerCase()
  );

  function selecionarMarca(marca) {
    setBuscaMarca(marca.marca_nome);
    setBuscaModelo("");
    setAbertoMarca(false);
    onChange({ marcaId: marca.marca_id, modeloId: null });
  }

  async function adicionarMarca() {
    const nome = buscaMarca.trim();
    if (!nome) return;
    try {
      const { marca_id } = await postMarca(nome, dominio, tipo, subtipo);
      await carregarMarcas();
      setBuscaModelo("");
      setAbertoMarca(false);
      onChange({ marcaId: marca_id, modeloId: null });
    } catch (err) {
      falhar(err);
    }
  }

  function selecionarModelo(modelo) {
    setBuscaModelo(modelo.modelo_nome);
    setAbertoModelo(false);
    onChange({ modeloId: modelo.modelo_id });
  }

  async function adicionarModelo() {
    const nome = buscaModelo.trim();
    if (!nome || !marcaId) return;
    try {
      const { modelo_id } = await postModelo(marcaId, nome);
      await carregarModelos(marcaId);
      setAbertoModelo(false);
      onChange({ modeloId: modelo_id });
    } catch (err) {
      falhar(err);
    }
  }

  const inputCls =
    "w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60 disabled:opacity-50 disabled:cursor-not-allowed";
  const dropdownCls =
    "absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-lg bg-neutral-900 ring-1 ring-white/10 shadow-xl";

  return (
    <div className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="relative">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <label className="block text-sm text-white/70">Marca</label>
          </div>
          <button
            type="button"
            onClick={() => navigate("/config")}
            className="cursor-pointer inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300"
            title="Gerenciar marcas e modelos em Configurações"
          >
            <Settings2 size={12} /> Gerenciar
          </button>
        </div>
        <input
          type="text"
          value={buscaMarca}
          disabled={marcaBloqueada}
          onChange={(e) => {
            setBuscaMarca(e.target.value);
            setAbertoMarca(true);
            if (marcaId) {
              marcaIdRef.current = null;
              modeloIdRef.current = null;
              setBuscaModelo("");
              onChange({ marcaId: null, modeloId: null });
            }
          }}
          onFocus={() => setAbertoMarca(true)}
          onBlur={() => setTimeout(() => setAbertoMarca(false), 120)}
          placeholder={
            marcaBloqueada
              ? temSubtipo(tipo)
                ? "Escolha o subtipo primeiro"
                : "Selecione o tipo do item"
              : "Selecione ou digite uma marca"
          }
          className={inputCls}
        />
        {abertoMarca && !marcaBloqueada && (
          <ul className={dropdownCls}>
            {marcasFiltradas.map((m) => (
              <li key={m.marca_id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selecionarMarca(m)}
                  className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 cursor-pointer"
                >
                  {m.marca_nome}
                </button>
              </li>
            ))}
            {buscaMarca.trim() && !marcaExata && (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={adicionarMarca}
                  className="w-full text-left px-3 py-2 text-sm text-sky-400 hover:bg-white/10 cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus size={14} /> Adicionar "{buscaMarca.trim()}"
                </button>
              </li>
            )}
            {marcasFiltradas.length === 0 && !buscaMarca.trim() && (
              <li className="px-3 py-2 text-sm text-white/40">
                Nenhuma marca cadastrada
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="relative">
        <label className="block text-sm text-white/70 mb-1">Modelo</label>
        <input
          type="text"
          value={buscaModelo}
          disabled={!marcaId}
          onChange={(e) => {
            setBuscaModelo(e.target.value);
            setAbertoModelo(true);
            if (modeloId) {
              modeloIdRef.current = null;
              onChange({ modeloId: null });
            }
          }}
          onFocus={() => setAbertoModelo(true)}
          onBlur={() => setTimeout(() => setAbertoModelo(false), 120)}
          placeholder={
            marcaId ? "Selecione ou digite um modelo" : "Escolha a marca primeiro"
          }
          className={inputCls}
        />
        {abertoModelo && marcaId && (
          <ul className={dropdownCls}>
            {modelosFiltrados.map((m) => (
              <li key={m.modelo_id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selecionarModelo(m)}
                  className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 cursor-pointer"
                >
                  {m.modelo_nome}
                </button>
              </li>
            ))}
            {buscaModelo.trim() && !modeloExato && (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={adicionarModelo}
                  className="w-full text-left px-3 py-2 text-sm text-sky-400 hover:bg-white/10 cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus size={14} /> Adicionar "{buscaModelo.trim()}"
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
