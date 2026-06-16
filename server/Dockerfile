# Backend InfraHub — Express + Sequelize + MySQL
# Contexto de build: a pasta server/ (tem o próprio package.json).
#
# Base glibc (Debian slim) de propósito: o bcrypt traz binário pré-compilado
# para linux-glibc, então não precisa de python/make/g++ (como precisaria no Alpine/musl).
FROM node:20-bookworm-slim

ENV NODE_ENV=production
# Porta padrão da imagem; o Coolify pode sobrescrever via env PORT.
ENV PORT=3032

WORKDIR /app

# Instala só dependências de produção. Camada separada para aproveitar cache.
COPY package*.json ./
RUN npm ci --omit=dev

# Código do backend.
COPY . .

# Anexos e fotos de perfil. Em produção MONTE um volume persistente em /app/uploads
# (Coolify > Storages). Sem isso, os arquivos somem a cada redeploy.
RUN mkdir -p /app/uploads

EXPOSE 3032

# 1) migrate forward-only (idempotente, não-destrutivo);
# 2) seed guardado (--se-vazio): só semeia se o banco não tem usuários nem
#    empresas — roda no 1º deploy e é ignorado nos redeploys seguintes;
# 3) sobe a API.
# Em múltiplas réplicas, prefira rodar o "migrate + seed" num release/pre-deploy
# command do Coolify e deixar o CMD apenas com "node server.js", evitando corrida.
CMD ["sh", "-c", "node db/migrate.js && node db/seed.js --se-vazio && node server.js"]
