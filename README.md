# Yace19ai.com

Yacine Benhamou's React/TypeScript portfolio, prepared for GitHub Pages.
The local version uses the shared **Sovereign Gold 3D** visual system:
black/gold tokens, accessible EN/FR navigation, illustrative CSS 3D orbs,
pointer-tilt cards and a muted, viewport-aware MP4 reel.

## Run locally

Requires Node.js 20.19+ (or 22.12+) and Python 3.

```sh
npm ci
npm run build
python3 qa/serve.py
```

Open **http://127.0.0.1:4181**. The server binds loopback only and implements
byte ranges for video seeking. Build output is ignored by Git.
In the QA session a detached server is already running on this port; do not
start a second listener until the owner stops that process.

## Routes and content

| Route | Content |
|---|---|
| `/` | Profile and visual introduction |
| `/fleet` | 21 historical project entries; English descriptions explicitly marked |
| `/games` | Local browser games and archive links |
| `/philosophy` | EN/FR vision |
| `/media` | All included recordings and measured quality indicators |

Standalone archive pages and native `www` mirrors are inventoried in
`qa/routes.json`. The two playable canvas games have touch controls.
The 3D command scene is illustrative; its archived port-8000 execution
shortcut is blocked. The nine children's game implementations are absent,
and the pages say so instead of pretending to load.

No microphone capture, real-time search, live fleet metrics, payments,
remote analytics or external fonts are enabled. Historical footage and
project descriptions are not proof of current service availability.
Defective original recordings remain identified; they have not been replaced
by invented footage.

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
