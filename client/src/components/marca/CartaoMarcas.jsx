/* eslint-disable react-hooks/exhaustive-deps */
import { Plus, SearchX, Tag, ChevronRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMarcas } from "../../services/api/marcaServices.js";
import { getModelos } from "../../services/api/modeloServices.js";
import { tratarErro } from "../default/funcoes.js";
import { temSubtipo } from "../inventario/tiposComSubtipo.js";
import tiposItens from "../inventario/tiposItens.js";
import tiposPecas from "../pecas/tiposPecas.js";
import SelecaoSubtipo from "../inventario/SelecaoSubtipo.jsx";
import AdicionarMarca from "./AdicionarMarca.jsx";
import AdicionarModelo from "./AdicionarModelo.jsx";

// Cartão de /config: cadastro central de marcas/modelos. Navega
// domínio (item|peça) → tipo → (subtipo, nos tipos que têm) → marcas → modelos.
export default function CartaoMarcas({ setNotificacao, setCarregando }) {
  const navigate = useNavigate();

  const [dominio, setDominio] = useState("item");
  const [tipo, setTipo] = useState("");
  const [subtipo, setSubtipo] = useState("");
  const [marcas, setMarcas] = useState([]);
  const [marcaExpandida, setMarcaExpandida] = useState(null);
  const [modelos, setModelos] = useState({});
  const [adicionandoMarca, setAdicionandoMarca] = useState(false);
  const [adicionandoModeloDe, setAdicionandoModeloDe] = useState(null);

  const tiposDoDominio = dominio === "item" ? tiposItens : tiposPecas;
  const precisaSubtipo = dominio === "item" && temSubtipo(tipo);
  const marcaPronta = !!tipo && (!precisaSubtipo || !!subtipo);

  async function buscarMarcas() {
    if (!marcaPronta) {
      setMarcas([]);
      return;
    }
    setCarregando(true);
    try {
      const lista = await getMarcas(dominio, tipo, subtipo);
      setMarcas(lista || []);
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    setMarcaExpandida(null);
    setModelos({});
    buscarMarcas();
  }, [dominio, tipo, subtipo]);

  async function buscarModelos(marcaId) {
    try {
      const lista = await getModelos(marcaId);
      setModelos((prev) => ({ ...prev, [marcaId]: lista || [] }));
    } catch (err) {
      tratarErro(setNotificacao, err, navigate);
    }
  }

  function alternarExpandir(marca) {
    const id = marca.marca_id;
    if (marcaExpandida === id) {
      setMarcaExpandida(null);
    } else {
      setMarcaExpandida(id);
      if (modelos[id] === undefined) buscarModelos(id);
    }
  }

  function trocarDominio(novo) {
    setDominio(novo);
    setTipo("");
    setSubtipo("");
  }

  const pill = (ativo) =>
    `px-3 py-1 rounded-md text-sm transition ${
      ativo ? "bg-sky-600 text-white" : "text-white/60 hover:text-white"
    }`;

  return (
    <div className="h-auto rounded-xl bg-white/[0.03] ring-1 ring-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Tag size={20} /> Marcas e Modelos
        </h2>
        {marcaPronta && (
          <button
            onClick={() => setAdicionandoMarca(true)}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-500 transition"
          >
            <Plus size={18} />
            Adicionar Marca
          </button>
        )}
      </div>

      <div className="px-6 py-3 border-b border-white/10 space-y-3">
        <div className="inline-flex rounded-lg bg-white/10 ring-1 ring-white/10 p-1">
          <button
            onClick={() => trocarDominio("item")}
            className={pill(dominio === "item")}
          >
            Itens
          </button>
          <button
            onClick={() => trocarDominio("peca")}
            className={pill(dominio === "peca")}
          >
            Peças
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-white/70 mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                setSubtipo("");
              }}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/60"
            >
              <option value="" className="bg-zinc-900">
                Selecione o tipo...
              </option>
              {Object.entries(tiposDoDominio).map(([valor, rotulo]) => (
                <option key={valor} value={valor} className="bg-zinc-900">
                  {rotulo}
                </option>
              ))}
            </select>
          </div>

          {precisaSubtipo && (
            <SelecaoSubtipo
              tipo={tipo}
              subtipo={subtipo}
              onChange={setSubtipo}
              setNotificacao={setNotificacao}
            />
          )}
        </div>
      </div>

      <div className="divide-y divide-white/10">
        {!marcaPronta ? (
          <div className="p-6 flex items-center justify-center gap-2 text-white/60 text-sm text-center">
            {precisaSubtipo
              ? "Escolha o tipo e o subtipo para ver as marcas."
              : "Escolha o tipo para ver as marcas."}
          </div>
        ) : marcas.length > 0 ? (
          marcas.map((marca) => {
            const aberta = marcaExpandida === marca.marca_id;
            const lista = modelos[marca.marca_id] || [];
            return (
              <div key={marca.marca_id}>
                <div
                  onDoubleClick={() => alternarExpandir(marca)}
                  className="flex items-center justify-between px-6 py-3 hover:bg-white/5 transition cursor-pointer select-none"
                  title="Duplo-clique para ver os modelos"
                >
                  <span className="text-white/80 text-sm flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alternarExpandir(marca);
                      }}
                      className="cursor-pointer text-white/40 hover:text-white"
                      title={aberta ? "Recolher" : "Ver modelos"}
                    >
                      {aberta ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>
                    {marca.marca_nome}
                  </span>
                </div>
                {aberta && (
                  <div className="bg-white/[0.02]">
                    {lista.map((modelo) => (
                      <div
                        key={modelo.modelo_id}
                        className="flex items-center px-6 py-2 pl-14 text-white/70 text-sm"
                      >
                        {modelo.modelo_nome}
                      </div>
                    ))}
                    {lista.length === 0 && (
                      <div className="px-6 py-2 pl-14 text-white/40 text-sm">
                        Nenhum modelo cadastrado
                      </div>
                    )}
                    <div className="px-6 py-2 pl-14">
                      <button
                        onClick={() => setAdicionandoModeloDe(marca)}
                        className="cursor-pointer inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300"
                      >
                        <Plus size={14} /> Adicionar modelo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-6 flex items-center justify-center gap-2 text-white/60">
            <SearchX size={18} />
            Nenhuma marca encontrada
          </div>
        )}
      </div>

      {adicionandoMarca && (
        <AdicionarMarca
          dominio={dominio}
          tipo={tipo}
          subtipo={subtipo}
          setAdicionando={setAdicionandoMarca}
          buscarDados={buscarMarcas}
          setNotificacao={setNotificacao}
          setCarregando={setCarregando}
        />
      )}
      {adicionandoModeloDe && (
        <AdicionarModelo
          marcaId={adicionandoModeloDe.marca_id}
          marcaNome={adicionandoModeloDe.marca_nome}
          setAdicionando={() => setAdicionandoModeloDe(null)}
          buscarDados={() => buscarModelos(adicionandoModeloDe.marca_id)}
          setNotificacao={setNotificacao}
          setCarregando={setCarregando}
        />
      )}
    </div>
  );
}
