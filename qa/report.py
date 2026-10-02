"""Assemble persistent local QA evidence and the fleet /urls catalog."""
import datetime
import json
import subprocess
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

BASE = "http://127.0.0.1:4181"
out = Path("qa-evidence")
read = lambda name: json.loads((out / name).read_text())
browser = read("final/browser.json")
before = read("before-gold/browser.json")
interactions = read("interactions.json")
media = read("media.json")
inventory = json.loads(Path("qa/routes.json").read_text())
rows = []
for result in browser["results"]:
    if result["width"] != 1440:
        continue
    baseline = next(item for item in before["results"] if
                    (item["path"], item["width"], item["locale"]) ==
                    (result["path"], result["width"], result["locale"]))
    rows.append({"path": result["path"], "locale": result["locale"],
                 "before": baseline["words"], "after": result["words"],
                 "reduction_percent": round(100 * (1 - result["words"] / baseline["words"]), 2)})
word_before = sum(row["before"] for row in rows)
word_after = sum(row["after"] for row in rows)
words = {"baseline": "Repaired local site before Sovereign Gold; not the initial coming-soon placeholder.",
         "method": "Rendered document.body.innerText whitespace tokens at 1440px; closed historical details excluded.",
         "before": word_before, "after": word_after,
         "reduction_percent": round(100 * (1 - word_after / word_before), 2), "routes": rows}
(out / "word-counts.json").write_text(json.dumps(words, indent=2) + "\n")

unavailable = [route["path"] for route in inventory["routes"] if "/kids-games/games/" in route["path"]]
bad_media = [item for item in media if item["qa_status"] in {"failed", "failed_content"}]
blockers = [
    {"kind": "missing_game_source", "paths": unavailable,
     "action": "Provide original implementations for these nine archive pages. No substitute games were fabricated."},
    {"kind": "defective_original_media", "paths": [item["path"] for item in bad_media],
     "action": "Supply a nonempty AgentCoder MP4, completed Converse/Factory videos and a meaningful Prime.AI recording instead of the recorded GitHub 404."},
    {"kind": "human_gated_publication",
     "action": "Owner approves/publishes the GitHub Pages workflow, sets Pages custom domain, replaces stale GoDaddy records using DEPLOY.md, and verifies HTTPS. No Netlify restoration is required."},
]
production = {
    "intended_provider": "GitHub Pages", "status": "not-deployed (GitHub Pages prepared)",
    "read_only_observations": {
        "nameservers": ["ns71.domaincontrol.com", "ns72.domaincontrol.com"],
        "stale_apex_A": "75.2.60.5",
        "stale_www_CNAME": "thriving-lokum-6f2bbb.netlify.app",
        "current_tls": "Certificate hostname mismatch for both apex and www",
        "stale_host_http": "Netlify subdomain returned HTTP 404 site-not-found",
        "pages_api": {"build_type": "workflow", "cname": None,
                      "html_url": "https://yacinewhatchandcode.github.io/Yace19ai.com/", "https_enforced": True},
    },
    "conclusion": "DNS resolves, but records point to a stale provider. The intended GitHub Pages custom domain is unconfigured. Site deletion cannot be proven from the 404.",
    "human_action": "Follow DEPLOY.md: manual Pages publication, owner-side custom domain, four GitHub apex A records, www CNAME yacinewhatchandcode.github.io, then verify HTTPS.",
    "changes_performed": [],
}
routes = []
for route in inventory["routes"]:
    qa = [result for result in browser["results"] if result["path"] == route["path"]]
    routes.append({"path": route["path"], "url": BASE + route["path"], "qa": qa,
                   "content_status": "blocked-original-source" if route["path"] in unavailable else "available",
                   "locales": route["locales"]})
assets = [{"path": asset["path"],
           "url": BASE + "/" + quote(asset["path"].removeprefix("public/")),
           "bytes": asset["bytes"]} for asset in inventory["assets"]
          if asset["path"].startswith("public/")]
assets += [{"path": str(asset), "url": BASE + "/" + quote(str(asset.relative_to("dist"))),
            "bytes": asset.stat().st_size}
           for asset in sorted(Path("dist/assets").iterdir()) if asset.is_file()]
for asset in assets:
    with urlopen(Request(asset["url"], method="HEAD"), timeout=10) as response:
        if response.status != 200:
            raise RuntimeError(f"Asset URL failed: {asset['url']} ({response.status})")
        asset["http_status"] = response.status
catalog = {"site": "Yace19ai", "productionUrl": "https://yace19ai.com",
           "productionStatus": production["status"], "routes": routes,
           "videos": [{**item, "url": BASE + item["url"]} for item in media],
           "aliases": [{"path": f"/{route}/", "url": f"{BASE}/{route}/",
                        "qa": "390/1440 direct-entry checks in interactions.json"}
                       for route in ["fleet", "games", "philosophy", "media"]],
           "assets": assets,
           "source_assets": [asset for asset in inventory["assets"]
                             if not asset["path"].startswith("public/")],
           "blockers": blockers}
