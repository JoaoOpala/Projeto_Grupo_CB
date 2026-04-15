#!/bin/sh
echo "==> Rodando migrations..."
alembic upgrade head
echo "==> Rodando seed..."
python seed.py
echo "==> Iniciando servidor..."
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
