#!/usr/bin/env sh
set -eu

SQL_PATH="$(cd "$(dirname "$0")/.." && pwd)/prisma/sql/init.sql"

mysql -u root -proot < "$SQL_PATH"

echo "Initialized MySQL schema for corrad_xpress"
