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

Julia is labeled as a scripted demo with browser speech, not a verified
retrieval, LLM or server voice service. The session issuer only authorizes a
timed demo window. Production availability must be checked separately before
release; static GitHub Pages hosting cannot execute the issuer API itself.

The shared constellation identity uses `public/prime-trinity.svg` and YACE's
blue accent `#1461cd`; PRIME uses `#c93347` and AMLAZR uses `#53627d`.
Cross-site navigation preserves each site's distinct design and internal routes.

## Pages release and rollback

PRs run the `Validate and release static Pages` workflow against their exact
head SHA. It builds and browser-tests the static output, then records a
SHA-256 file inventory bound to the candidate commit. Julia tests are mocked
and do not establish availability of a retrieval or voice service.
The five-minute Julia starter trial is disabled by default and explicitly
disabled in the Pages build; the site shows a static portrait and an explicit
not-available disclosure instead.

For a release, dispatch `deploy.yml` from `main` with `candidate_sha` equal to
the exact commit that triggered the run. First use `publish=false` to build and
validate that source and produce its immutable `candidate-<SHA>` artifact.
Record the successful run ID and attempt, artifact ID and archive digest, and
canonical tree digest from the validation run summary. A separate
`publish=true` dispatch must provide those exact values; it downloads and
verifies that artifact and uploads only its `dist` directory. It never rebuilds
the site in the publishing job. No API service is deployed. If `main` advances
between validation and publishing, validate the new head again.

The `github-pages` environment must have at least one required user/team
reviewer and exactly one custom deployment branch policy (`main`). GitHub
requires one approval from the configured reviewer list, not all listed
reviewers. The workflow preserves the environment's current
`prevent_self_review` and `can_admins_bypass` values; it does not claim those
settings provide independent review. Configure release authorization and
approvals in accordance with the active repository policy.

An explicitly selected `single-owner/v1` mode is an opt-in exception for this
personal repository only. It requires the repository variable
`STATIC_RELEASE_APPROVAL_POLICY=single-owner/v1`, the owner as both triggering
and rerunning actor, a `User` repository, an exact per-release consent value
`single-owner/v1:<repository>:<sourceSHA>:<treeSHA256>:<validationRunID>:<artifactID>`,
and the same main-only environment branch restriction. The final deploy job
still uses the `github-pages` environment. Do not select the mode or add its
opt-in variable without the owner's explicit policy decision. Before
publishing, the workflow captures the prior successful deployment ID and SHA
as rollback evidence. Rollback itself is not exposed by this workflow; do not
rerun a legacy workflow or dispatch a different source as a rollback shortcut.
Do not change DNS.

The documented pre-constellation rollback reference is
`10b39a606fc43e4929595188ab3cb9d06b0e52cc`, successful deployment run
`37129793980`. This reference is evidence only; restoring it requires a
separately authorized rollback procedure that preserves the exact deployed-SHA
binding.

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
