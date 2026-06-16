FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3003

# Aplica migrations pendentes (forward-only, não-destrutivo) antes de subir o app.
# O seed NÃO roda aqui (é dev/uma-vez). Para múltiplas réplicas, mova o migrate
# para um "release command" do Coolify em vez do start, evitando corrida.
CMD ["sh", "-c", "node db/migrate.js && node server.js"]