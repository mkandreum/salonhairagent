#!/bin/bash
set -e

PGDATA=/var/lib/postgresql/data
PGPORT=5432
PGUSER=salonapp
PGPASS="${DB_PASSWORD:-salonapp_secret_change_me}"
PGDB=salonhair

echo "==> Iniciando PostgreSQL..."

# Init PostgreSQL data directory if empty
if [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo "==> Inicializando directorio de datos de PostgreSQL..."
    su postgres -c "initdb -D $PGDATA --encoding=UTF8 --locale=C"

    # Allow local connections
    echo "host all all 127.0.0.1/32 md5" >> $PGDATA/pg_hba.conf
    echo "local all all trust" >> $PGDATA/pg_hba.conf
fi

# Start PostgreSQL temporarily to create user/db
su postgres -c "pg_ctl -D $PGDATA -l /var/log/pg_init.log start -w"

# Create user and database if they don't exist
su postgres -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='$PGUSER'\" | grep -q 1 || psql -c \"CREATE USER $PGUSER WITH PASSWORD '$PGPASS';\""
su postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='$PGDB'\" | grep -q 1 || psql -c \"CREATE DATABASE $PGDB OWNER $PGUSER;\""

# Stop temporary PostgreSQL (supervisor will restart it)
su postgres -c "pg_ctl -D $PGDATA stop -m fast"

echo "==> PostgreSQL inicializado correctamente."

# Set DATABASE_URL for backend (passed through supervisor env)
export DATABASE_URL="postgresql://$PGUSER:$PGPASS@127.0.0.1:$PGPORT/$PGDB"

# Start all services via supervisor
exec /usr/bin/supervisord -c /etc/supervisord.conf
