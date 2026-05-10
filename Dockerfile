FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-venv python3-pip ffmpeg ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install

COPY next.config.js ./
COPY src ./src
COPY public ./public
COPY python_service ./python_service
COPY start.sh ./start.sh

RUN chmod +x /app/start.sh

# PEP 668: avoid installing into system Python; use a venv.
RUN python3 -m venv /opt/venv \
  && /opt/venv/bin/pip install --no-cache-dir --upgrade pip \
  && /opt/venv/bin/pip install --no-cache-dir -r /app/python_service/requirements.txt

RUN npm run build \
  && mkdir -p .next/standalone/.next \
  && cp -r .next/static .next/standalone/.next/static \
  && cp -r public .next/standalone/public

# Cloud Run provides $PORT at runtime; keep a local default in start.sh.
ENV PY_SERVICE_URL=http://127.0.0.1:8000

EXPOSE 7860

CMD ["/app/start.sh"]


