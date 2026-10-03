import hashlib
import io
import pathlib
import tarfile
import tempfile
import unittest
import zipfile

from qa.extract_restore_artifact import extract


class RestoreExtractionTests(unittest.TestCase):
    def bundle(self, root, entries):
        tar_bytes = io.BytesIO()
        with tarfile.open(fileobj=tar_bytes, mode="w") as archive:
            for name, value in entries:
                entry = tarfile.TarInfo(name)
                if value is None:
                    entry.type = tarfile.SYMTYPE
                    entry.linkname = "/etc/passwd"
                    archive.addfile(entry)
                else:
                    entry.size = len(value)
                    archive.addfile(entry, io.BytesIO(value))
        tar_data = tar_bytes.getvalue()
        outer = root / "source.zip"
        with zipfile.ZipFile(outer, "w") as archive:
            archive.writestr("artifact.tar", tar_data)
        digest = "sha256:" + hashlib.sha256(outer.read_bytes()).hexdigest()
        return outer, digest, tar_data

    def test_keeps_original_tar_bytes_and_records_all_live_file_hashes(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            archive, digest, tar_bytes = self.bundle(root, [
                ("./index.html", b"old-index"), ("./fleet/index.html", b"old-route"), ("./assets/app.js", b"old-js")
            ])
            inventory = extract(archive, root / "out", digest)
            self.assertEqual((root / "out/artifact.tar").read_bytes(), tar_bytes)
            self.assertEqual(inventory["tarSha256"], hashlib.sha256(tar_bytes).hexdigest())
            self.assertEqual(len(inventory["files"]), 3)
            self.assertEqual(inventory["files"]["index.html"], hashlib.sha256(b"old-index").hexdigest())

    def test_rejects_archive_digest_and_tar_digest_mismatch(self):
        for wrong_zip, wrong_tar in [(True, False), (False, True)]:
            with tempfile.TemporaryDirectory() as directory:
                root = pathlib.Path(directory)
                archive, digest, _ = self.bundle(root, [("index.html", b"old")])
                with self.assertRaises(ValueError):
                    extract(archive, root / "out", "sha256:" + "0" * 64 if wrong_zip else digest, "0" * 64 if wrong_tar else "")

    def test_rejects_unsafe_tar_members(self):
        for name, value in [("../escape", b"x"), ("/absolute", b"x"), ("link", None), ("index.html", b"duplicate")]:
            with self.subTest(name=name), tempfile.TemporaryDirectory() as directory:
                root = pathlib.Path(directory)
                archive, digest, _ = self.bundle(root, [("index.html", b"old"), (name, value)])
                with self.assertRaises(ValueError):
                    extract(archive, root / "out", digest)


if __name__ == "__main__":
    unittest.main()
