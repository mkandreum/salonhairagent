# ============================================================
# Stage 1: Build Next.js frontend (standalone)
# ============================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY salon-dashboard-frontend/package*.json ./
RUN npm ci

COPY salon-dashboard-frontend/ ./

# En produccion nginx hace el proxy, no necesitamos URL publica
ENV NEXT_PUBLIC_API_URL=""
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Verificar que el standalone se genero correctamente
RUN ls -la .next/standalone/ && echo "Standalone build OK"

# ============================================================
# Stage 2: Runtime
# ============================================================
FROM node:20-alpine

RUN apk add --no-cache postgresql postgresql-contrib nginx supervisor bash

# ---- Backend ----
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.cjs ./

# ---- Frontend standalone ----
COPY --from=frontend-builder /frontend/.next/standalone /frontend/
COPY --from=frontend-builder /frontend/.next/static /frontend/.next/static
COPY --from=frontend-builder /frontend/public /frontend/public

# Verificar que server.js existe en standalone
RUN ls -la /frontend/server.js && echo "Frontend server.js OK"

# ---- Config ----
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf
COPY start.sh /start.sh
RUN chmod +x /start.sh

RUN mkdir -p /var/lib/postgresql/data \
    && chown postgres:postgres /var/lib/postgresql/data \
    && mkdir -p /var/log/nginx

EXPOSE 80

CMD ["/start.sh"]
