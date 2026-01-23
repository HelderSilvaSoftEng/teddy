# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de workspace (raiz)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json nx.json ./

# Copiar frontend com seus arquivos
COPY apps/frontend apps/frontend

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Build do frontend via Nx
RUN npx nx build frontend

# Production stage com Nginx
FROM nginx:alpine

# Copiar arquivo de configuração do Nginx
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos built do frontend
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]
