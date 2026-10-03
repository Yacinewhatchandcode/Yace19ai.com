import hashlib
import json
import pathlib
import shutil
import sys
import tarfile
import zipfile


def sha256_file(path: pathlib.Path) -> str:
    with path.open("rb") as source:
        digest = hashlib.file_digest(source, "sha256") if hasattr(hashlib, "file_digest") else None
        if digest is None:
            digest = hashlib.sha256()
            for chunk in iter(lambda: source.read(1024 * 1024), b""):
                digest.update(chunk)
    return digest.hexdigest()


def extract(archive: pathlib.Path, target: pathlib.Path, expected_zip: str, expected_tar: str = "") -> dict:
    if f"sha256:{sha256_file(archive)}" != expected_zip:
        raise ValueError("Restore archive digest mismatch")
    target.mkdir(parents=True, exist_ok=False)
    with zipfile.ZipFile(archive) as bundle:
        names = bundle.namelist()
        if len(names) != len(set(names)) or set(names) not in (
            {"artifact.tar"}, {"artifact.tar", "restore-provenance.json"}
        ):
            raise ValueError("Restore ZIP must contain only artifact.tar and optional provenance")
        with bundle.open("artifact.tar") as source, (target / "artifact.tar").open("xb") as output:
            shutil.copyfileobj(source, output)
        provenance = json.loads(bundle.read("restore-provenance.json")) if "restore-provenance.json" in names else None
    tar_digest = sha256_file(target / "artifact.tar")
    if expected_tar and tar_digest != expected_tar:
        raise ValueError("Preserved tar digest mismatch")
    files = {}
    seen = set()
    total = 0
    with tarfile.open(target / "artifact.tar", "r:*") as bundle:
        for item in bundle:
            raw = item.name
            if raw.startswith("/") or "\\" in raw or any(ord(char) < 32 or ord(char) == 127 for char in raw):
                raise ValueError(f"Unsafe tar path: {raw!r}")
            parts = pathlib.PurePosixPath(raw).parts
            if ".." in parts:
                raise ValueError(f"Unsafe tar path: {raw!r}")
            if item.isdir():
                continue
            if not item.isfile() or not parts:
                raise ValueError(f"Non-regular restore tar entry: {raw!r}")
            relative = "/".join(parts)
            if relative in seen:
                raise ValueError(f"Duplicate restore tar entry: {relative}")
            seen.add(relative)
            total += item.size
            if total > 5 * 1024 ** 3 or len(seen) > 50000:
                raise ValueError("Restore artifact exceeds bounded static inventory")
            source = bundle.extractfile(item)
            if source is None:
                raise ValueError(f"Unreadable tar member: {relative}")
            with source:
                digest = hashlib.sha256()
                for chunk in iter(lambda: source.read(1024 * 1024), b""):
                    digest.update(chunk)
                files[relative] = digest.hexdigest()
    if "index.html" not in files:
        raise ValueError("Restore tar must contain index.html")
    result = {"tarSha256": tar_digest, "files": files, "provenance": provenance}
    (target / "tar-inventory.json").write_text(json.dumps(result, indent=2) + "\n")
    return result


if __name__ == "__main__":
    if len(sys.argv) not in (4, 5):
        raise SystemExit("usage: extract_restore_artifact.py ZIP TARGET sha256:ZIP_DIGEST [TAR_DIGEST]")
    extract(pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]), sys.argv[3], sys.argv[4] if len(sys.argv) == 5 else "")
