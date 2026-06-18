# Tracking de execução — app-cadastro-mobile-pwa-twa

Tempo gasto em cada etapa. Linguagem meio termo.

**Início:** 2026-06-17 · **Fim:** 2026-06-18

| # | Etapa | O que está sendo feito | Início | Fim | Duração |
|---|-------|------------------------|--------|-----|---------|
| 1 | Backend: papel de cadastro restrito, coberto por testes | Levanta como a autorização é aplicada hoje (um middleware único trava o recurso inteiro, inclusive as leituras que o formulário precisa) e por que isso quebraria o app. Escreve antes os testes do novo controle de acesso (caso feliz: cadastrador liberado; bordas: admin sempre passa; erros: usuário comum barrado e requisição sem usuário). Depois cria o papel "cadastrador", troca a autorização para ser por operação (criar item/marca/modelo/subtipo e as listagens da cascata liberadas ao cadastrador; editar/excluir/importar seguem só admin) e prepara a migração que adiciona o papel no banco. | 2026-06-17 | ✔ 2026-06-17 | — |
| 2 | Frontend: base do app instalável (PWA) | Adiciona o que falta para o app ser instalável: manifesto, service worker (com estratégia de rede para as leituras da API), ícones e ajustes de cabeçalho. Configura o servidor web para entregar o service worker e o arquivo de verificação do app sem serem engolidos pelo redirecionamento padrão, e para não servir uma versão velha após cada publicação. | 2026-06-17 | ✔ 2026-06-17 | — |
| 3 | Frontend: fluxo de cadastro pelo celular, coberto por testes | Escreve antes os testes da montagem do envio e das preferências (datas já vêm com hoje, lembra o último tipo/marca/modelo). Depois cria a tela de cadastro responsiva reaproveitando a cascata existente (tipo, subtipo, marca, modelo) e os componentes de aviso/carregando; exclui "desktop" do app; valida os campos obrigatórios e a empresa ativa; envia online ou guarda para enviar depois. | 2026-06-17 | ✔ 2026-06-17 | — |
| 4 | Frontend: câmera, leitura de código e fila offline | Adiciona tirar foto do item e ler etiqueta/serial pela câmera (com alternativa para aparelhos sem suporte). Escreve antes os testes da fila offline (guardar o cadastro localmente, remontar o envio, reenviar quando a rede voltar, distinguir falha de rede de sessão expirada de erro de validação, e respeitar limites). Implementa a fila, o reenvio automático e o contador de pendentes. | 2026-06-17 | ✔ 2026-06-17 | — |
| 5 | Empacotamento do APK (TWA) + publicação + documentação | Gera o APK que embrulha o app (fora de loja), com a chave de assinatura e o arquivo de verificação de domínio servido corretamente. Garante HTTPS e a origem do app liberada no servidor. Documenta o papel novo, a estratégia offline, o procedimento de gerar o APK e a criação do usuário de cadastro. | 2026-06-17 | ✔ 2026-06-18 (base/docs; APK é passo manual do usuário) | — |
| 6 | Validar tudo manualmente | Rodar `cd server && npm test` e `cd client && npm test`, aplicar a migração do papel e criar um usuário de cadastro, e conferir num Android real: a cascata carrega para o cadastrador, foto e leitura de código funcionam, cadastro online e offline (com reenvio ao voltar a rede), sessão expirada não perde a fila, e o APK abre sem barra de endereço. | 2026-06-18 | ✔ impl. concluída; **validação manual no Android + APK ficam com o usuário** | — |

---

## Resumo

Plano concluído em 2026-06-18 (impl. iniciada em 2026-06-17). **5 fases de implementação concluídas** (backend, base PWA, fluxo mobile, câmera+fila, empacotamento/docs); a **etapa 6 é validação manual do usuário** (rodar os testes, aplicar a migração `0004`, criar usuário `cadastrador`, gerar o APK e conferir num Android real). Fluxo TDD: testes escritos e auditados antes da implementação; revisão adversarial multidimensional (workflow) com 5 achados corrigidos; revisão de segurança focada sem achados de alta confiança.

## Resumo do que foi implementado

**O quê / por quê.** App de cadastro mobile do InfraHub: rota standalone `/cadastro-mobile`, instalável como PWA e empacotável em **APK fora de loja via TWA**, para cadastro rápido em campo. Usa um papel restrito **`cadastrador`** (sem poderes de admin) para não embarcar credencial `adm` num APK distribuído.

**Backend (papel + autorização por verbo).**
- `server/middlewares/autenticaToken.js`: novo `autorizarQualquerRole(roles)` (libera `tipo ∈ roles` ou `adm`; 401 sem usuário, 403 caso contrário).
- `server/routes/{item,marca,modelo,subtipo}Routes.js`: remove o `router.use(autorizarRole("adm"))` global e aplica autorização **por verbo** — `POST /item` e os GET/POST da cascata liberados ao `cadastrador`; ler/editar/excluir/importar/coletar-desktop seguem `adm`.
- `server/models/usuarios.js`: ENUM `usuario_tipo` += `cadastrador`. Migração `server/db/migrations/0004_role_cadastrador.sql` (forward-only, aditiva).
- **Decisão:** `GET /empresa` mantido aberto a qualquer autenticado (seleção de empresa é universal — gateá-lo quebraria o papel `usuario`).

**Frontend (PWA + fluxo + offline).**
- `client/src/pages/CadastroMobile.jsx` + rota em `main.jsx`; reusa a cascata e os componentes (`DadosGerais` ganhou a prop `tiposOcultos`, escondendo `desktop`).
- `client/src/mobile/`: `payloadCadastro` (builder puro do multipart, sem `pecas`), `preferencias` (defaults hoje + última escolha), `db` (outbox IndexedDB), `filaOffline` (fila pura, classifica rede/401/403/4xx), `sync` (drena no boot/online/pós-cadastro).
- `client/src/components/mobile/`: `CapturaFoto` (câmera + compressão), `LeitorCodigo` (`BarcodeDetector` nativo, com cleanup do stream), `ContadorPendentes`.
- PWA: `vite.config.js` (VitePWA generateSW, NetworkFirst só GET `/api`), `index.html` (metas), ícones em `public/`, `nginx.conf.template` (serve sw/manifest/assetlinks antes do fallback), `Dockerfile` (COPY assetlinks), `.well-known/assetlinks.json` (template).

**Testes que cobrem a mudança.**
- `server/test/unit/middlewares/autenticaToken.spec.js` — `autorizarQualquerRole` (cadastrador/adm/403/401).
- `client/src/test/{payloadCadastro,preferencias,filaOffline,db}.test.js` e `CadastroMobile.test.jsx` — builder, preferências, fila offline (rede/401/403/4xx/retries), IndexedDB e a página (cascata sem desktop, submit online/offline, erros). Rode: `cd server && npm test` e `cd client && npm install && npm test`.

**Passos manuais pendentes (do usuário).** Aplicar a migração `0004` (`npm run db:migrate`); criar usuário(s) `cadastrador`; incluir a origem pública do app em `CORS_ORIGIN`; gerar o APK (Bubblewrap → keystore → SHA-256 no `assetlinks.json` → redeploy) e validar num Android real. Detalhes em `docs/deploy/coolify.md` §5b.
