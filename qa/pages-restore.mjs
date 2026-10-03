import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const original = {
  repository: "Yacinewhatchandcode/Yace19ai.com",
  runId: "37129793980",
  artifactId: "11275823921",
  sourceSha: "10b39a606fc43e4929595188ab3cb9d06b0e52cc",
  archiveDigest: "sha256:d7b97e55a9a126b2a3ca58e6baa21ae22619cffb1b7170465e27edda6110b77c",
};

export function validateRestore(request, records, context) {
  const { run, artifact, repository, environment, branchPolicies, mainSha } = records;
  assert.equal(context.GITHUB_REPOSITORY, original.repository);
  assert.equal(context.GITHUB_REF, "refs/heads/main");
  assert.equal(mainSha, context.GITHUB_SHA, "Restore tooling must be the current main SHA");
  assert.equal(repository.full_name, original.repository);
  assert.equal(repository.owner.type, "User");
  assert.equal(context.GITHUB_ACTOR.toLowerCase(), repository.owner.login.toLowerCase());
  assert.equal(context.TRIGGERING_ACTOR.toLowerCase(), repository.owner.login.toLowerCase());
  assert.equal(request.sourceSha, original.sourceSha, "Only the pinned pre-upgrade content is restorable");
  assert.ok(["restore", "preserve"].includes(request.operation));
  assert.match(request.runId, /^[1-9][0-9]*$/);
  assert.match(request.artifactId, /^[1-9][0-9]*$/);
  assert.match(request.archiveDigest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(run.id, Number(request.runId));
  assert.equal(run.status, "completed");
  assert.equal(run.conclusion, "success");
  assert.equal(run.event, "workflow_dispatch");
  assert.equal(run.path, ".github/workflows/deploy.yml");
  assert.equal(run.head_branch, "main");
  assert.equal(run.repository.full_name, original.repository);
  assert.equal(artifact.id, Number(request.artifactId));
  assert.equal(artifact.name, "github-pages");
  assert.equal(artifact.workflow_run.id, run.id);
  assert.equal(artifact.workflow_run.head_sha, run.head_sha);
  assert.equal(artifact.workflow_run.repository_id, repository.id);
  assert.equal(artifact.workflow_run.head_repository_id, repository.id);
  assert.equal(artifact.digest, request.archiveDigest);
  assert.equal(artifact.expired, false);
  assert.ok(Date.parse(artifact.expires_at) > Date.now(), "Restore artifact has reached expiry");
  assert.ok(Date.parse(artifact.created_at) >= Date.parse(run.run_started_at));
  assert.ok(Date.parse(artifact.created_at) <= Date.parse(run.updated_at));
  if (request.artifactId === original.artifactId) {
    assert.equal(request.runId, original.runId);
    assert.equal(run.head_sha, original.sourceSha);
    assert.equal(request.archiveDigest, original.archiveDigest);
  } else {
    assert.equal(records.workflowMatchesCurrent, true, "Preserved artifact must use this trusted workflow definition");
    assert.equal(run.actor.login.toLowerCase(), repository.owner.login.toLowerCase());
    assert.equal(run.triggering_actor.login.toLowerCase(), repository.owner.login.toLowerCase());
    assert.match(request.tarSha256, /^[0-9a-f]{64}$/, "Preserved restore requires the reviewed original tar digest");
  }
  assert.equal(environment.deployment_branch_policy.custom_branch_policies, true);
  assert.deepEqual(branchPolicies.map(({ name, type }) => ({ name, type })), [{ name: "main", type: "branch" }]);
  const reviewers = environment.protection_rules.find(rule => rule.type === "required_reviewers")?.reviewers;
  assert.equal(reviewers?.length, 1, "Restore environment must list only the owner reviewer");
  assert.ok(reviewers?.some(item => item.type === "User" && item.reviewer.login.toLowerCase() === repository.owner.login.toLowerCase()),
    "Restore requires the configured owner reviewer; no bypass");
  return request;
}

export function validateInventory(request, inventory) {
  assert.match(inventory.tarSha256, /^[0-9a-f]{64}$/);
  assert.ok(inventory.files["index.html"]);
  if (request.tarSha256) assert.equal(inventory.tarSha256, request.tarSha256);
  if (request.artifactId !== original.artifactId) {
    assert.deepEqual(inventory.provenance?.original, original);
    assert.equal(inventory.provenance.tarSha256, request.tarSha256);
    assert.deepEqual(inventory.provenance.files, inventory.files);
  }
  return { schema: "yace-restore/v1", original, tarSha256: inventory.tarSha256, files: inventory.files };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [mode, directory] = process.argv.slice(2);
  assert.ok(["prepare", "admission"].includes(mode));
  const api = endpoint => JSON.parse(execFileSync("gh", ["api", `repos/${original.repository}/${endpoint}`], { encoding: "utf8" }));
  const request = mode === "prepare" ? {
    operation: process.env.RESTORE_OPERATION,
    runId: process.env.RESTORE_RUN_ID,
    artifactId: process.env.RESTORE_ARTIFACT_ID,
    archiveDigest: process.env.RESTORE_ARTIFACT_DIGEST,
    sourceSha: process.env.RESTORE_SOURCE_SHA,
    tarSha256: process.env.RESTORE_TAR_SHA256 || "",
  } : JSON.parse(fs.readFileSync(path.join(directory, "restore-request.json"), "utf8"));
  const run = api(`actions/runs/${request.runId}`);
  let workflowMatchesCurrent = false;
  if (request.artifactId !== original.artifactId) {
    const content = api(`contents/.github/workflows/deploy.yml?ref=${run.head_sha}`);
    assert.match(run.head_sha, /^[0-9a-f]{40}$/);
    const comparison = api(`compare/${run.head_sha}...${process.env.GITHUB_SHA}`);
    assert.ok(["ahead", "identical"].includes(comparison.status));
    workflowMatchesCurrent = Buffer.from(content.content, "base64").equals(fs.readFileSync(".github/workflows/deploy.yml"));
  }
  const records = {
    run, artifact: api(`actions/artifacts/${request.artifactId}`),
    repository: api(""), environment: api("environments/github-pages"),
    branchPolicies: api("environments/github-pages/deployment-branch-policies").branch_policies,
    mainSha: api("branches/main").commit.sha, workflowMatchesCurrent,
  };
  validateRestore(request, records, process.env);
  fs.mkdirSync(directory, { recursive: true });
  if (mode === "prepare") {
    const archive = path.join(directory, "source.zip");
    execFileSync("gh", ["api", `repos/${original.repository}/actions/artifacts/${request.artifactId}/zip`, "--output", archive]);
    const output = path.join(directory, "verified");
    execFileSync("python3", ["qa/extract_restore_artifact.py", archive, output, request.archiveDigest, request.tarSha256], { stdio: "inherit" });
    const inventory = JSON.parse(fs.readFileSync(path.join(output, "tar-inventory.json"), "utf8"));
    if (request.artifactId !== original.artifactId) {
      const evidence = api(`actions/runs/${request.runId}/artifacts?per_page=100`).artifacts
        .filter(item => item.name === `restore-evidence-${request.runId}`);
      assert.equal(evidence.length, 1, "Preserved tar requires one original preservation provenance artifact");
      assert.equal(evidence[0].expired, false);
      assert.ok(Date.parse(evidence[0].expires_at) > Date.now());
      assert.ok(Date.parse(evidence[0].created_at) >= Date.parse(run.run_started_at));
      assert.ok(Date.parse(evidence[0].created_at) <= Date.parse(run.updated_at));
      const evidenceZip = path.join(directory, "preserved-provenance.zip");
      execFileSync("gh", ["api", `repos/${original.repository}/actions/artifacts/${evidence[0].id}/zip`, "--output", evidenceZip]);
      const digest = execFileSync("sha256sum", [evidenceZip], { encoding: "utf8" }).split(" ")[0];
      assert.equal(`sha256:${digest}`, evidence[0].digest);
      inventory.provenance = JSON.parse(execFileSync("python3", ["-c",
        "import sys,zipfile; z=zipfile.ZipFile(sys.argv[1]); assert z.namelist().count('restore-provenance.json')==1; print(z.read('restore-provenance.json').decode())",
        evidenceZip], { encoding: "utf8" }));
    }
    const provenance = validateInventory(request, inventory);
    fs.writeFileSync(path.join(output, "restore-provenance.json"), `${JSON.stringify(provenance, null, 2)}\n`);
    fs.writeFileSync(path.join(directory, "restore-request.json"), `${JSON.stringify(request, null, 2)}\n`);
    fs.writeFileSync(path.join(directory, "pages-integrity.json"), `${JSON.stringify({ schema: 1, candidateSha: original.sourceSha, files: inventory.files }, null, 2)}\n`);
    fs.writeFileSync(path.join(directory, "release-approval.json"), `${JSON.stringify({
      sourceSha: process.env.GITHUB_SHA, artifactSourceSha: original.sourceSha, operation: request.operation,
      original, restoredFrom: request, tarSha256: inventory.tarSha256,
    }, null, 2)}\n`);
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `## Verified exact restore bytes\n\nOperation: ${request.operation}; original source: \`${original.sourceSha}\`\n\nSource artifact: ${request.artifactId}; ZIP: ${request.archiveDigest}\n\nByte-identical tar SHA-256: \`${inventory.tarSha256}\`\n\nInventory files: ${Object.keys(inventory.files).length}. No rebuild or tar repack.\n`);
  } else {
    const receipt = JSON.parse(fs.readFileSync(path.join(directory, "preservation-receipt.json"), "utf8"));
    assert.deepEqual(receipt.original, original);
    const staged = api(`actions/artifacts/${receipt.preservedArtifactId}`);
    const zipDigest = receipt.preservedZipSha256.startsWith("sha256:")
      ? receipt.preservedZipSha256 : `sha256:${receipt.preservedZipSha256}`;
    assert.equal(staged.digest, zipDigest);
    assert.equal(staged.name, "github-pages");
    assert.equal(staged.workflow_run.id, Number(process.env.GITHUB_RUN_ID));
    assert.equal(staged.workflow_run.head_sha, process.env.GITHUB_SHA);
    assert.equal(staged.expired, false);
    assert.ok(Date.parse(staged.expires_at) > Date.now());
    const archive = path.join(directory, "staged.zip");
    execFileSync("gh", ["api", `repos/${original.repository}/actions/artifacts/${staged.id}/zip`, "--output", archive]);
    const output = path.join(directory, "verified-staged");
    execFileSync("python3", ["qa/extract_restore_artifact.py", archive, output, zipDigest, receipt.tarSha256], { stdio: "inherit" });
    const inventory = JSON.parse(fs.readFileSync(path.join(output, "tar-inventory.json"), "utf8"));
    inventory.provenance = JSON.parse(fs.readFileSync(path.join(directory, "restore-provenance.json"), "utf8"));
    validateInventory({ ...request, artifactId: String(staged.id), tarSha256: receipt.tarSha256 }, inventory);
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, "pages-integrity.json"), "utf8"));
    assert.equal(manifest.candidateSha, original.sourceSha);
    assert.deepEqual(manifest.files, inventory.files);
  }
}
