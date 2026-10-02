"""Loopback-only build server with explicit SPA routes and byte-range media support."""
import http.server
import mimetypes
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path("dist").resolve()
SPA = {"/", "/fleet", "/games", "/philosophy", "/media"}

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        url = unquote(urlsplit(self.path).path)
        target = (ROOT / url.lstrip("/")).resolve()
        if ROOT not in target.parents and target != ROOT:
            self.send_error(403)
            return None
        if url in SPA:
            target = ROOT / "index.html"
        elif target.is_dir():
            target /= "index.html"
        if not target.is_file():
            self.send_error(404, "Local file or route not found")
            return None
        size = target.stat().st_size
        start, end = 0, size - 1
        requested = self.headers.get("Range")
        if requested:
            match = re.fullmatch(r"bytes=(\d*)-(\d*)", requested)
            if not match or not any(match.groups()):
                self.send_error(416)
                return None
            if match[1]:
                start = int(match[1])
                end = min(int(match[2]), end) if match[2] else end
            else:
                start = max(0, size - int(match[2]))
            if start > end or start >= size:
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{size}")
                self.end_headers()
                return None
        self.send_response(206 if requested else 200)
        self.send_header("Content-Type", mimetypes.guess_type(target)[0] or "application/octet-stream")
        self.send_header("Content-Length", str(end - start + 1))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        if requested:
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.end_headers()
        stream = target.open("rb")
        stream.seek(start)
        self.remaining = end - start + 1
        return stream

    def copyfile(self, source, outputfile):
        while self.remaining:
            data = source.read(min(65536, self.remaining))
            if not data:
                break
            try:
                outputfile.write(data)
            except (BrokenPipeError, ConnectionResetError):
                break  # Browser cancelled a media range while changing pages.
            self.remaining -= len(data)

if __name__ == "__main__":
    if not (ROOT / "index.html").exists():
        raise SystemExit("Build missing. Run npm run build first.")
    print("Serving local build at http://127.0.0.1:4181", flush=True)
    http.server.ThreadingHTTPServer(("127.0.0.1", 4181), Handler).serve_forever()
