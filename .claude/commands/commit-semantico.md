---
description: Orienta a criar commits semânticos e descritivos (Conventional Commits). Mensagens detalham a tarefa (o quê, por quê, como). Git add modular — nunca misturar arquivos de escopos diferentes. Prioridade: testes > backend > frontend.
---

# Commits Semânticos — InfraHub

## Comandos Permitidos

**Usar APENAS:**
- `git branch --show-current` / `git status` — inspeção
- `git add` — adicionar ao stage
- `git commit` — criar commit com mensagem

Os commits vão **sempre na branch atual** — este projeto **não usa PR**. Por isso **não crie nem troque de branch**.

Não usar: `git switch -c` / `git checkout -b` (criar branch), `git switch` / `git checkout <branch>` (trocar), `git push`, `git pull`, `git merge`, `git stash`, `git reset` ou outros que reescrevem histórico ou tocam o remoto.

---

## Regra de Ouro: Add Modular

**NUNCA misturar arquivos de escopos diferentes no mesmo commit.** Cada commit contém um único escopo:
- Só **testes** (`server/test/**` ou `client/src/test/**`)
- Só **backend** (`server/**`)
- Só **frontend** (`client/**`)
- Só **migração** (`migration/**`)
- Só **config/raiz** (`docker-compose.yml`, `.claude/**`, README, etc.)

> Os testes ficam **dentro** de cada pacote (`server/test/`, `client/src/test/`). Ainda assim, commite-os separados da implementação, na frente dela (TDD: o teste vem primeiro).

---

## Prioridade dos Commits

1. **Testes** — primeiro
2. **Backend** (`server/`) — segundo
3. **Frontend** (`client/`) — terceiro
4. **Migração / config** — conforme a dependência

---

## Formato da Mensagem (Conventional Commits)

```
<tipo>(<escopo>): <resumo curto>

[corpo — descrição detalhada: o quê, por quê, como]
```

### Tipos (seguindo o histórico do repo)

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `test` | Adicionar/ajustar testes |
| `refactor` | Refatoração sem mudar comportamento |
| `chore` | Manutenção, config, deps |
| `docs` | Documentação |
| `style` | Formatação (não altera lógica) |

### Regras do resumo (primeira linha)
- Imperativo, minúscula (exceto nomes): "adiciona", não "adicionado"
- Sem ponto final; máx. ~72 caracteres; específico o bastante para entender a mudança

### Corpo descritivo (obrigatório quando não-trivial)
Responda **o quê** (arquivos/funções/endpoints/telas), **por quê** (problema/objetivo) e **como** (abordagem). Evite mensagens genéricas.

---

## Fluxo de Trabalho

### 1. Verificar alterações
```bash
git status
```

### 2. Confirmar a branch atual (sem criar/trocar)
Commite **na branch atual** — este projeto não usa PR, então **não crie branch nova**.
```bash
git branch --show-current
```
- Apenas confirme onde está; não rode `git switch`/`git checkout`.

### 3. Agrupar por escopo
Classifique os arquivos: testes, `server/**`, `client/**`, `migration/**`, outros.

### 4. Criar commits na ordem de prioridade
```bash
git add <arquivos-do-grupo>
git commit -m "<tipo>(<escopo>): <resumo>" -m "<corpo detalhado>"
```

### Exemplo (testes + backend)
```bash
git add server/test/unit/setor/setor.controller.spec.js
git commit -m "test(setor): cobre criação e exclusão de setor" -m "Testa postSetor e deleteSetor com mock dos models, validando o repasse de usuarioId para o log de auditoria e os erros ApiError 400."

git add server/controllers/setorController.js server/routes/setorRoutes.js
git commit -m "feat(setor): valida empresa e audita exclusão" -m "Garante setor_empresa_id obrigatório e repassa usuarioId em create/destroy para a trilha de auditoria."
```

---

## Checklist antes de commitar
```
- [ ] Commits feitos na branch atual (sem criar nem trocar de branch)
- [ ] Arquivos agrupados por escopo (testes / server / client / migration)
- [ ] Nenhum escopo misturado no mesmo commit
- [ ] Ordem: testes → backend → frontend
- [ ] Resumo específico + corpo (o quê/por quê/como)
- [ ] Apenas git add e git commit
```

---

## Após o commit — arquivar o plano concluído

Se o(s) commit(s) concluem um plano de `.claude/plans/`, **sempre** arquive o tracking (não apague sem arquivar, não pergunte):

1. **Carimbar o último passo** do `.tasks.md` (geralmente o de validação, que fica `pendente` porque o agente nunca roda testes). Pegue a hora atual, preencha o `Fim`, calcule a `Duração` se houver `Início`, troque `pendente` por concluído e atualize o **Resumo**.
2. **Escrever a seção "Resumo do que foi implementado"** ao final do `.tasks.md`: o quê foi entregue (endpoints/telas/arquivos principais), por quê e como, e quais testes cobrem a mudança. Esse `.tasks.md` arquivado vira a memória permanente da entrega.
3. **Arquivar e apagar**:
```bash
mv ".claude/plans/<nome>.tasks.md" ".claude/plans/planos concluidos/"
rm ".claude/plans/<nome>.md"
```
Assim `.claude/plans/` mantém só os planos em andamento.
