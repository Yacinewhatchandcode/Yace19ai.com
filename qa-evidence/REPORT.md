# Yace19ai local QA

**Local URL:** http://127.0.0.1:4181 — detached loopback server, port 4181 only.
**Status:** local runtime ready; missing/defective original content remains blocked.
**Production:** not-deployed (GitHub Pages prepared). No push, deployment or DNS edit.

## Results

| Area | Pass | Fail / blocked |
|---|---:|---:|
| Route/viewport/locale checks | 50 | 0 |
| In-app link targets | 23 | 0 |
| Interaction/playback/range checks | 37 | 0 |
| Catalog asset URLs | 120 | 0 |
| Original media content | 11 contextual archives | 4 defective originals |
| Missing children's games | 0 recovered | 9 source implementations absent |

All 20 routes were checked at 390 and 1440; the five app routes were checked
in EN and FR (50 cases). Four Pages slash-route aliases were also exercised.
No final page/console errors, failed requests, empty bodies, broken images,
horizontal document overflow or external network requests. Build/typecheck,
changed-active-source ESLint and patch whitespace checks passed.
Native browser video playback advanced for all 14 decodable recordings.
Four defective content items remain defective even though three can decode.

## Sovereign Gold

The exact shared tokens are imported once per entry point. A fixed 64px glass
bar, bilingual nav, illustrative CSS 3D orb hero, rAF ±8° tilt cards, MP4 reel
and one-line footer replace the coming-soon screen. All routes have an
above-fold visual. Gold controls and archival canvas filtering remove the
conflicting live UI palette. Existing footage is not recolored or presented
as current factual evidence.

Rendered wording fell from **3820 to 1561 tokens
(59.14% reduction)** across unique route/locale cases.
Every route is shorter. Baseline is the repaired local version before the
gold redesign, not the tiny initial coming-soon placeholder. Required game
control labels are retained, so individual tiny archive routes need not lose
half their labels. Historical project descriptions remain available in closed
English-labelled details. Reduced motion stops ornamental animation,
particle backgrounds and reel autoplay; user-controlled gameplay remains
interactive. Videos autoplay only muted/in viewport and use posters.

## Repairs and source limits

Restored home/projects/games/vision/media navigation; corrected three missing
project images; removed unverified live metrics, pretend microphone/search,
payment acquisition and remote embeds from reachable app UI. Local kids hub
links now resolve to its own archive pages, not a commercial portal. Two local
games have accessible touch controls. Fixed the platformer's input-edge bug
that cleared pause/mute before gameplay could consume them, in both web/native
mirrors. Removed its unimplemented Options menu and made menu/back navigation
touch-accessible. The compiled command matrix's execution shortcuts are blocked.

The nine children's pages contained only a fake loader, not game code.
They now say unavailable. Full content acceptance requires their original
implementations; no replacement product or recovered source was fabricated.

All 15 media entries have ffprobe/volumedetect/YMAX evidence where decodable,
contact sheets, captions and browser checks. Root `demo.mp4` is exposed as an
identical public copy; it is an illustrative title card, not an EU compliance
demo. Seven WebM captures are silent repository/README recordings, not working
product demonstrations. The eighth (`video-Prime.AI.webm`) records a GitHub
404/sign-in page. `agent-coder.mp4` is empty. Converse and Factory MP4s are
single-frame 0.04s “Generating recording...” placeholders. The exact 2fps
filter yields zero frames for those two: ratio is null, not a fabricated 0%.
Native-frame fallback ratios are separately labelled. Two MP4s have audible
tracks; twelve files have no audio stream. No claim of narration is made for
silent recordings. See `media.json` and inspected `contact-sheets/`.

## Advisory

Local fleet mission `3c8ce43b-58ae-43bd-b8c1-40a1f2a3e374` completed.
`/execute` was never called. Advisory is not acceptance evidence. Its valid
honesty/navigation recommendations were applied; unrelated Next.js, 4180 and
HashRouter claims were rejected as cross-task contamination.

## Production diagnosis and exact owner action

DNS resolves through GoDaddy (`ns71/ns72.domaincontrol.com`). Apex still points
to stale Netlify A `75.2.60.5`; www still points to
`thriving-lokum-6f2bbb.netlify.app`. The old destination returns site-not-found,
and both custom domains currently fail certificate hostname verification.
Deletion of a Netlify site cannot be inferred. **Netlify is not the intended
provider and is not a restoration blocker.**

Read-only GitHub Pages API reports workflow build type, `cname=null` and default
URL `https://yacinewhatchandcode.github.io/Yace19ai.com/`.
Owner must approve/publish the manual Pages workflow, set Pages custom domain
`yace19ai.com`, replace GoDaddy apex with A records `185.199.108.153`,
`185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and set www CNAME
`yacinewhatchandcode.github.io`; then verify certificate provisioning/HTTPS.
See `DEPLOY.md`. CNAME and physical SPA route entries are built locally.
Push-triggered deployment was removed; only workflow_dispatch remains.

## Evidence and operational notes

`catalog.json` uses the fleet /urls schema and lists every page URL, slash
alias, media entry, public media/image asset, QA case and blocker.
Source-only images are listed without misleading public URLs.
`routes.json` also inventories dormant sources, external call literals and
native assets; no dormant integration is claimed live.
Screenshots/captions: `final/browser.json`, `final/screenshots/`, four inspected
route sheets. Interactions: `interactions.json`.
No Chronicles route/PDF was added or sibling worktree modified.

Existing sibling Node modules lacked required libraries, so npm ci restored
only the existing lockfile after a build failure. The shared disk briefly
dipped below the 3 GiB guard while other tasks were writing; the coordinator
freed disposable runtimes. Final disk:

```text
Filesystem      Size    Used   Avail Capacity iused ifree %iused  Mounted on
/dev/disk3s5   926Gi   887Gi   5.2Gi   100%     14M   54M   21%   /System/Volumes/Data
```
