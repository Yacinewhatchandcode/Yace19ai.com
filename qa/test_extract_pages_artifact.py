import pathlib
import subprocess
import tempfile
import unittest
import zipfile

from qa.extract_pages_artifact import extract


class ExtractPagesArtifactTests(unittest.TestCase):
    def make_archive(self, root: pathlib.Path, entries: dict[str, bytes]) -> pathlib.Path:
        archive = root / "artifact.zip"
        with zipfile.ZipFile(archive, "w") as bundle:
            for name, data in entries.items():
                bundle.writestr(name, data)
        return archive

    def test_extracts_only_valid_static_artifact(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = pathlib.Path(temporary)
            archive = self.make_archive(root, {
                "dist/index.html": b"<h1>Static</h1>",
                "dist/assets/app.js": b"app",
                "pages-integrity.json": b"{}",
            })
            destination = root / "out"
            extract(archive, destination)
            self.assertEqual((destination / "dist/index.html").read_bytes(), b"<h1>Static</h1>")

    def test_rejects_paths_outside_static_artifact(self) -> None:
        for name in ("../escape", "/absolute", "notes.txt", "dist/../escape"):
            with self.subTest(name=name), tempfile.TemporaryDirectory() as temporary:
                root = pathlib.Path(temporary)
                archive = self.make_archive(root, {
                    "dist/index.html": b"html",
                    "pages-integrity.json": b"{}",
                    name: b"bad",
                })
                with self.assertRaises(ValueError):
                    extract(archive, root / "out")

    def test_hidden_file_round_trip_matches_manifest_and_missing_hidden_file_fails(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = pathlib.Path(temporary)
            source = root / "dist"
            hidden = source / "games/platformer/android/.gitignore"
            hidden.parent.mkdir(parents=True)
            hidden.write_bytes(b"build/\n")
            (source / "index.html").write_bytes(b"<h1>Static</h1>")
            manifest = root / "pages-integrity.json"
            sha = "a" * 40
            subprocess.run(["node", "qa/pages-integrity.mjs", "create", str(source), sha, str(manifest)],
                           check=True, capture_output=True)
            entries = {
                "dist/index.html": (source / "index.html").read_bytes(),
                "dist/games/platformer/android/.gitignore": hidden.read_bytes(),
                "pages-integrity.json": manifest.read_bytes(),
            }
            for keep_hidden in (True, False):
                with self.subTest(keep_hidden=keep_hidden):
                    contents = entries if keep_hidden else {
                        name: value for name, value in entries.items() if not name.endswith("/.gitignore")
                    }
                    archive = self.make_archive(root, contents)
                    destination = root / ("complete" if keep_hidden else "missing")
                    extract(archive, destination)
                    for command in [
                        ["node", "qa/pages-integrity.mjs", "verify", str(destination / "dist"),
                         sha, str(destination / "pages-integrity.json")],
                        ["node", "qa/pages-release-authorization.mjs", "verify-manifest",
                         str(destination / "pages-integrity.json"), str(destination / "dist"), sha],
                    ]:
                        result = subprocess.run(command, capture_output=True)
                        self.assertEqual(result.returncode == 0, keep_hidden, result.stderr.decode())

if __name__ == "__main__":
    unittest.main()
