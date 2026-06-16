---
description: Boas práticas de performance e robustez para React em SPA Vite (sem SSR/Next). Use ao escrever, revisar ou refatorar componentes/páginas do client/ para evitar re-renders, waterfalls e bundles inchados.
---

# React Best Practices — InfraHub (SPA Vite, JSX)

Guia de performance para o frontend (React 19 + Vite, **sem Next.js, sem SSR/Server Components**). Categorias por impacto. Exemplos em JSX puro.

> O projeto usa `useState`/`useEffect` e `services/api/*` (axios). Não há TanStack Query/SWR — então parte da disciplina de dedupe/cache é manual.

## 1. Eliminar Waterfalls (CRÍTICO)

### Requisições independentes em paralelo
```js
// ❌ Sequencial
const itens = await getItens(id);
const setores = await getSetores(id);
// ✅ Paralelo
const [itens, setores] = await Promise.all([getItens(id), getSetores(id)]);
```

### `await` tarde, promessa cedo
Dispare as promessas antes e dê `await` só onde o valor é usado, para não bloquear o que pode correr junto.

## 2. Tamanho do Bundle (CRÍTICO)

### Imports diretos, sem barril
```js
// ❌ import { Plus, X, Wrench } from "lucide-react/dist/...barrel"
// ✅ Importe os ícones nomeados direto de "lucide-react" (já é tree-shakeable)
import { Plus, X } from "lucide-react";
```

### Dynamic import para telas/peças pesadas
```js
const CadastroItem = React.lazy(() => import("./pages/CadastroItem.jsx"));
// envolver em <Suspense fallback={<Loading />}>
```
Útil para fluxos pesados (cadastro com muitos componentes de característica) não carregados no boot.

## 3. Data Fetching no Cliente (MÉDIO-ALTO)

- **Centralize** as chamadas em `services/api/*`; não repita a mesma request em componentes irmãos — busque no pai e passe via props.
- **Evite duplo disparo** de `useEffect`: confira as dependências; um array de deps com objeto recriado a cada render dispara fetch em loop.
- Listeners globais (resize, keydown): um único listener no nível certo (ver `useItensPorPagina`, `ModalConfirmacao`), com cleanup no `return` do effect.

## 4. Otimização de Re-render (MÉDIO)

### Dependências primitivas no effect
```js
// ❌ useEffect(() => {...}, [usuario])      // re-roda quando a referência muda
// ✅ useEffect(() => {...}, [usuario.id])   // só quando o id muda
```

### Estado derivado, não duplicado
```js
// ❌ guardar em estado o que dá pra derivar do que já existe
// ✅ derivar no render: const ativos = itens.filter(i => i.item_ativo);
```

### setState funcional para callbacks estáveis
```js
// ❌ const inc = () => setSessao(sessao + 1);
// ✅ const inc = () => setSessao((s) => s + 1);
```

### Init preguiçoso de estado caro
```js
const [tabela] = useState(() => dividirEmPartes(lista, tamanho));
```

## 5. Performance de Renderização (MÉDIO)

### Render condicional seguro (evita renderizar `0`)
```jsx
// ❌ {itens.length && <Badge>{itens.length}</Badge>}   // mostra "0"
// ✅ {itens.length > 0 ? <Badge>{itens.length}</Badge> : null}
```

### Chaves estáveis em listas
```jsx
itens.map((item) => <CardItem key={item.item_id} item={item} />)
```

### JSX estático içado para fora do componente
Ícones/markup que não dependem de props/estado podem viver no módulo, fora da função, para não recriar a cada render.

## 6. Performance de JavaScript (BAIXO-MÉDIO)

- **`Map`/`Set` para lookups** repetidos em vez de `Array.find`/`includes` em loop.
- **Combine** múltiplos `filter`/`map` numa só passada quando a lista é grande.
- **Saída cedo** (`if (!dados) return ...`) para evitar trabalho desnecessário.
- **`toSorted`** em vez de `sort` para não mutar o array original.
- **Hoist de regex** para fora de loops.

## 7. Padrões Avançados (BAIXO)

- Handlers em `ref` (`useRef`) para não re-registrar listeners a cada render.
- `useLayoutEffect` para refs que precisam apontar sempre para o valor mais recente.

---

> Regra de ouro do projeto: antes de otimizar, **reutilize os componentes de `components/default/`** e mantenha o tema escuro glass. Performance não justifica recriar UI que já existe.
