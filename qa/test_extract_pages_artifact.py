import pathlib
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

if __name__ == "__main__":
    unittest.main()
