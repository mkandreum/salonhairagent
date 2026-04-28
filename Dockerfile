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

# Verificar que el export se generó
RUN echo "Verificando carpeta out..." && ls -la out/

# ============================================================
# Stage 2: Runtime - igual que VoltBodyPowered
# ============================================================
FROM node:20-alpine

WORKDIR /app

# curl para healthcheck
RUN apk add --no-cache curl

# Instalar dependencias de producción del backend
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar backend
COPY server.cjs ./

# Copiar frontend compilado a /app/public (igual que VoltBodyPowered: dist -> public)
COPY --from=frontend-builder /frontend/out ./public

# Verificar que el frontend está en public
RUN echo "Verificando public..." && ls -la public/

EXPOSE 3000

CMD ["node", "server.cjs"]
