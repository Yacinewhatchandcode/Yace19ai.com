# YACE19AI

YACE19AI is the research and imagination layer of the PRIME-AI Sovereign
Constellation. This Vite/React site focuses on world models, scientific AI,
open models and clearly labeled research artifacts.

## Run locally

Requires Node.js 20.19+ (or 22.12+).

```sh
npm ci
npm run dev
```

The development server binds `0.0.0.0:5175`; on the project LAN open
**http://192.168.1.80:5175**. For mobile microphone access, use the
self-signed HTTPS dev option with `npm run dev:https` and accept the local
certificate warning on the test device.

To build and run the browser coverage:

```sh
npm run build
npm run dev
# in another terminal
npm run test:e2e
```

The legacy static QA server remains available with `python3 qa/serve.py` at
**http://127.0.0.1:4181** for archive/media checks.
In the QA session a detached server is already running on this port; do not
start a second listener until the owner stops that process.

## Routes and content

| Route | Content |
|---|---|
| `/` | Research home, mission, lab systems, domains and evidence TODOs |
| `/fleet` | Selected public repository index |
| `/philosophy` | Research approach |
| `/games` | Local browser experiments archive |
| `/media` | Historical media archive with QA context |

All five React routes are documented in `docs/constellation-audit.md`; the
fifteen standalone archive paths remain inventoried in `qa/routes.json`.
Publication, model and benchmark claims remain TODO until verifiable evidence
is available.

The Julia portal and constellation accordion load the shared runtime from
`VITE_JULIA_EMBED_URL` (local default
`http://192.168.1.80:5176/julia/embed.js`, production
`https://prime-ai.fr/julia/embed.js`) on demand. The runtime issues the signed
five-minute window through `VITE_JULIA_WINDOW_ENDPOINT` (derived from the
embed origin by default); the token stays in runtime memory and is handed
between allow-listed sites with exact-origin `postMessage`. If the runtime
cannot be reached, the portrait and local constellation links remain usable.
Historical footage and project links are not proof of current service
availability.

## QA

Uses installed Playwright/Chromium, ffmpeg and ffprobe. No browser downloads.

```sh
python3 qa/inventory.py
python3 qa/media.py
npm run build
node qa/browser.cjs final
node qa/interactions.cjs
```

`qa/media.py` records probe, volume and 2fps YMAX measurements and generates
contact sheets/posters. Its visual annotations reflect the contact sheets
inspected during this QA; review them again if replacing any recordings.
The optional route-sheet helper uses an already installed Pillow package.
The authenticated local-fleet advisory helper never calls `/execute`.

See `qa-evidence/REPORT.md`, `report.json`, `catalog.json` and `word-counts.json`.
Screenshots cover 390px and 1440px, EN/FR application pages and English archives.
Browser rendering uses the existing Chromium SwiftShader WebGL renderer;
the baseline's default renderer could not create the archived scene's context.

## Publication is human-gated

See **[DEPLOY.md](DEPLOY.md)** for the exact GitHub Pages/GoDaddy handoff.
The Pages workflow only supports manual dispatch. A push does **not** deploy.
No push, deployment or DNS change was performed by local QA.
