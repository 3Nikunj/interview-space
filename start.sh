#!/usr/bin/env bash
set -euo pipefail

export PY_SERVICE_URL="${PY_SERVICE_URL:-http://127.0.0.1:8000}"
export PORT="${PORT:-7860}"
export HOSTNAME="${HOSTNAME:-0.0.0.0}"

python3 -m uvicorn python_service.main:app --host 127.0.0.1 --port 8000 --log-level info &

cd .next/standalone
exec node server.js
