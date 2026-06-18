# Deploy no Coolify — InfraHub (front + back + MySQL)

A aplicação é uma **página web** (não mais app Tauri). Sobe como **3 recursos no mesmo
projeto** do Coolify:

| Recurso | O que é | Como criar |
|---|---|---|
| **mysql** | Banco de dados | Coolify → *New Resource* → **Database → MySQL** (8.x) |
| **backend** | API Express | *New Resource* → **Application**, build pack **Dockerfile**, base directory `server/` |
| **frontend** | SPA + nginx (proxy `/api`) | *New Resource* → **Application**, build pack **Dockerfile**, base directory `client/` |

Arquitetura: o navegador fala só com o **frontend**. O nginx do frontend serve o site e
faz **reverse-proxy de `/api` → backend** (mesma origem). O backend fala com o **mysql** pela
rede interna. Só o frontend (e, se quiser, o backend) precisa de domínio público.

```
navegador ──HTTPS──> frontend (nginx)
                         ├── / ............. estático (SPA)
                         └── /api/* ........ proxy ──> backend ──> mysql
```

## 1. Rede interna entre os apps

Para o frontend alcançar o backend (e o backend o MySQL) pelo **nome do serviço**, habilite
em cada recurso: **Settings → Connect to Predefined Network** (mesmo projeto = mesma rede
Docker). Use o nome/endereço interno que o Coolify mostra para cada recurso.

> Alternativa: apontar o `BACKEND_URL` do front para o **domínio público** do backend
> (`https://api.seudominio.com`). Funciona, mas adiciona um salto público desnecessário.

## 2. Variáveis de ambiente

### backend (Application — Dockerfile, base dir `server/`)

| Variável | Exemplo / valor | Observação |
|---|---|---|
| `DB_HOST` | `<host interno do mysql>` | endereço interno do recurso MySQL |
| `DB_PORT` | `3306` | |
| `DB_DATABASE` | `infrahub` | precisa existir (crie no MySQL) |
| `DB_USER` | `infrahub` | |
| `DB_PASSWORD` | `<forte>` | |
| `PORT` | `3032` | porta da API no container |
| `NODE_ENV` | `production` | ativa cookie Secure e exige `CORS_ORIGIN` |
| `CORS_ORIGIN` | `https://app.seudominio.com` | **domínio do FRONT** (CSRF + CORS). Vários separados por vírgula |
| `COOKIE_SECURE` | `true` | cookie só em HTTPS (Coolify provê TLS) |
| `SECRET_KEY_LOGIN` | `<aleatório forte>` | segredo do JWT |
| `SECRET_KEY_PASSWORD` | `<exatamente 32 chars>` | AES-256-CBC; o app **não sobe** se o tamanho estiver errado |
| `COLETOR_API_BASE` | `https://app.seudominio.com/api` | **URL pública** que os PCs da empresa acessam; embutida no `Coletar.bat` do ZIP do coletor. Sem ela, `GET /item/coletar-desktop/download` retorna 500 |
| `COLETOR_SCRIPT_PATH` | _(opcional)_ | caminho do `coletar-desktop.ps1` na imagem, se não estiver no padrão `assets/coletor/` (relativo ao cwd do backend; ver nota abaixo) |

> O backend **valida os segredos no boot** (`validarAmbiente`) — se faltar `SECRET_KEY_LOGIN`
> ou o `SECRET_KEY_PASSWORD` não tiver 32 caracteres, o container falha de propósito.

> **Coletor (autoatendimento):** o endpoint de download monta o ZIP a partir do template
> `server/assets/coletor/coletar-desktop.ps1`. O script fica **dentro de `server/`** de
> propósito: o build do backend usa essa pasta como contexto Docker (`COPY . .`), então o
> arquivo entra na imagem automaticamente — não precisa de `COPY` extra nem de
> `COLETOR_SCRIPT_PATH` no padrão. Use `COLETOR_SCRIPT_PATH` só se mover o script para outro
> lugar. Após o deploy, crie a(s) conta(s) `coletor` (vinculadas à empresa) pela tela de
> **Usuários**. Ver [auth-usuarios.md](../context/auth-usuarios.md).

### frontend (Application — Dockerfile, base dir `client/`)

| Variável | Exemplo / valor | Observação |
|---|---|---|
| `BACKEND_URL` | `http://<host interno do backend>:3032` | para onde o nginx encaminha `/api` (sem barra final) |

> `VITE_API_BASE_URL` continua `/api` (já embutido no build). Não aponte o Vite para o backend:
> quem resolve o `/api` em produção é o nginx do front via `BACKEND_URL`.

### mysql (Database)

Defina `MYSQL_DATABASE=infrahub`, usuário e senha. Confira que o **database existe** — o runner
de migração cria **tabelas**, não o schema.

## 3. Volume persistente dos uploads (OBRIGATÓRIO)

Os anexos e fotos de perfil ficam em `/app/uploads` no backend. Sem volume, **somem a cada
redeploy**. No recurso **backend → Storages**, adicione um *Persistent Storage* montado em:

```
/app/uploads
```

## 4. Migração do banco

O `Dockerfile` do backend roda `node db/migrate.js && node db/seed.js --se-vazio && node server.js`
no start — aplica as migrações pendentes (forward-only, idempotente) e roda o **seed guardado**
antes de subir a API.

