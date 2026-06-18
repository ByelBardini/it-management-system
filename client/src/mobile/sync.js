// Efeitos de sincronização da fila offline (sem teste unitário — efeitos de janela).
// Drena no boot e quando a rede volta (evento "online"); a página também chama
// `sincronizar` após cada cadastro. Background Sync (SW) fica como melhoria futura.
import { drenar, contarPendentes } from "./filaOffline.js";

export async function sincronizar({ aoAtualizar, aoExpirarSessao, aoBloquear } = {}) {
  let resultado;
  if (typeof navigator === "undefined" || navigator.onLine) {
    try {
      resultado = await drenar();
    } catch {
      resultado = undefined;
    }
    if (resultado?.sessaoExpirada && aoExpirarSessao) {
      aoExpirarSessao();
    }
    // 403 no drain (origem/permissão) é distinto de sessão expirada.
    if (resultado?.bloqueado && aoBloquear) {
      aoBloquear();
    }
  }
  if (aoAtualizar) {
    try {
      aoAtualizar(await contarPendentes());
    } catch {
      /* contagem é best-effort: não derruba a sincronização */
    }
  }
  return resultado;
}

// Liga os gatilhos de drain (boot + "online") e devolve a função de limpeza.
export function iniciarSync({ aoAtualizar, aoExpirarSessao, aoBloquear } = {}) {
  const handler = () => sincronizar({ aoAtualizar, aoExpirarSessao, aoBloquear });
  handler(); // boot
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}
