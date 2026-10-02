"""One-time deterministic repair of archived static pages; safe to rerun."""
import re
import shutil
from pathlib import Path

for path in Path("public").rglob("*.html"):
    text = path.read_text()
    text = re.sub(r'\s*<!-- Prime AI Analytics -->\s*<script defer src="https://prime-ai.fr/t.js"[^>]*></script>', '', text)
    text = re.sub(r'\s*<link\b[^>]*(?:fonts.googleapis.com|fonts.gstatic.com)[^>]*>', '', text)
    if "/kids-games/games/" in str(path):
        text = text.replace("This experience is currently booting up in the Sovereign Network. Real-time test phase active.",
                            "Unavailable in this archive: the game implementation is not included. This is not a running test or a loading screen.")
        text = text.replace('<div class="loader"></div>', '<p role="status">Original game source required.</p>')
        text = text.replace("Unavailable in this archive: the game implementation is not included. This is not a running test or a loading screen.",
                            "Unavailable. Original source required.")
        text = text.replace('<p role="status">Original game source required.</p>', '')
        text = text.replace("← Back to Kids Hub", "Kids hub")
        if 'class="archive-orb"' not in text:
            text = text.replace('<h1>', '<div class="archive-orb" aria-hidden="true"></div><h1>')
    if path == Path("public/games/kids-games/index.html"):
        text = text.replace('<div class="logo-icon">🚀</div>',
                            '<div class="archive-orb" aria-hidden="true"></div>')
        text = re.sub(r'<a href="https://prime-ai.fr" target="_blank"([^>]*id="game-([^"]+)"[^>]*)>',
                      lambda m: f'<a href="games/{m[2]}/index.html"{m[1]}>', text)
        text = re.sub(r'<div class="price-tag">.*?</div><div class="price-old">.*?</div></div>', '', text)
        text = text.replace("Purchase Source", "Unavailable — archive page")
        text = text.replace("9 Games · 3 Groups · Infinite Fun", "Archive hub · 9 unavailable game implementations")
        text = text.replace("Powered by <strong>OpenClaw</strong> on iMac · Antigravity Engine", "Local archive · No server or payment service connected")
        text = text.replace("Local archive · No server or payment service connected", "Local · EN")
        text = text.replace("Archive hub · 9 unavailable game implementations", "9 unavailable archives")
        text = text.replace("Unavailable — archive page", "Unavailable")
        text = re.sub(r'(<a\b[^>]*id="game-([^"]+)"[^>]*>)(.*?)(</a>)',
                      lambda m: m[1] + re.sub(r'<p>.*?</p>', '', re.sub(
                          r'<h3>.*?</h3>', '<h3>' + m[2].replace('-', ' ').title() + '</h3>', m[3], flags=re.S)) + m[4],
                      text, flags=re.S)
    if "/swarm-architect/" in str(path):
        text = re.sub(r'<p class="theme-sub">.*?</p>', '', text)
        text = text.replace("CONTROLS: Mouse / WASD / Gamepad Left Stick to move.", "Mouse / WASD / Touch")
    if 'src="/games/local-controls.js"' not in text:
        text = text.replace('</head>', '<link rel="stylesheet" href="/games/local-archive.css">\n</head>')
        text = text.replace('</body>', '<script src="/games/local-controls.js"></script>\n</body>')
    path.write_text("\n".join(line.rstrip() for line in text.splitlines()) + "\n")
shutil.copyfile("src/styles/sovereign-gold.css", "public/games/sovereign-gold.css")
