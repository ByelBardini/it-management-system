# Tracking de execução — coletor-autoatendimento-desktop

Tempo gasto em cada etapa. Linguagem meio termo.

**Início:** 2026-06-18 09:09

| # | Etapa | O que está sendo feito | Início | Fim | Duração |
|---|-------|------------------------|--------|-----|---------|
| 1 | Banco e modelos: papel coletor, vínculo de empresa e tokens | Acrescenta o papel restrito "coletor", amarra a conta a uma empresa e cria a tabela de tokens revogáveis (migração + modelos + associações). Base para o resto. | 09:09 | 09:12 | 3 min |
| 2 | Backend: token de coleta + geração do pacote de download | Cobre por testes (antes do código) o token revogável (gerar, validar, revogar, escopo por empresa) e a geração do pacote; cria a validação de token para a rota de coleta, o endpoint que gera o token e monta o ZIP com o script + atalho, e as rotas (coleta por token e download). | 09:12 | 09:16 | 4 min |
| 3 | Backend: criação da conta de coleta | Permite ao administrador criar a conta restrita de coleta já vinculada a uma empresa, com testes do caso feliz e da recusa quando falta a empresa. | 09:16 | 09:18 | 2 min |
| 4 | Frontend: tela de download do coletor e desvio de login | Cria a tela enxuta (só o botão de baixar), o serviço de download e o desvio que leva a conta de coleta direto para essa tela após o login; coberto por testes de componente. | 09:18 | 09:21 | 3 min |
| 5 | Frontend: opção de conta de coleta no cadastro de usuários | Adiciona o tipo "coleta" e a seleção de empresa no cadastro de usuários do administrador. | 09:21 | 09:22 | 1 min |
| 6 | Coletor e documentação | Ajusta o script para o modo autoatendimento (autentica por token, pergunta nome e setor e monta a etiqueta) mantendo o modo manual; atualiza README e a documentação de contexto/deploy (nova env da URL pública). | 09:22 | 09:25 | 3 min |
| 7 | Validar tudo manualmente | Rodar `cd server && npm install` (jszip) + `npm test` e `cd client && npm test`, aplicar a migração (`npm run db:migrate`), definir a env da URL pública, criar uma conta de coleta, baixar o ZIP, rodar o script conferindo a etiqueta e o envio (inclusive `-DryRun`), e validar a revogação do token. | 09:25 | 09:40 | 15 min (estimado — responsabilidade do usuário) |

---

## Resumo

Implementação concluída (etapas 1–6, ~16 min) e commits criados (2026-06-18). 7 de 7 etapas; etapa 7 é validação manual, responsabilidade do usuário.

**Entregue (ponta a ponta):**
- **Banco:** migração `0006` (ENUM `coletor`, `usuario_empresa_id`, tabela `coletor_tokens`);
  models `usuarios`/`coletorToken` + associações.
- **Backend:** middleware `autenticarColetorToken` (valida token no banco, injeta empresa);
  `coletorController.baixarColetor` (token rotacionado + ZIP via `jszip`); rotas
  `POST /item/coletar-desktop/token` (antes do gate de cookie) e `GET /coletar-desktop/download`;
  `cadastrarUsuario` aceita coletor + empresa; helper puro `coletorToken.js`. Dep `jszip`.
- **Frontend:** página `Coletor.jsx` + `coletorServices`, rota `/coletor`, desvio de login por
  papel, e opção "coletor" + empresa no `ModalAdicionaUsuario`.
- **Coletor:** script com modo `-Token` (Bearer, sem login), prompt nome+setor e `MontarEtiqueta`
  (3 letras do setor + iniciais), mantendo o modo manual.
- **Docs:** auth-usuarios, inventario, banco-migrations, coolify e README do coletor.

**Testes que cobrem:** helper de token (`coletorToken.spec`), middleware + download
(`coletor.controller.spec`), criação da conta (`usuario.controller.spec`), tela e desvio de
login (`Coletor.test`/`LoginRedirect.test`). Sintaxe dos JS do backend validada com `node --check`.

**Atenção (validação manual):** rodar `npm install` no server antes dos testes (jszip novo);
definir `COLETOR_API_BASE`; garantir que a imagem de produção inclua o script do coletor (ou
`COLETOR_SCRIPT_PATH`). A conta coletor nasce com senha padrão "12345" (trocar/definir).
