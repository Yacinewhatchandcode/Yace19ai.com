import json
import pathlib
import tempfile
import unittest
import zipfile

from qa.read_restore_provenance import read_provenance


class ProvenanceLayoutTests(unittest.TestCase):
    def test_real_upload_layout_and_downloaded_admission_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory)
            value = {"schema": "yace-restore/v1", "tarSha256": "a" * 64}
            archive = root / "evidence.zip"
            with zipfile.ZipFile(archive, "w") as bundle:
                bundle.writestr("verified/restore-provenance.json", json.dumps(value))
                bundle.writestr("preservation-receipt.json", "{}")
            self.assertEqual(read_provenance(archive), value)
            target = root / "admission"
            (target / "verified").mkdir(parents=True)
            (target / "verified/restore-provenance.json").write_text(json.dumps(value))
            self.assertEqual(read_provenance(target), value)
            (target / "restore-provenance.json").write_text("{}")
            with self.assertRaises(ValueError):
                read_provenance(target)

    def test_rejects_missing_alternate_and_duplicate_provenance(self):
        for names in [[], ["restore-provenance.json"], ["other/restore-provenance.json"],
                      ["verified/restore-provenance.json", "restore-provenance.json"],
                      ["verified/restore-provenance.json"] * 2]:
            with self.subTest(names=names), tempfile.TemporaryDirectory() as directory:
                archive = pathlib.Path(directory) / "evidence.zip"
                with zipfile.ZipFile(archive, "w") as bundle:
                    for name in names:
                        bundle.writestr(name, "{}")
                with self.assertRaises(ValueError):
                    read_provenance(archive)
