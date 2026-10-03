import json
import pathlib
import sys
import zipfile


PROVENANCE_PATH = "verified/restore-provenance.json"


def read_provenance(source):
    if source.is_dir():
        matches = list(source.rglob("restore-provenance.json"))
        if matches != [source / PROVENANCE_PATH]:
            raise ValueError("Restore evidence requires exactly verified/restore-provenance.json")
        return json.loads(matches[0].read_text())
    with zipfile.ZipFile(source) as bundle:
        matches = [name for name in bundle.namelist()
                   if pathlib.PurePosixPath(name).name == "restore-provenance.json"]
        if matches != [PROVENANCE_PATH]:
            raise ValueError("Restore evidence requires exactly verified/restore-provenance.json")
        return json.loads(bundle.read(PROVENANCE_PATH))


if __name__ == "__main__":
    print(json.dumps(read_provenance(pathlib.Path(sys.argv[1]))))
