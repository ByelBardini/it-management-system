# Frontend InfraHub — build Vite (estático) servido por nginx, que também faz
# reverse-proxy de /api para o backend (mesma origem → sem CORS, cookie httpOnly OK).
# Contexto de build: a pasta client/.

# ---- Stage 1: build do bundle ----
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# O Vite injeta VITE_API_BASE_URL em TEMPO DE BUILD. A API é sempre acessada via
# /api (o nginx faz o proxy), então fixamos aqui — não dependemos do .env, que é
# (corretamente) excluído do contexto pelo .dockerignore e não existe no Coolify.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
# Gera /app/dist (outDir padrão do Vite).
RUN npm run build

# ---- Stage 2: runtime (nginx) ----
FROM nginx:1.27-alpine

# Endereço interno do backend; sobrescreva no deploy (Coolify). Default serve ao
# docker-compose local (serviço "backend"). É resolvido no template via envsubst.
ENV BACKEND_URL=http://backend:3032
# Substitui SÓ BACKEND_URL no template (não toca em $host, $uri, etc. do nginx).
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL

# O entrypoint da imagem nginx roda envsubst em /etc/nginx/templates/*.template
# e escreve o resultado em /etc/nginx/conf.d/ antes de subir o servidor.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
