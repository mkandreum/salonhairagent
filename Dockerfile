# ============================================================
# Single-container image: PostgreSQL + Node backend + Next.js frontend
# Exposes only port 80 (nginx reverse proxy inside)
# ============================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend
COPY salon-dashboard-frontend/package*.json ./
RUN npm ci
COPY salon-dashboard-frontend/ ./
# Backend runs on 3001 inside the container
ENV NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ============================================================
FROM node:20-alpine

# Install PostgreSQL, nginx and supervisor to manage all processes
RUN apk add --no-cache postgresql postgresql-contrib nginx supervisor bash

# ---- Backend ----
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server.cjs ./

# ---- Frontend (standalone Next.js build) ----
COPY --from=frontend-builder /frontend/.next/standalone /frontend/
COPY --from=frontend-builder /frontend/.next/static /frontend/.next/static
COPY --from=frontend-builder /frontend/public /frontend/public

# ---- nginx config ----
COPY nginx.conf /etc/nginx/nginx.conf

# ---- supervisor config ----
COPY supervisord.conf /etc/supervisord.conf

# ---- startup script ----
COPY start.sh /start.sh
RUN chmod +x /start.sh

# PostgreSQL data directory
RUN mkdir -p /var/lib/postgresql/data && chown postgres:postgres /var/lib/postgresql/data

EXPOSE 80

CMD ["/start.sh"]
