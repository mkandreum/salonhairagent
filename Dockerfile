# ============================================================
# Stage 1: Build Next.js frontend (static export)
# ============================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY salon-dashboard-frontend/package*.json ./
RUN npm ci

COPY salon-dashboard-frontend/ ./

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# next export genera carpeta 'out/' con HTML/CSS/JS puros
RUN npm run build

# Verificar que el export se genero
RUN echo "Verificando carpeta out..." && ls -la out/

# ============================================================
# Stage 2: Runtime - igual que VoltBodyPowered
# ============================================================
FROM node:20-alpine

WORKDIR /app

# curl para healthcheck
RUN apk add --no-cache curl

# Instalar dependencias de produccion del backend
# Usamos npm install (no ci) para evitar errores si el lockfile esta desincronizado
COPY package.json ./
RUN npm install --omit=dev

# Copiar backend
COPY server.cjs ./

# Copiar frontend compilado a /app/public
COPY --from=frontend-builder /frontend/out ./public

# Verificar que el frontend esta en public
RUN echo "Verificando public..." && ls -la public/

EXPOSE 3000

CMD ["node", "server.cjs"]
