# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de workspace (raiz)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json nx.json ./

# Copiar backend com seus arquivos
COPY apps/backend apps/backend

# Copiar apenas o necessário de outros apps (para dependências)
COPY apps/backend/package.json /app/apps/backend/package.json

# Instalar dependências do workspace inteiro
RUN pnpm install --frozen-lockfile

# Build do backend
RUN npx nx build backend --configuration=production

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copiar apenas os arquivos compilados e necessários do builder
COPY --from=builder /app/apps/backend/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules

# Copiar .env.docker para o container
COPY .env.docker /app/.env.docker

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "dist/main.js"]
