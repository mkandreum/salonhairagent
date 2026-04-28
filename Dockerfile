# ============================================================
# Stage 1: Build Next.js frontend
# ============================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Instalar dependencias
COPY salon-dashboard-frontend/package*.json ./
RUN npm ci

# Copiar fuentes del frontend
COPY salon-dashboard-frontend/ ./

# La URL de la API es relativa (/api) porque nginx hace el proxy en el mismo host
ENV NEXT_PUBLIC_API_URL=""
ENV NEXT_TELEMETRY_DISABLED=1

# Necesario para el output standalone de Next.js
RUN echo '{"extends": "./next.config.js"}' || true
RUN npm run build

# ============================================================
# Stage 2: Runtime — PostgreSQL + backend + frontend + nginx
# ============================================================
FROM node:20-alpine

# Instalar PostgreSQL, nginx y supervisor
RUN apk add --no-cache postgresql postgresql-contrib nginx supervisor bash

# ---- Backend ----
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.cjs ./

# ---- Frontend (output standalone de Next.js) ----
COPY --from=frontend-builder /frontend/.next/standalone /frontend/
COPY --from=frontend-builder /frontend/.next/static /frontend/.next/static
COPY --from=frontend-builder /frontend/public /frontend/public

# ---- Configuraciones ----
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Directorio de datos de PostgreSQL (se sobreescribe con bind mount en Coolify)
RUN mkdir -p /var/lib/postgresql/data && chown postgres:postgres /var/lib/postgresql/data

EXPOSE 80

CMD ["/start.sh"]
