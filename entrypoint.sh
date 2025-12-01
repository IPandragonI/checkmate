#!/bin/sh
set -e

DB_HOST="${DB_HOST:-checkmate_db}"
DB_PORT="${DB_PORT:-5432}"
TIMEOUT="${DB_WAIT_TIMEOUT:-60}"
WAITED=0

echo "Waiting for database ${DB_HOST}:${DB_PORT}..."

until nc -z "$DB_HOST" "$DB_PORT"; do
  if [ "$WAITED" -ge "$TIMEOUT" ]; then
    echo "Timed out waiting for database at ${DB_HOST}:${DB_PORT}"
    exit 1
  fi
  WAITED=$((WAITED+1))
  sleep 1
done

echo "Database is reachable. Running prisma migrate..."
npx prisma migrate deploy

echo "Starting application..."

exec "$@"