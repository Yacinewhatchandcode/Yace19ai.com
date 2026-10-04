import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { downloadArtifact } from "./github-artifact-download.mjs";
import { repositoryApi } from "./github-repository-api.mjs";
import { original, reviewedPreserved } from "./pages-restore.mjs";
import { readReceiptEvidence } from "./pages-receipt-evidence.mjs";

assert.equal(process.env.GITHUB_REPOSITORY, original.repository);
const api = repositoryApi(original.repository);
for (const [id, digest, runId, name, restoring] of [
  ["11294327645", "sha256:e677f14fe64765df4637ab91ba7d5ae5a6da1fe493937fbe18f9aaab1f35396b",
    37179555085, "release-preflight-37179555085", false],
  [reviewedPreserved.evidenceId, reviewedPreserved.evidenceDigest, Number(reviewedPreserved.runId),
    `restore-evidence-${reviewedPreserved.runId}`, true],
]) {
  const artifact = api(`actions/artifacts/${id}`);
  assert.equal(artifact.digest, digest);
  assert.equal(artifact.workflow_run.id, runId);
  assert.equal(artifact.name, name);
  assert.equal(artifact.expired, false);
  assert.ok(Date.parse(artifact.expires_at) > Date.now());
  const directory = fs.mkdtempSync(path.join(process.env.RUNNER_TEMP, "receipt-layout-"));
  const archive = path.join(directory, "evidence.zip");
  downloadArtifact(original.repository, id, archive);
  const hash = createHash("sha256");
  for await (const chunk of fs.createReadStream(archive)) hash.update(chunk);
  assert.equal(`sha256:${hash.digest("hex")}`, digest);
  const output = path.join(directory, "downloaded");
  execFileSync("python3", ["-c",
    "import sys,zipfile,pathlib; z=zipfile.ZipFile(sys.argv[1]); names=z.namelist(); assert len(names)==len(set(names)); assert all(not n.startswith('/') and '..' not in pathlib.PurePosixPath(n).parts and '\\\\' not in n for n in names); z.extractall(sys.argv[2])",
    archive, output]);
  if (restoring) {
    // Preserve and restore share this evidence layout; only the operation differs.
    const file = path.join(output, "release-approval.json");
    const approval = JSON.parse(fs.readFileSync(file, "utf8"));
    approval.operation = "restore";
    fs.writeFileSync(file, JSON.stringify(approval));
  }
  const evidence = readReceiptEvidence(output);
  console.log(JSON.stringify({ artifactId: id, restoring, files: Object.keys(evidence.manifest.files).length }));
}
