#!/bin/bash
set -e

PGDATA=/var/lib/postgresql/data
PGUSER=salonapp
PGPASS="${DB_PASSWORD:-salonapp_change_me}"
PGDB=salonhair
PGSOCKET=/tmp

echo "==> [1/4] Preparando directorio de datos PostgreSQL..."
mkdir -p "$PGDATA"
# Forzar ownership correcto (el bind mount de Coolify lo monta como root)
chown -R postgres:postgres "$PGDATA"
chmod 700 "$PGDATA"

# Inicializar solo si está vacío
if [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo "==> [2/4] Primera ejecución: inicializando base de datos..."
    su -s /bin/bash postgres -c "initdb -D '$PGDATA' --encoding=UTF8 --locale=C --auth-local=trust --auth-host=md5"

    # Configurar pg_hba.conf para conexiones locales
    cat >> "$PGDATA/pg_hba.conf" << 'EOF'
local   all   postgres   trust
local   all   all        trust
host    all   all        127.0.0.1/32   md5
EOF

    # Configurar socket en /tmp
    echo "unix_socket_directories = '/tmp'" >> "$PGDATA/postgresql.conf"
    echo "listen_addresses = '127.0.0.1'" >> "$PGDATA/postgresql.conf"
else
    echo "==> [2/4] Base de datos existente detectada, saltando inicialización."
    # Asegurar que la config de socket esté siempre presente
    grep -q "unix_socket_directories" "$PGDATA/postgresql.conf" || echo "unix_socket_directories = '/tmp'" >> "$PGDATA/postgresql.conf"
    grep -q "listen_addresses" "$PGDATA/postgresql.conf" || echo "listen_addresses = '127.0.0.1'" >> "$PGDATA/postgresql.conf"
fi

echo "==> [3/4] Arrancando PostgreSQL para configuración inicial..."
su -s /bin/bash postgres -c "pg_ctl -D '$PGDATA' -l /tmp/pg_setup.log -o '-k /tmp' start -w -t 60"

if [ $? -ne 0 ]; then
    echo "ERROR: PostgreSQL no pudo arrancar. Log:"
    cat /tmp/pg_setup.log 2>/dev/null || echo "(sin log)"
    exit 1
fi

# Crear usuario si no existe
echo "==> Creando usuario y base de datos si no existen..."
su -s /bin/bash postgres -c "psql -h /tmp -c \"DO \\$\\$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='$PGUSER') THEN CREATE USER \\\"$PGUSER\\\" WITH PASSWORD '$PGPASS'; END IF; END \\$\\$;\""
su -s /bin/bash postgres -c "psql -h /tmp -tc \"SELECT 1 FROM pg_database WHERE datname='$PGDB'\" | grep -q 1 || psql -h /tmp -c \"CREATE DATABASE \\\"$PGDB\\\" OWNER \\\"$PGUSER\\\";\""

# Detener PostgreSQL temporal
su -s /bin/bash postgres -c "pg_ctl -D '$PGDATA' -o '-k /tmp' stop -m fast -w"

echo "==> [4/4] Iniciando todos los servicios via supervisor..."
export DATABASE_URL="postgresql://$PGUSER:$PGPASS@127.0.0.1:5432/$PGDB"
exec /usr/bin/supervisord -c /etc/supervisord.conf
