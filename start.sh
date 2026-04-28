#!/bin/bash
set -e

PGDATA=/var/lib/postgresql/data
PGPORT=5432
PGUSER=salonapp
PGPASS="${DB_PASSWORD:-salonapp_change_me}"
PGDB=salonhair

echo "==> [1/4] Preparando directorio de datos PostgreSQL..."
mkdir -p "$PGDATA"
chown -R postgres:postgres "$PGDATA"
chmod 700 "$PGDATA"

# Inicializar solo si está vacío
if [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo "==> [2/4] Primera ejecución: inicializando base de datos..."
    su postgres -c "initdb -D $PGDATA --encoding=UTF8 --locale=C --username=postgres"

    # Permitir conexiones locales por contraseña
    echo "host all all 127.0.0.1/32 md5" >> "$PGDATA/pg_hba.conf"
    echo "local all postgres trust" >> "$PGDATA/pg_hba.conf"
    echo "local all all md5" >> "$PGDATA/pg_hba.conf"
else
    echo "==> [2/4] Base de datos existente detectada, saltando inicialización."
fi

# Arrancar PostgreSQL temporalmente para crear usuario/BD
echo "==> [3/4] Arrancando PostgreSQL para configuración inicial..."
su postgres -c "pg_ctl -D $PGDATA -l /tmp/pg_setup.log start -w -t 30"

# Crear usuario si no existe
su postgres -c "psql -c \"DO \\\$\\\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='$PGUSER') THEN CREATE USER $PGUSER WITH PASSWORD '$PGPASS'; END IF; END \\\$\\\$;\""

# Crear base de datos si no existe
su postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='$PGDB'\" | grep -q 1 || psql -c \"CREATE DATABASE $PGDB OWNER $PGUSER;\""

# Detener PostgreSQL temporal (supervisor lo arrancará definitivamente)
su postgres -c "pg_ctl -D $PGDATA stop -m fast -w"

echo "==> [4/4] Iniciando todos los servicios (supervisor)..."

# Pasar DATABASE_URL al entorno para que supervisor la use
export DATABASE_URL="postgresql://$PGUSER:$PGPASS@127.0.0.1:$PGPORT/$PGDB"

exec /usr/bin/supervisord -c /etc/supervisord.conf
