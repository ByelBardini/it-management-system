// Fila offline (outbox) — lógica PURA: o `store` e a função `enviar` são INJETÁVEIS,
// então testamos sem tocar IndexedDB nem rede. Em produção caem nos defaults: o store
// de db.js e um `enviar` que remonta o FormData e chama postItem.
//
// Classificação de erro no drain (decisão travada do plano):
//   - rede / 5xx        -> mantém e conta retry (até maxRetries; depois expira/descarta);
//   - 401/403           -> NÃO descarta, NÃO conta retry, pausa o drain e sinaliza re-login;
//   - 4xx de validação  -> descarta (reenviar não resolve).
import { putRegistro, getRegistros, deleteRegistro } from "./db.js";
import { registroParaFormData } from "./payloadCadastro.js";
import { postItem } from "../services/api/itemServices.js";

// Reexporta o builder do FormData sob o nome usado pelo drain/testes (fonte única
// da montagem do multipart, em payloadCadastro.js).
export { registroParaFormData as reconstruirFormData };

const MAX_RETRIES = 5;

const storePadrao = {
  put: (r) => putRegistro(r),
  getAll: () => getRegistros(),
  delete: (id) => deleteRegistro(id),
};

async function enviarPadrao(registro) {
  const fd = registroParaFormData(registro);
  if (registro.endpoint === "/item") {
    return postItem(fd);
  }
  throw new Error(`Endpoint não suportado na fila offline: ${registro.endpoint}`);
}

function gerarId() {
  // Chave do outbox; não precisa de UUID forte. Date.now()+aleatório basta e evita
  // depender de crypto.randomUUID (nem sempre presente em WebViews antigas).
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function enfileirar(registro, { store = storePadrao } = {}) {
  const completo = {
    id: gerarId(),
    endpoint: registro.endpoint,
    method: registro.method || "POST",
    fields: registro.fields || {},
    files: registro.files || [],
    retries: 0,
    createdAt: Date.now(),
  };
  try {
    await store.put(completo);
  } catch (err) {
    // Armazenamento cheio (QuotaExceededError) e afins: sinaliza sem engolir.
    if (err && err.name === "QuotaExceededError") {
      err.quotaExcedida = true;
    }
    throw err;
  }
  return completo;
}

export async function drenar({
  store = storePadrao,
  enviar = enviarPadrao,
  maxRetries = MAX_RETRIES,
} = {}) {
  const registros = await store.getAll();
  let enviados = 0;
  let descartados = 0;
  let expirados = 0;
  let sessaoExpirada = false;
  let bloqueado = false;

  for (const registro of registros) {
    try {
      await enviar(registro);
      await store.delete(registro.id);
      enviados++;
    } catch (err) {
      const status = err?.status ?? err?.response?.status;

      if (status === 401) {
        // Sessão expirada: re-login resolve. Pausa e preserva a fila.
        sessaoExpirada = true;
        break;
      }

      if (status === 403) {
        // Origem fora do CORS_ORIGIN (origemConfiavel) ou papel sem permissão:
        // re-login NÃO resolve. Pausa e sinaliza bloqueio (mensagem distinta de
        // sessão expirada, p/ não cair em loop de re-login). Fila preservada.
        bloqueado = true;
        break;
      }

      if (status >= 400 && status < 500) {
        await store.delete(registro.id);
        descartados++;
        continue;
      }

      const novoRetries = (registro.retries || 0) + 1;
      if (novoRetries > maxRetries) {
        await store.delete(registro.id);
        expirados++;
      } else {
        await store.put({ ...registro, retries: novoRetries });
      }
    }
  }

  return { enviados, descartados, expirados, sessaoExpirada, bloqueado };
}

export async function contarPendentes({ store = storePadrao } = {}) {
  const lista = await store.getAll();
  return lista.length;
}
