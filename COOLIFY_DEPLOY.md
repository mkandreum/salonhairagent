# Despliegue en Coolify — Guía Rápida

## Arquitectura
Un solo contenedor con todo dentro:
- **PostgreSQL** (puerto interno 5432)
- **Node.js backend** (puerto interno 3001)
- **Next.js frontend** (puerto interno 3000)
- **nginx** como proxy inverso (puerto 80, el único expuesto)

Los datos de PostgreSQL persisten en `./pgdata` (bind mount relativo al directorio de la app en Coolify).

---

## Pasos en Coolify

### 1. Crear el servicio
- **Source:** GitHub → selecciona `mkandreum/salonhairagent`
- **Branch:** `master`
- **Build Pack:** `Dockerfile`
- **Puerto expuesto:** `80`

### 2. ⚠️ CRÍTICO — Activar "Preserve Repository During Deployment"
En **General → Settings** activa la opción:
> ✅ **Preserve Repository During Deployment**

Sin esto, Coolify borra el directorio en cada deploy y los datos de PostgreSQL se pierden.

### 3. Variables de entorno
En **Environment Variables** añade SOLO estas dos:

| Variable | Valor | Descripción |
|---|---|---|
| `JWT_SECRET` | `<clave aleatoria>` | Genera con: `openssl rand -hex 32` |
| `DB_PASSWORD` | `<password segura>` | Cualquier string, es interna |

### 4. Puerto
- **Published Port:** `80` → `80` (o el que Coolify asigne automáticamente)

### 5. Deploy
Haz clic en **Deploy**. El primer arranque tarda ~60-90 segundos porque:
1. Compila el frontend (Next.js build)
2. Inicializa PostgreSQL
3. Crea usuario y base de datos
4. Arranca todos los servicios

### 6. Crear el primer usuario
Una vez desplegado, accede a la URL y usa el formulario de **registro** para crear tu cuenta.

---

## Verificar que funciona
```
https://tu-dominio.com/health  →  {"status":"healthy","service":"salon-backend"}
```

---

## Backup de datos
Los datos están en `/data/coolify/applications/<APP_ID>/pgdata/` en el servidor.
Para hacer backup:
```bash
docker run --rm \
  -v <APP_ID>_pgdata:/volume \
  -v /tmp:/backup \
  busybox tar czf /backup/salon_backup.tar.gz -C /volume .
```
