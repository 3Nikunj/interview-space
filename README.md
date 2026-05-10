---
title: InterviewSpace
sdk: docker
app_port: 7860
---

# Interview Space (Next.js + Node + Python STT/TTS)

This Space runs:
- Next.js UI + Node API on port `7860`
- Python FastAPI on `127.0.0.1:8000` for Whisper STT + Kokoro TTS
- Groq for LLM responses

## Required Space Secret
- `GROQ_API_KEY`

## Optional Space Variables
- `WHISPER_MODEL` (default: `small`, try `base` for faster CPU testing)
- `GROQ_MODEL` (default: `llama-3.3-70b-versatile`)
- `GROQ_TEMPERATURE` (default: `0.6`)
- `KOKORO_VOICE` (default: `af_bella`)
- `KOKORO_SPEED` (default: `1.1`)