(out / "catalog.json").write_text(json.dumps(catalog, indent=2) + "\n")

def output(args):
    return subprocess.check_output(args, text=True).strip()

disk = output(["df", "-h", "."])
service = {"url": BASE, "binding": "127.0.0.1:4181", "detached": True, "shell_id": "yace19ai-server",
           "listener": output(["lsof", "-nP", "-iTCP:4181", "-sTCP:LISTEN"]),
           "command": "python3 qa/serve.py"}
report = {
    "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "status": "local-ready-with-original-content-blockers",
    "local_url": BASE, "service": service, "production": production,
    "route_count": len(inventory["routes"]), "route_qa": browser["summary"],
    "interaction_qa": interactions["summary"], "media_count": len(media),
    "asset_qa": {"total": len(assets), "passed": len(assets), "failed": 0,
                 "method": "HTTP HEAD for every public and compiled catalog asset URL"},
    "media_qa": {"pass_with_context": len(media) - len(bad_media), "failed_original_content": len(bad_media),
                 "audible": sum(item["audio_state"] == "audible" for item in media),
                 "no_audio_stream": sum(item["audio_state"] == "no audio stream" for item in media),
                 "undecodable": sum(item["audio_state"] == "unreadable" for item in media),
                 "note": "All decodable files were visually reviewed; 0.04s placeholders yield no 2fps samples (null), with native-frame ratio recorded separately. Dark != blank."},
    "word_counts": words,
    "validation": {"build_and_full_typecheck": "passed",
                   "eslint_changed_active_sources": "passed",
                   "git_diff_check": "passed",
                   "visual_review": "All 50 final viewport screenshots inspected via four route sheets; all 14 decodable media contact sheets inspected.",
                   "chromium": "Existing installed browser, --use-gl=angle --use-angle=swiftshader-webgl --enable-unsafe-swiftshader; no downloads.",
                   "all_routes_have_above_fold_visual": all(item["heroVisual"] for item in browser["results"])},
    "advisory": {"mission_id": read("advisory.json")["mission_id"], "status": read("advisory.json")["status"],
                 "execute_called": False,
                 "acceptance_verified": False,
                 "disposition": "Applied honesty/navigation/privacy recommendations. Rejected unrelated Next.js/4180/HashRouter claims copied from other work; local evidence is authoritative."},
    "changed_files": output(["git", "diff", "--name-only"]).splitlines(),
    "added_files": output(["git", "ls-files", "--others", "--exclude-standard"]).splitlines(),
    "blockers": blockers,
    "disk": {"final": disk, "guard_GiB": 3,
             "incident": "Shared disk briefly fell below 3 GiB during the necessary lockfile restore. Coordinator freed its disposable runtimes; final headroom is above the guard.",
             "dependencies": "Lockfile npm ci after missing-dependency build failure; sibling dependencies lacked the required packages."},
    "chronicles": "No Chronicles route exists; no sibling worktree/PDF copied or modified.",
    "no_push_deploy_or_dns_changes": True,
}
(out / "report.json").write_text(json.dumps(report, indent=2) + "\n")
markdown = f"""# Yace19ai local QA

**Local URL:** {BASE} — detached loopback server, port 4181 only.
**Status:** local runtime ready; missing/defective original content remains blocked.
**Production:** {production['status']}. No push, deployment or DNS edit.

## Results

| Area | Pass | Fail / blocked |
|---|---:|---:|
| Route/viewport/locale checks | {browser['summary']['passed']} | {browser['summary']['failed']} |
| In-app link targets | {browser['summary']['links'] - browser['summary']['failedLinks']} | {browser['summary']['failedLinks']} |
| Interaction/playback/range checks | {interactions['summary']['passed']} | {interactions['summary']['failed']} |
| Catalog asset URLs | {len(assets)} | 0 |
| Original media content | {len(media) - len(bad_media)} contextual archives | {len(bad_media)} defective originals |
| Missing children's games | 0 recovered | {len(unavailable)} source implementations absent |

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

Rendered wording fell from **{word_before} to {word_after} tokens
({words['reduction_percent']}% reduction)** across unique route/locale cases.
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

Local fleet mission `{read('advisory.json')['mission_id']}` completed.
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
{disk}
```
"""
(out / "REPORT.md").write_text(markdown)
print(json.dumps({"route_checks": browser["summary"], "interactions": interactions["summary"],
                  "words_reduced_percent": words["reduction_percent"], "content_blockers": len(unavailable) + len(bad_media)}))
