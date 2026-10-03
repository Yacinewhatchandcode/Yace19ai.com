import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { repositoryApi } from "./github-repository-api.mjs";
import { downloadArtifact } from "./github-artifact-download.mjs";
import { original, reviewedPreserved, readProvenance, validateInventory, validateReviewedPreserved } from "./pages-restore.mjs";

assert.equal(process.env.GITHUB_REPOSITORY, original.repository);
const api = repositoryApi(original.repository);
const run = api(`actions/runs/${reviewedPreserved.runId}`);
validateReviewedPreserved(reviewedPreserved, run);
assert.equal(run.conclusion, "success");
assert.equal(run.status, "completed");
assert.equal(run.event, "workflow_dispatch");
assert.equal(run.head_branch, "main");
assert.equal(run.path, ".github/workflows/deploy.yml");
assert.equal(run.repository.full_name, original.repository);
for (const actor of [run.actor, run.triggering_actor]) {
  assert.equal(actor.login.toLowerCase(), original.repository.split("/")[0].toLowerCase());
}
const directory = fs.mkdtempSync(path.join(process.env.RUNNER_TEMP, "preserved-restore-probe-"));
for (const [id, digest, name, filename] of [
  [reviewedPreserved.artifactId, reviewedPreserved.archiveDigest, "github-pages", "pages.zip"],
  [reviewedPreserved.evidenceId, reviewedPreserved.evidenceDigest, `restore-evidence-${run.id}`, "evidence.zip"],
]) {
  const artifact = api(`actions/artifacts/${id}`);
  assert.equal(String(artifact.id), id);
  assert.equal(artifact.name, name);
  assert.equal(artifact.digest, digest);
  assert.equal(artifact.workflow_run.id, run.id);
  assert.equal(artifact.workflow_run.head_sha, run.head_sha);
  assert.equal(artifact.expired, false);
  assert.ok(Date.parse(artifact.expires_at) > Date.now());
  const archive = path.join(directory, filename);
  downloadArtifact(original.repository, id, archive);
  const hash = createHash("sha256");
  for await (const chunk of fs.createReadStream(archive)) hash.update(chunk);
  assert.equal(`sha256:${hash.digest("hex")}`, digest);
}
const output = path.join(directory, "verified");
execFileSync("python3", ["qa/extract_restore_artifact.py", path.join(directory, "pages.zip"), output,
  reviewedPreserved.archiveDigest, reviewedPreserved.tarSha256], { stdio: "inherit" });
const inventory = JSON.parse(fs.readFileSync(path.join(output, "tar-inventory.json"), "utf8"));
inventory.provenance = readProvenance(path.join(directory, "evidence.zip"));
validateInventory(reviewedPreserved, inventory);
assert.equal(Object.keys(inventory.files).length, 752);
console.log(JSON.stringify({ runId: run.id, artifactId: reviewedPreserved.artifactId,
  tarSha256: inventory.tarSha256, fileCount: Object.keys(inventory.files).length }));
