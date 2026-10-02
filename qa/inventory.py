"""Inventory repository web surfaces without reading environment credentials."""
import json
import re
from pathlib import Path

root = Path(".")
pages = sorted(Path("public").rglob("*.html"))
app_routes = ["/", "/fleet", "/games", "/philosophy", "/media"]
files = sorted(Path("src").rglob("*")) + sorted(Path("public").rglob("*")) + [Path("index.html")]
sources = [p for p in files if p.is_file() and p.suffix in {".tsx", ".ts", ".html", ".js", ".css"}
           and "/android/" not in str(p) and "/ios/" not in str(p)]
links, calls = [], []
for path in sources:
    text = path.read_text()
    for match in re.finditer(r"""(?:href|src|to)\s*=\s*["']([^"']+)["']""", text):
        links.append({"source": str(path), "target": match[1]})
    for match in re.finditer(r"""(?:fetch|WebSocket|EventSource)\s*\(\s*["']([^"']+)["']""", text):
        calls.append({"source": str(path), "target": match[1]})
routes = [{"path": p, "kind": "react", "locales": ["en", "fr"]} for p in app_routes]
routes += [{"path": "/" + str(p.relative_to("public")), "kind": "static", "locales": ["en"]}
           for p in pages]
assets = [{"path": str(p), "bytes": p.stat().st_size}
          for p in files if p.is_file() and p.suffix.lower() in {
              ".png", ".webp", ".svg", ".jpg", ".jpeg", ".mp4", ".webm", ".mp3", ".wav", ".ogg", ".apk"}]
Path("qa/routes.json").write_text(json.dumps({
    "base_url": "http://127.0.0.1:4181", "routes": routes, "assets": assets,
    "literal_links": links, "external_calls": calls,
    "note": "Includes dormant sources and native www duplicates; dynamic rendered links are audited by browser QA."
}, indent=2) + "\n")
print(f"Inventoried {len(routes)} routes, {len(assets)} assets, {len(links)} literal links")
