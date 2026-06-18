// Matchers extras do @testing-library/jest-dom (toBeInTheDocument, etc.)
// carregados antes de cada arquivo de teste (ver setupFiles em vite.config.js).
import "@testing-library/jest-dom";

// Polyfill de IndexedDB para jsdom (a fila offline usa o objectStore "outbox").
// Sem isso, os testes de db.js/fila não teriam `indexedDB` global.
import "fake-indexeddb/auto";
