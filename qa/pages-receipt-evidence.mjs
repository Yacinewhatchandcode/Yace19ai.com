import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

export function readReceiptEvidence(directory) {
  const read = relative => JSON.parse(fs.readFileSync(path.join(directory, relative), "utf8"));
  const approval = read("release-approval.json");
  const restoring = approval.operation === "restore";
  const manifestPath = restoring ? "pages-integrity.json" : "reviewed-artifact/pages-integrity.json";
  const manifests = [];
  function findManifests(root) {
    for (const item of fs.readdirSync(root, { withFileTypes: true })) {
      const file = path.join(root, item.name);
      assert.ok(!item.isSymbolicLink(), "Receipt evidence must not contain symlinks");
      if (item.isDirectory()) findManifests(file);
      else if (item.name === "pages-integrity.json") manifests.push(path.relative(directory, file));
    }
  }
  findManifests(directory);
  assert.deepEqual(manifests, [manifestPath], "Require the exact single producer manifest path");
  const manifest = read(manifestPath);
  assert.equal(manifest.candidateSha, approval.artifactSourceSha ?? approval.sourceSha);
  assert.ok(manifest.files["index.html"]);
  const rollback = restoring
    ? { previousDeployment: null, successfulStatus: null }
    : read("rollback-evidence.json");
  if (!restoring) {
    assert.ok(rollback.previousDeployment?.id);
    assert.equal(rollback.successfulStatus?.state, "success");
  }
  return { approval, manifest, rollback };
}
