# NVIDIA NIM Free-Tier Setup for Prime AI

## 1. Get Your Free NVIDIA API Key

1. Go to [build.nvidia.com](https://build.nvidia.com)
2. Sign up for a free developer account
3. Navigate to **API Catalog** → search for `meta/llama-3.1-70b-instruct`
4. Click **Get API Key** → Copy the key (format: `nvapi-...`)

## 2. Free-Tier Quota

- **1,000 free API credits** on account creation
- Each credit = ~1 API call
- Models available for free:
  - `meta/llama-3.1-70b-instruct` (text generation — our primary)
  - `meta/llama-3.1-405b-instruct` (larger model)
  - `mistralai/mixtral-8x7b-instruct-v0.1`
  - `nvidia/nemotron-4-340b-instruct`
  - NVIDIA Riva Parakeet NIM (ASR/TTS)
  - Various vision/multimodal models

## 3. Configure in Netlify

### Option A: Netlify Dashboard
1. Go to your Netlify dashboard → Site settings → Environment variables
2. Add: `NVIDIA_API_KEY` = `nvapi-YOUR_KEY_HERE`

### Option B: Netlify CLI
```bash
netlify env:set NVIDIA_API_KEY "nvapi-YOUR_KEY_HERE"
```

### Option C: Local Development (.env.local)
Add to your `.env.local` file:
```
NVIDIA_API_KEY=nvapi-YOUR_KEY_HERE
```

## 4. Endpoints Created

| Endpoint | Function | Description |
|----------|----------|-------------|
| `POST /api/asirem/speak` | `ai-chat.ts` | Bilingual (EN/FR) AI chat using Llama 3.1 70B |
| `GET /api/status` | `status.ts` | Backend health check & agent status |
| `POST /api/codex/generate` | `codex-generate.ts` | Self-coding: generates HTML/Python/JSON with preview URLs |

## 5. API Usage Example

```bash
curl -X POST https://prime-ai.fr/api/asirem/speak \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the status of my agent fleet?", "lang": "en"}'
```

French:
```bash
curl -X POST https://prime-ai.fr/api/asirem/speak \
  -H "Content-Type: application/json" \
  -d '{"message": "Quel est le statut de ma flotte?", "lang": "fr"}'
```

## 6. Architecture

```
Browser (Voice/Text) 
  → VoiceOrbInterface.tsx (bilingual EN/FR)
  → /api/asirem/speak (Netlify Edge Function)
  → NVIDIA NIM API (build.nvidia.com)
  → meta/llama-3.1-70b-instruct
  → Response → Browser TTS (FR/EN voice)
```

## 7. Fallback Behavior

When no NVIDIA API key is configured or the API is unreachable:
- The frontend falls back to `generateAIResponse()` — a local static response generator
- TTS still works via browser's native `SpeechSynthesis` API
- The UI shows "STANDBY" instead of "Backend Live"
