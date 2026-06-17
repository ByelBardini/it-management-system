# Tracking de execução — visual-minimalista

Tempo gasto em cada etapa. Linguagem meio termo.

**Início:** 2026-06-17

| # | Etapa | O que está sendo feito | Início | Fim | Duração |
|---|-------|------------------------|--------|-----|---------|
| 1 | Fundação visual global | Define a nova "pele" minimalista (superfície plana, sem desfoque nem sombra) e aplica nas peças que aparecem em toda a aplicação: o fundo da tela (remove glow, grade, manchas borradas e gradiente), o cabeçalho e a tela de carregamento. Ponto de validação do novo visual antes de propagar. | 2026-06-17 | 2026-06-17 ✅ | — |
| 2 | Componentes compartilhados e visão geral | Aplica o novo padrão nos avisos, confirmações e paginação, e nas telas de dashboard e empresas — achata os cards aninhados e troca os "chips" coloridos de ícone por ícones simples, sem caixa. | 2026-06-17 | 2026-06-17 ✅ | — |
| 3 | Inventário e peças | Propaga o visual minimalista nas telas de inventário e peças: listagens, cards de detalhe, filtros e modais de cadastro/edição/importação. | 2026-06-17 | 2026-06-17 ✅ | — |
| 4 | Demais telas e documentação | Aplica o mesmo padrão nas telas restantes (manutenções, workstations, setores, usuários, configurações, perfil, marcas, anexos e login), remove a decoração de fundo replicada nas páginas standalone e atualiza o documento de identidade visual no contexto do projeto. | 2026-06-17 | 2026-06-17 ✅ | — |
| 5 | Validar tudo manualmente | Rodar `cd client && npm test` (toda a suíte verde) e conferir visualmente o caminho feliz e as bordas que importam — em especial telas vazias, modais e estados de erro, já que foram removidos preenchimentos e molduras. Sem migração de banco nesta tarefa. | 2026-06-17 | 2026-06-17 ✅ (execução dos testes a cargo do usuário) | — |

---

## Resumo

Implementação concluída (Fases 1–12). Todos os blocos carimbados. ESLint passou sem erros. Sem migração de banco, sem backend tocado. Execução de `cd client && npm test` e a conferência visual final ficam a cargo do usuário (o agente nunca roda testes).

---

## Resumo do que foi implementado

**O quê.** Refatoração puramente visual (CSS/classNames) de todo o frontend, trocando o tema "dark glass" carregado por um "dark minimal" plano — atendendo ao pedido de menos detalhes e menos preenchimentos desnecessários.

**Por quê.** O tema antigo empilhava decoração: fundo com glow radial + grade + blobs desfocados, superfícies com `backdrop-blur` + `shadow`, molduras (`ring`) e preenchimentos (`bg-white/5`) aninhados, e "caixinhas" coloridas em volta de cada ícone. O resultado era ruidoso. O objetivo foi uma única superfície plana por nível, com cor apenas onde carrega significado (status e ação).

**Como.**
- **Fundo:** removidas as 4 camadas decorativas do `AppLayout` e das páginas standalone (`Login`, `Empresas`, `Usuarios`, `CadastroItem`) → navy `bg-[#0A1633]` sólido. `Header` achatado (`border-b border-white/10`, sem blur/sombra), avatar neutro.
- **Superfícies:** card/painel → `rounded-xl bg-white/[0.03] ring-1 ring-white/10` (sem `shadow-*` nem `backdrop-blur-*`). Painéis de modal → opacos `bg-[#0E1A38]` (compensam a ausência de blur); overlays mantêm `bg-black/60|70` sem blur.
- **Achatamento:** painéis aninhados perderam fill+ring (espaçamento e `divide-y divide-white/10`); chips de ícone coloridos viraram ícone simples; badges de contagem em caixa viraram número simples.
- **Preservado:** estrutura JSX, textos, roles/aria, handlers, props, services, estado, animações framer-motion; cores semânticas de status; botões de ação sólidos; inputs/selects funcionais.

**Arquivos principais.** ~50 arquivos em `client/src/` (`pages/*` e `components/**`), com destaque para `AppLayout.jsx`, `Header.jsx`, `Loading.jsx`, `App.jsx` (dashboard, o mais carregado), `CardItem.jsx` e os modais. Doc de contexto atualizado em `docs/context/frontend-core.md` e `index.md` ("dark minimal").

**Cobertura de testes.** Nenhum teste novo (mudança visual sem lógica nova; nenhum teste do projeto faz asserção de `className`). A rede de regressão é a suíte de comportamento existente permanecer verde — `cd client && npm test`. Verificação extra feita: `npm run lint` passou sem erros (sem imports órfãos nem sintaxe quebrada após o fan-out de edição).