- **Primeiro deploy:** o seed roda **sozinho** e cria admin/empresa **apenas se o banco estiver
  vazio** (sem usuários nem empresas). Login/senha default: `admin` / `admin123` — **troque
  depois**. Não é preciso rodar nada na mão.
- **Redeploys:** o seed é **ignorado** quando o banco já tem dados (não recria defaults apagados
  nem ressuscita o admin/senha padrão). Quer forçar/refazer a carga em dev? Use `npm run db:seed`
  (sem o `--se-vazio`).
- **Múltiplas réplicas:** mova o `node db/migrate.js && node db/seed.js --se-vazio` para um
  *Pre-deployment Command* do Coolify e deixe o `CMD` só com `node server.js`, evitando corrida
  entre réplicas.

## 5. Domínios e HTTPS

- **frontend:** defina o domínio público (ex.: `app.seudominio.com`). O Coolify emite TLS
  (Let's Encrypt) automaticamente. Esse domínio é o que vai em `CORS_ORIGIN` do backend.
- **backend:** normalmente **sem** domínio público (acessado só pelo front via rede interna).
  Só publique se for usar o `BACKEND_URL` apontando para o domínio público.

## 5b. App de cadastro mobile (PWA instalável + APK via TWA)

A rota `/cadastro-mobile` é um PWA instalável, empacotável como **APK fora de loja** via TWA
(Bubblewrap/PWABuilder). Roda na **mesma origem** do front (nginx serve o app e faz proxy de
`/api`), então o cookie `SameSite=Strict` trafega e **nenhuma credencial vai no APK**.

**Pré-requisitos de deploy:**
- **HTTPS obrigatório** (o Coolify já provê via Let's Encrypt). SW e TWA exigem origem segura.
- **`CORS_ORIGIN` do backend DEVE conter a origem pública EXATA do app** (esquema+host, sem
  barra final), ex.: `CORS_ORIGIN=https://app.seudominio.com`. **Sem isso, `origemConfiavel`
  barra TODA mutação do cadastrador (e o login) com 403 "Origem não permitida"**, mesmo com
  cookie válido. A fila offline trata 403 como *bloqueio* (não como sessão), então não entra em
  loop de re-login — mas os cadastros não sobem até a origem ser liberada. Use o **mesmo
  hostname** do app web; se o cadastro usar subdomínio próprio, inclua-o também.
- O `nginx.conf.template` já serve `/sw.js`, `/registerSW.js`, `/manifest.webmanifest` (no-cache)
  e `/.well-known/assetlinks.json` (`application/json`, match exato) **antes** do fallback SPA;
  `/assets/` com cache imutável. O `Dockerfile` faz `COPY .well-known/assetlinks.json` para a
  raiz servida (o Vite não copia dot-dirs de `public/` de forma confiável).

**Ícones (passo manual antes do build/empacotamento):** o manifest referencia PNGs
(`pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`, `apple-touch-icon-180x180.png`).
Gere-os a partir de `client/public/icon.svg`:
```
cd client && npx @vite-pwa/assets-generator --preset minimal-2023 public/icon.svg
```
(isso também substitui o `favicon.ico` atual, que é um PNG grande renomeado). Sem os PNGs o
PWA ainda instala (via `icon.svg`), mas o Bubblewrap costuma exigir raster para gerar o APK.

**Procedimento do APK (TWA, fora do repo):**
1. `bubblewrap init --manifest=https://app.seudominio.com/manifest.webmanifest`
   (`applicationId` = `br.com.evolutivasistemas.infrahub.cadastro`, igual ao `package_name` do
   `assetlinks.json`).
2. `bubblewrap build` → **guarde o keystore** (a perda impede atualizar o APK).
3. `keytool -printcert -jarfile app-release-signed.apk` → copie o **SHA-256** e cole em
   `client/.well-known/assetlinks.json` (substituindo o placeholder), depois **redeploy do front**.
4. `adb install app-release-signed.apk` e valide em Android real.

**Criar usuário(s) `cadastrador`:** passo manual/seed (a UI de Usuários ainda só oferece
`adm`/`usuario`). A migração `0004` adiciona o valor ao ENUM — aplique-a antes (roda no
`db:migrate` do start). Não embarque credencial `adm` no APK.

## 6. Checklist de validação pós-deploy

- [ ] `https://app.seudominio.com` carrega o login.
- [ ] Login funciona e o cookie `token` aparece como **HttpOnly + Secure + SameSite=Strict**.
- [ ] Refresh numa rota profunda (ex.: `/inventario`) não dá 404 (fallback SPA ok).
- [ ] Upload e download de anexo funcionam; após um **redeploy**, o anexo continua lá (volume ok).
- [ ] Logout limpa o cookie e volta para o login.
- [ ] `GET /api/health` (ou o `/health` interno) responde `{ status: "ok" }`.
- [ ] (mobile) `https://app.seudominio.com/cadastro-mobile` instala como PWA; abre offline.
- [ ] (mobile) a origem do app está em `CORS_ORIGIN`: login e `POST /item` do cadastrador **não** dão 403.
- [ ] (mobile) `GET /.well-known/assetlinks.json` responde JSON com o SHA-256 real; o APK do TWA abre **sem barra de URL**.

## Validação local (antes do Coolify)

A raiz tem um `docker-compose.yml` com a mesma topologia (mysql + backend + frontend):

```
docker compose up --build
# O backend roda migrate + seed guardado no start: num banco zerado o
# admin/empresa são criados sozinhos (login/senha default: admin / admin123).
# Front: http://localhost:8080
```
