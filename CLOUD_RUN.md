# Deploy to Google Cloud Run (test)

This repo is a **single-container** app:
- Next.js UI + Node API (public) on `$PORT`
- Python FastAPI (internal) on `127.0.0.1:8000`

## 1) Prereqs

- Install Google Cloud SDK (`gcloud`)
- `gcloud auth login`
- `gcloud config set project <YOUR_PROJECT_ID>`

## 2) Build & deploy (from source)

From repo root:

```bash
gcloud run deploy interview-space \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
```

When prompted, set environment variables:
- `GROQ_API_KEY` (required)
- Optional: `WHISPER_MODEL=base` (faster CPU)

## 3) Build & deploy (Docker image)

```bash
gcloud builds submit --tag gcr.io/<YOUR_PROJECT_ID>/interview-space
gcloud run deploy interview-space \
  --image gcr.io/<YOUR_PROJECT_ID>/interview-space \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GROQ_API_KEY=***REDACTED***
```

Prefer setting secrets via Secret Manager instead of inline env vars for anything beyond testing.

