# Tracking de execução — coletor-desktop-e-app-cadastro-mobile

Tempo gasto em cada etapa. Linguagem meio termo.

**Início:** —

| # | Etapa | O que está sendo feito | Início | Fim | Duração |
|---|-------|------------------------|--------|-----|---------|
| 1 | Backend: endpoint de coleta de desktop, coberto por testes | Releu o fluxo atual de desktop (item composto por peças, série "N/A", preço somado), os validadores/`resolverMarcaModelo` da importação e os mocks de teste. Escreveu antes os testes (TDD): `importacao.spec.js` (novo, 7 casos dos validadores puros) e bloco `describe("coletarDesktop")` em `item.controller.spec.js` (7 casos: cria+soma, defaults, sem marca, cache, sem peças, sem empresa, tipo inválido). Implementou `validarPecaColetada`/`errosColetaDesktop` em `helpers/importacao.js`, o controller `coletarDesktop` (transação, resolução por nome, defaults) em `itemController.js` e a rota `POST /item/coletar-desktop` (adm). | — | **concluído** | — |
| 2 | Ferramenta: script de coleta para Windows | Criou `ferramentas/coletor-desktop/coletar-desktop.ps1` (coleta via Get-CimInstance: CPU, placa-mãe, RAM, disco, vídeo, rede; login com `-SessionVariable`; POST com `-WebSession`; `-DryRun`; senha segura; TLS 1.2) e o `README.md` (parâmetros, exemplos, `-ExecutionPolicy Bypass`, empacotamento `ps2exe`, troubleshooting). | — | **concluído** | — |
| 3 | Documentação | Registrou o endpoint na tabela e nas regras de negócio de `docs/context/inventario.md` e na lista de `/item` + árvore do repo (`ferramentas/`) no `README.md`. | — | **concluído** | — |
| 4 | Validar tudo manualmente | Rodar `cd server && npm test` e `cd client && npm test`, e conferir o caminho feliz e as bordas que importam: rodar o script numa máquina Windows real e confirmar que o desktop e as peças aparecem no inventário com marca/modelo e preço corretos. Aplicar a migração `0003` (`npm run db:migrate`). | — | 2026-06-17 21:26 | — |

> Verificação adversarial extra (workflow `verificar-coletor-desktop`, 4 lentes: backend, testes, script PS, docs) rodada após a implementação para caçar bugs antes da validação manual.
>
> **Achado bloqueante (corrigido):** o índice `UNIQUE` GLOBAL de `itens.item_num_serie` (0001) impede mais de um desktop, pois todos usam `item_num_serie="N/A"`. O plano dizia "sem migração", mas a premissa estava errada. Com aprovação do usuário, foi gerada a migração **`server/db/migrations/0003_serie_unica_ignora_desktop.sql`** (troca a UNIQUE por uma coluna gerada que exime desktops) — corrige também o `postItem` existente. Migração **não** foi aplicada; rodar `cd server && npm run db:migrate`. Também corrigidos no script PS: "modelo sem marca" derrubava o lote e placeholder de disco virava marca-lixo.

> A **Parte 2 (app Android)** é uma *proposta/ideia* — não há implementação a executar neste plano. Ao aprovar a recomendação (PWA instalável empacotada como APK), abre-se um `/plan` próprio para ela.

---

## Resumo

**Parte 1 (Coletor de desktops) — concluída e commitada.** Etapas 1-3 entregues; etapa 4 (validação manual: `npm test` + rodar o script numa máquina Windows + aplicar a migração `0003`) permanece como ação do usuário (o agente nunca roda testes/migrações). **Parte 2 (app mobile)** era só proposta — virou o plano dedicado `app-cadastro-mobile-pwa-twa.md` (não tocado).

---

## Resumo do que foi implementado (Parte 1)

**O quê.** Caminho "uma tacada só" para cadastrar **desktop**: endpoint `POST /item/coletar-desktop` (adm) que cria o item desktop + suas peças numa única transação, recebendo marca/modelo **por nome**, e um script PowerShell que coleta o hardware da máquina e chama o endpoint.

**Por quê.** Antes, cadastrar um desktop pela API exigia criar cada peça (resolvendo marca/modelo a id) e depois o item apontando os ids — vários passos manuais, sem caminho automatizado.

**Como.**
- Backend: `validarPecaColetada`/`errosColetaDesktop` (validadores puros, série/preço/data opcionais com default) em `helpers/importacao.js`; controller `coletarDesktop` (transação, `resolverMarcaModelo` + cache do lote) em `itemController.js`; rota `POST /item/coletar-desktop`.
- Ferramenta: `ferramentas/coletor-desktop/coletar-desktop.ps1` (coleta via `Get-CimInstance`, login por cookie de sessão) + README.
- Migração `0003_serie_unica_ignora_desktop.sql`: troca a UNIQUE global de `item_num_serie` por coluna gerada que exime desktops — permite vários `"N/A"` sem colidir (corrige também o `postItem`).
- Docs: `inventario.md`, `banco-migrations.md`, `README.md`.

**Testes.** Validadores puros (`importacao.spec.js`) + controller `coletarDesktop` (`item.controller.spec.js`). Endurecimento posterior (peça malformada, validação de vínculo setor/workstation por empresa) entrou no plano `corrige-achados-coletar-desktop` (já arquivado).

**Commits (branch `main`):** `test(item)` → `feat(item)` → `feat(db)` → `feat(ferramentas)` → `docs`.
