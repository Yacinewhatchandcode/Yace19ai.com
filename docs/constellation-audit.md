# YACE19AI route and content audit

Audit baseline: the application before the research-lab redesign on 2026-10-03. The complete checked-in route manifest is `qa/routes.json` (20 concrete routes); this document records the five React routes, the wildcard, their rendered sections and all standalone pages in that inventory.

## Application routes and shared sections

| Route | Previous component/content | Finding | New disposition |
| --- | --- | --- | --- |
| `/` | `Site` rendered a shared “Build. Explore. Share.” hero, then `HomePage` rendered two image cards: founder/philosophy and archived site portfolio. | The headline and generic portfolio cards obscured the research, world-model and scientific-AI purpose. The shared hero duplicated page content. | Research-led home: one claim and supporting line; mission, three layers, lab systems, research domains, explicit evidence TODOs and a single CTA band. |
| `/fleet` | `ProjectPortfolio` showed 21 equally weighted historical projects, repo links, demo links and long descriptions. Some descriptions included unverified model names, live status and operational claims. | Card fatigue and broad portfolio positioning; “live” and model labels were not a dependable proof source. | Curated public-repository index; source presence is stated without claiming current service, benchmark or deployment. Full archive remains in GitHub. |
| `/games` | Four local/archive cards for two playable games, a kids archive hub and an illustrative 3D scene. | Useful historical experiments, but not the research-lab core; some destinations are explicitly placeholders. | Preserved as a secondary interactive archive and not a top-level nav item. Each entry labels local/illustrative limitations. |
| `/philosophy` | `App` rendered `Philosophy`, which contained two image-led cards. The separate `PhilosophyPage` module was not routed; it additionally contained an arena and achievements section. | The route duplicated one of two philosophy cards and did not use the richer page module. The arena/achievement content was not actually reachable via this route. | A focused approach page: imagination, honest investigation and systems as a research practice. |
| `/media` | `MediaPage` rendered every catalog item, while `MediaReel` also rendered three videos on every route. | Media was repeated site-wide, overpowered primary content and was framed as a “portfolio” proof surface despite archive QA caveats. | Preserved as a dedicated media archive with per-item QA/availability context; global reel removed. |
| `*` | A small not-found section appeared after the shared hero; the page label was based on a five-item route list. | Unknown paths could retain generic portfolio chrome and inherited metadata. | Clear 404 view; route metadata marks unknown paths `noindex`. |

The previous shared shell also contained a five-link navigation, EN/FR toggle, “Illustrative. Local. No payments/execution.” notice, repeated two-CTA hero, a global three-video reel and a GitHub-only footer. The gold/black styles and gold orbit visual did not match the research identity. The new shell has research/lab/approach navigation, an evidence-aware cross-site accordion, a single Julia portal, an accessible skip link and the required constellation footer.

## Sections inventoried

- Shared header: brand, five former route links, language selector and generic “Explore” CTA.
- Shared hero: CSS gold orb, author eyebrow, route-dependent headline, local-only supporting line and two links.
- Home: two card sections (portrait/vision and archived site/project).
- Fleet: 21 project cards with image/video, status/model/technology labels, descriptions, source/demo links.
- Games: four archive entries; destination caveats are retained.
- Philosophy: two image cards from `src/components/Philosophy.tsx`. `src/pages/PhilosophyPage.tsx` was a duplicate, unrouted variation containing SovereignSwarmArena and Achievements.
- Media: full `public/media-catalog.json` card list with duration/audio/dark-frame QA data; `MediaReel` separately showed three muted looping videos across all routes.
- Footer: copyright and GitHub link only.

## Full route inventory

### React application

`/`, `/fleet`, `/games`, `/philosophy`, `/media`, plus the wildcard 404 route. These are the routes in `src/App.tsx` and are also included in `qa/routes.json`.

### Standalone HTML/archive routes (15)

- `/games/kids-games/index.html` — archive hub; nine child games are placeholders.
- `/games/kids-games/games/animal-sounds/index.html`
- `/games/kids-games/games/code-rocket/index.html`
- `/games/kids-games/games/color-catcher/index.html`
- `/games/kids-games/games/gravity-maze/index.html`
- `/games/kids-games/games/math-asteroid/index.html`
- `/games/kids-games/games/planet-architect/index.html`
- `/games/kids-games/games/shape-builder/index.html`
- `/games/kids-games/games/speed-circuit/index.html`
- `/games/kids-games/games/word-galaxy/index.html`
- `/games/platformer/index.html` — playable local archive.
- `/games/platformer/www/index.html` — native/web mirror.
- `/games/swarm-architect/index.html` — playable local archive.
- `/games/swarm-architect/www/index.html` — native/web mirror.
- `/sovereign/index.html` — illustrative 3D interface; no backend execution.

The standalone archives are retained for existing links and are not presented as scientific evidence or included in the primary sitemap. Their own page markup remains separate from the React route-head manager.

## Semantic and trust notes

- Each React route has a canonical URL, route-specific title/description, Open Graph/Twitter tags, language and a shared JSON-LD entity graph with route-specific `WebPage`/`BreadcrumbList`.
- The graph identifies the PRIME-AI Sovereign Constellation and connects YACE19AI, PRIME-AI and AMLAZR by stable `@id` references. Cross-brand identity is not inferred from project metrics.
- The language switch is client-side and does not create separate language URLs, so alternate `hreflang` URLs are intentionally omitted rather than pointing English and French variants at the same canonical URL.
- The research home marks publications, models and benchmarks as TODO until DOI-linked, model-card or reproducible proof is available.
- Public repository links are proof of source listings only. They are not evidence of deployed services or measured performance.
- Unknown routes are `noindex`; standalone game/demo routes are preserved as archive pages and omitted from `sitemap.xml`.

## Shared Julia integration

- The lead-published `julia-embed-READY.md` API is integrated through the external module loader; the app does not implement the avatar runtime.
- `mount({ site: "yace19ai", container?, tools, windowEndpoint })` is passed the shared exact-name handler map. `mountConstellation({ site: "yace19ai" })` owns a body-level shared accordion after it connects; the local four-entry accordion is the offline fallback.
- The server-issued `exp` and `ttl` drive the visible countdown. Session tokens are not placed in URLs, storage or logs; cross-site handoff uses the runtime's exact-origin `handoff`.
- The local embed defaults to `http://192.168.1.80:5176/julia/embed.js`, with the YACE preview at `http://192.168.1.80:5175`. Production defaults to `https://prime-ai.fr/julia/embed.js`. Both can be overridden with `VITE_JULIA_EMBED_URL` and `VITE_JULIA_WINDOW_ENDPOINT`.
- Julia is explicitly labeled as a scripted demo with browser speech. Retrieval, LLM and server voice services are unconnected or unverified; the timed session issuer is not evidence of those capabilities. The offline portrait is labeled as a static fallback.
