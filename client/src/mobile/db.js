// Wrapper mínimo de IndexedDB para a fila offline (outbox). Efeitos isolados: só este
// módulo fala com o IndexedDB; a lógica da fila (filaOffline.js) recebe um `store`
// injetável com esta mesma interface (put/getAll/delete), o que a mantém testável
// sem tocar o banco. Abre o banco de forma preguiçosa (no 1º acesso), não no import.

const DB_NOME = "infrahub-mobile";
const STORE = "outbox";
const VERSAO = 1;

let dbPromise = null;

function abrir() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NOME, VERSAO);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        // keyPath "id": cada registro da fila tem id próprio (gerado no enfileirar).
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function comStore(modo, operacao) {
  return abrir().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, modo);
        const store = tx.objectStore(STORE);
        let resultado;
        const req = operacao(store);
        if (req) {
          req.onsuccess = () => {
            resultado = req.result;
          };
          req.onerror = () => reject(req.error);
        }
        tx.oncomplete = () => resolve(resultado);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}

export function putRegistro(registro) {
  return comStore("readwrite", (store) => store.put(registro));
}

export function getRegistros() {
  return comStore("readonly", (store) => store.getAll()).then((lista) => lista || []);
}

export function deleteRegistro(id) {
  // delete de id ausente é no-op no IndexedDB (a request resolve sem erro).
  return comStore("readwrite", (store) => store.delete(id));
}

export function contarRegistros() {
  return getRegistros().then((lista) => lista.length);
}
