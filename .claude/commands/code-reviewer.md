---
description: Revisão de código para o InfraHub (JavaScript/ESM — Express + Sequelize no backend, React + JSX no frontend). Analisa correção, segurança, performance e aderência aos padrões do projeto. Use ao revisar mudanças, PRs ou antes de commitar.
---

# Code Reviewer — InfraHub

Revisão focada no stack real do projeto: **JS puro (ESM)**, Express 5 + Sequelize no `server/`, React 19 + JSX + Tailwind no `client/`. Sem TypeScript.

## Quando Usar
- Revisar mudanças antes de commitar ou abrir PR
- Auditar qualidade, segurança e aderência aos padrões
- Gerar um relatório estruturado de feedback

---

## Checklist

### Correção & Lógica
- [ ] Faz o que deveria; trata bordas (null, array vazio, 0, valores ausentes)
- [ ] `async/await` correto; sem race conditions; promessas sempre aguardadas
- [ ] Sem off-by-one em paginação/índices
- [ ] Coerção explícita de entrada (`Number(x)`, `Number.isNaN`, parse de JSON em try/catch)

### Backend (Express + Sequelize)
- [ ] Controllers lançam `ApiError` em vez de montar resposta de erro na mão (Express 5 encaminha ao handler central)
- [ ] **`{ usuarioId: req.usuario.id }`** presente em todo `create`/`save`/`destroy` (trilha de auditoria)
- [ ] Nenhum dado sensível retornado (`senha_criptografada`, `senha_iv`, hash de senha)
- [ ] Includes com `as` correto; `attributes` explícitos (não vazar colunas demais)
- [ ] Operações multi-passo dentro de `sequelize.transaction`
- [ ] Rotas protegidas por `autenticar` + `autorizarRole`; papéis corretos
- [ ] Sem SQL cru interpolando entrada do usuário (usar o query builder do Sequelize)
- [ ] Crypto: IV aleatório por senha; chave vinda de env; nada logado

### Frontend (React + JSX)
- [ ] Reusa `components/default/` (`Notificacao`, `ModalConfirmacao`, `Loading`, `Paginacao`) — sem duplicar
- [ ] Erros de request via `tratarErro(setNotificacao, err, navigate)`
- [ ] Chamadas à API passam por `services/api/*` — sem `axios`/`fetch` direto no componente
- [ ] `key` estável em listas; dependências de `useEffect` corretas (ou `eslint-disable` justificado)
- [ ] Render condicional seguro: `cond ? <X/> : null` quando `cond` puder ser número
- [ ] Tema escuro glass mantido; sem `console.log` de depuração no entregue

### Segurança
- [ ] Sem segredos hardcoded (chaves, tokens) — usar `process.env`
- [ ] Entrada validada nas fronteiras (controller); autorização presente nas rotas protegidas
- [ ] `.env` nunca lido/commitado

### Manutenibilidade
- [ ] Função com responsabilidade única; sem duplicação desnecessária
- [ ] Nomes descritivos (em português, padrão do projeto); sem números/strings mágicos
- [ ] Código morto removido

### Testes
- [ ] Comportamento novo tem teste (Vitest) cobrindo feliz + erro/borda
- [ ] Backend mocka models via `createModelsMock()` (sem mock inline; sem tocar o banco)
- [ ] Nenhum teste com asserção sobre literal ou sem `expect`

---

## Anti-padrões comuns neste projeto

```js
// ❌ Tratar erro manualmente no controller
export async function getItem(req, res) {
  try { /* ... */ } catch (e) { res.status(500).json({ erro: e.message }); }
}
// ✅ Lançar ApiError e deixar o handler central de app.js responder
export async function getItem(req, res) {
  const { id } = req.params;
  if (!id) throw ApiError.badRequest("ID do item é obrigatório");
  const item = await Item.findByPk(id);
  if (!item) throw ApiError.notFound("Item não encontrado");
  return res.status(200).json(item);
}
```

```js
// ❌ Esquecer o usuarioId → quebra a auditoria
await Setor.create({ setor_nome, setor_empresa_id });
// ✅ Sempre repassar
await Setor.create({ setor_nome, setor_empresa_id }, { usuarioId: req.usuario.id });
```

```js
// ❌ Vazar dado sensível na listagem
const senhas = await Senha.findAll({ where: { senha_empresa_id: id } });
// ✅ Selecionar só o necessário; descriptografar apenas no endpoint full/:id
const senhas = await Senha.findAll({
  where: { senha_empresa_id: id },
  attributes: ["senha_id", "senha_nome", "senha_usuario"],
});
```

```jsx
// ❌ Chamar axios direto e tratar erro ad-hoc no componente
const { data } = await axios.get(`/item/${id}`);
// ✅ Service + tratarErro
import { getItens } from "../services/api/itemServices";
try { setItens(await getItens(id)); } catch (err) { tratarErro(setNotificacao, err, navigate); }
```

```jsx
// ❌ Renderiza "0" quando a contagem é 0
{itens.length && <Badge>{itens.length}</Badge>}
// ✅ Ternário
{itens.length > 0 ? <Badge>{itens.length}</Badge> : null}
```

---

## Formato de Saída

Organize por prioridade:

### 🔴 Crítico (corrigir antes do merge)
Falhas de segurança, perda de dados, vazamento de dado sensível, quebra de auditoria, regressão.

### 🟡 Atenção (deveria corrigir)
Performance, qualidade, tratamento de erro ausente, fuga de padrão do projeto.

### 🟢 Sugestão (considerar)
Legibilidade, melhores padrões, pequenas otimizações.

### ✅ OK
Trechos que seguem bem os padrões.

### Exemplo de comentário
```
🔴 Crítico — Vazamento de senha criptografada
Arquivo: server/controllers/senhaController.js, linha 16

getSenhas retorna senha_criptografada/senha_iv na listagem. Restrinja os
attributes e descriptografe apenas no endpoint full/:id.
```
