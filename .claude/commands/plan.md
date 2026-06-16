Cria um plano de implementação detalhado para a tarefa descrita em $ARGUMENTS. Siga este processo **sem pular nenhuma etapa**.

---

## 1. Identificar domínio e ler docs/context

Leia `docs/context/index.md` e identifique a(s) área(s) afetada(s). Leia o(s) doc(s) de contexto correspondente(s) **+ sempre** os núcleos `docs/context/backend-core.md` e/ou `docs/context/frontend-core.md` (caminhos reais, endpoints, modelos, regras, gotchas). O `README.md` complementa com a stack. Determine se a tarefa afeta **backend** (`server/`), **frontend** (`client/`) ou ambos.

## 2. Mapear os arquivos reais

- **Backend** (`server/`): `controllers/<recurso>Controller.js`, `models/<recurso>.js`, `models/index.js`, `routes/<recurso>Routes.js`, `middlewares/`, `config/database.js`.
- **Frontend** (`client/src/`): `pages/*.jsx`, `components/<dominio>/*.jsx`, `components/default/*`, `services/api/<recurso>Services.js`, `services/api.js`.
- **Banco**: `migration/version-XX.sql`.

## 3. Ler o código atual

Abra **apenas** os arquivos que serão alterados (use `offset`/`limit` em arquivos grandes). Siga os imports a partir da rota ou da página. Extraia: nomes reais de colunas Sequelize, contrato de cada endpoint (método, path, `autorizarRole`), o fluxo front → service → controller → model, e os padrões visuais do front (tema escuro glass).

## 4. Montar o plano e salvar

Salve em `.claude/plans/<nome-descritivo>.md` (kebab-case) com **todas** as seções:

#### Contexto
O que o código atual faz; gap entre estado atual e desejado. Cite arquivos e funções reais.

#### O que muda
Arquivos e tipo de mudança (novo, edição, remoção, renomeação), incluindo migração SQL se houver.

#### Testes unitários (TDD — escrever ANTES da implementação)
Para cada função/comportamento novo: **Nome** (em português), **Input**, **Output esperado** (retorno, `res.status/json`, ou exceção `ApiError`), **Importância** (feliz, borda, erro). Inclua obrigatoriamente: caso feliz, ao menos uma borda e ao menos um erro. Backend testa controllers (mock dos models); frontend testa funções puras e componentes.

#### Implementação (executar APÓS os testes existirem)
Passo a passo. Máximo 5 arquivos por fase; se exceder, dividir em fases e pedir aprovação. Respeite os padrões: `ApiError` sem try/catch, `{ usuarioId: req.usuario.id }` em creates/saves; front com `services/api/*`, `tratarErro`, `Notificacao`/`ModalConfirmacao`.

#### Migração de banco
Se altera schema: descreva a mudança e indique `migration/version-XX.sql` (próximo número). Senão: "Nenhuma migração necessária."

#### Atualização de docs/context
Se afeta endpoint, coluna de model, regra de negócio ou componente compartilhado, liste o(s) doc(s) de `docs/context/` a atualizar e o quê. Senão: "Nenhuma atualização de docs/context necessária."

#### Arquivos alterados
Tabela: `Arquivo | Tipo de mudança | Motivo`.

#### O que NÃO muda
Schema, contratos de endpoint, componentes compartilhados, testes existentes.

## 5. Criar arquivo de tracking de execução

Salve também `.claude/plans/<nome-descritivo>.tasks.md` para medir o tempo de cada etapa (o `/exec-plan` preenche `Início`/`Fim`/`Duração`).

**Linguagem meio-termo:** alguém de fora acompanha, mas mantém os termos do ofício. *Entra*: "endpoint", "controller", "model", "migração", "componente", "fluxo", "validação", "cobertura de testes", "TDD". *Não entra*: caminhos de arquivo, nomes de função/componente específicos, nomes de bibliotecas que não importam ao leitor. Verbo no presente, voz ativa. Agrupe etapas relacionadas em blocos coerentes (backend juntos, frontend juntos). **3 a 6 blocos.** Inclua sempre um bloco final `pendente` de "Validar tudo manualmente" — o agente nunca roda testes nem migrações.

**Template:**
```markdown
# Tracking de execução — <nome-descritivo>

Tempo gasto em cada etapa. Linguagem meio termo.

**Início:** —

| # | Etapa | O que está sendo feito | Início | Fim | Duração |
|---|-------|------------------------|--------|-----|---------|
| 1 | Backend: <entrega — endpoint/model/regra, coberto por testes> | <sequência: o que foi levantado do fluxo atual, casos cobertos por testes antes do código, o que mudou no controller/model/banco> | — | — | — |
| 2 | Frontend: <entrega — service, estado, exibição> | <sequência: novo service/estado, componente de captura, onde a informação aparece pro usuário> | — | — | — |
| 3 | Validar tudo manualmente | Rodar `cd server && npm test` e `cd client && npm test`, aplicar a migração se houver, e conferir o caminho feliz e as bordas que importam. | — | pendente | — |

---

## Resumo

Preenchido ao fim: tempo total + etapas concluídas vs pendentes.
```

## 6. Apresentar o plano — não executar

Mostre o resumo (mencione que o `.tasks.md` foi criado). **Não comece a implementação.** Ela só ocorre com `/exec-plan <nome>`.

## 7. Regra absoluta sobre testes e banco

Nunca rode `npm test`, nem migrações. Sempre lembre o usuário de rodar os testes manualmente (de dentro de `server/` e `client/`) após a implementação.
