#!/usr/bin/env python3
import pathlib
import shutil
import stat
import sys
import zipfile


def safe_parts(raw_name: str) -> tuple[str, ...]:
    if raw_name.startswith("/") or "\\" in raw_name or any(ord(char) < 32 or ord(char) == 127 for char in raw_name):
        raise ValueError(f"Unsafe archive path: {raw_name!r}")
    parts = tuple(part for part in pathlib.PurePosixPath(raw_name).parts if part not in ("", "."))
    if not parts or any(part == ".." for part in parts):
        raise ValueError(f"Unsafe archive path: {raw_name!r}")
    return parts


def extract(archive_path: pathlib.Path, target: pathlib.Path) -> None:
    allowed_files = {"pages-integrity.json"}
    seen: set[str] = set()
    with zipfile.ZipFile(archive_path) as archive:
        for item in archive.infolist():
            raw_name = item.filename
            parts = safe_parts(raw_name)
            if not (parts[0] == "dist" or raw_name in allowed_files):
                raise ValueError(f"Unexpected artifact path: {raw_name!r}")
            if raw_name in seen:
                raise ValueError(f"Duplicate artifact path: {raw_name!r}")
            seen.add(raw_name)
            mode = item.external_attr >> 16
            if stat.S_ISLNK(mode):
                raise ValueError(f"Symlink forbidden: {raw_name!r}")
            destination = target.joinpath(*parts)
            if item.is_dir():
                destination.mkdir(parents=True, exist_ok=True)
                continue
            file_type = stat.S_IFMT(mode)
            if file_type not in (0, stat.S_IFREG):
                raise ValueError(f"Non-regular artifact entry: {raw_name!r}")
            destination.parent.mkdir(parents=True, exist_ok=True)
            with archive.open(item) as source, destination.open("xb") as output:
                shutil.copyfileobj(source, output)
    if not (target / "dist" / "index.html").is_file() or not (target / "pages-integrity.json").is_file():
        raise ValueError("Candidate artifact must include dist/index.html and pages-integrity.json")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: extract_pages_artifact.py ARCHIVE.zip TARGET_DIR")
    extract(pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]))
