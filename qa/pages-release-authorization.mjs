import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const canonicalSingleOwnerApproval = ({
  repository,
  sourceSha,
  treeSha256,
  validationRunId,
  artifactId,
}) => `single-owner/v1:${repository}:${sourceSha}:${treeSha256}:${validationRunId}:${artifactId}`;

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function treeDigest(files) {
  const entries = Object.entries(files).sort(([left], [right]) => Buffer.compare(Buffer.from(left), Buffer.from(right)));
  const canonical = entries.map(([file, digest]) => `${file}\0${digest}\n`).join("");
  return createHash("sha256").update(canonical).digest("hex");
}

function inventoryFiles(directory, prefix = "") {
  const files = {};
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    assert.ok(!/[\u0000-\u001f\u007f]/u.test(relative), `Control character forbidden in artifact path: ${JSON.stringify(relative)}`);
    const absolute = path.join(directory, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Symlink forbidden in artifact: ${relative}`);
    if (entry.isDirectory()) Object.assign(files, inventoryFiles(absolute, relative));
    else {
      assert.ok(entry.isFile(), `Non-static artifact entry: ${relative}`);
      files[relative] = createHash("sha256").update(fs.readFileSync(absolute)).digest("hex");
    }
  }
  return files;
}

function validateRequest(request) {
  const {
    approvalPolicy,
    repositoryPolicy,
    repository,
    ownerLogin,
    ownerType,
    actor,
    triggeringActor,
    sourceSha,
    validationRunId,
    validationAttempt,
    artifactId,
    artifactZipSha256,
    treeSha256,
    releaseKind,
    policyApproval,
    mainSha,
    sourceIsAncestorOfMain,
    validationWorkflowMatchesCurrent,
    repo,
    currentWorkflow,
    environment,
    branchPolicies,
    run,
    artifact,
  } = request;

  assert.equal(repository, "Yacinewhatchandcode/Yace19ai.com", "Unexpected release repository");
  assert.equal(repo.full_name, repository);
  assert.equal(repo.owner.login.toLowerCase(), ownerLogin.toLowerCase());
  assert.equal(repo.owner.type, ownerType);
  assert.equal(ownerLogin.toLowerCase(), "yacinewhatchandcode");
  assert.match(sourceSha, /^[0-9a-f]{40}$/, "Invalid source commit SHA");
  assert.match(mainSha, /^[0-9a-f]{40}$/, "Invalid current main SHA");
  assert.equal(sourceIsAncestorOfMain, true, "Release source must be reachable from main");
  assert.match(validationRunId, /^[1-9][0-9]*$/, "Invalid validation run ID");
  assert.match(validationAttempt, /^[1-9][0-9]*$/, "Invalid validation attempt");
  assert.match(run.head_sha, /^[0-9a-f]{40}$/, "Invalid validation workflow SHA");
  assert.equal(run.head_sha, sourceSha, "The validated source must be the main commit that triggered its run");
  assert.equal(validationWorkflowMatchesCurrent, true, "Validation must use the current protected workflow definition");
  assert.match(artifactId, /^[1-9][0-9]*$/, "Invalid artifact ID");
  assert.match(artifactZipSha256, /^sha256:[0-9a-f]{64}$/, "Invalid artifact archive digest");
  assert.match(treeSha256, /^[0-9a-f]{64}$/, "Invalid static tree digest");

  assert.equal(run.id, Number(validationRunId));
  assert.equal(run.run_attempt, Number(validationAttempt));
  assert.equal(run.event, "workflow_dispatch", "Only a manual main validation run is eligible");
  assert.equal(run.head_branch, "main");
  assert.equal(run.status, "completed");
  assert.equal(run.conclusion, "success");
  assert.equal(run.path, ".github/workflows/deploy.yml");
  assert.equal(run.repository.full_name, repository);
  assert.equal(run.workflow_id, currentWorkflow.id, "Validation must use this release workflow");

  assert.equal(artifact.id, Number(artifactId));
  assert.equal(artifact.name, `candidate-${sourceSha}`);
  assert.equal(artifact.digest, artifactZipSha256, "GitHub artifact archive digest mismatch");
  assert.equal(artifact.expired, false, "Validation artifact has expired");
  assert.equal(artifact.workflow_run.id, Number(validationRunId));
  assert.equal(artifact.workflow_run.run_attempt, Number(validationAttempt));
  assert.equal(artifact.workflow_run.head_sha, run.head_sha, "Artifact must originate from the exact validation run");
  assert.equal(artifact.workflow_run.head_sha, sourceSha);
  assert.equal(artifact.workflow_run.head_branch, "main");
  assert.equal(artifact.workflow_run.repository_id, repo.id);
  assert.equal(artifact.workflow_run.head_repository_id, repo.id);
  assert.ok(Date.parse(artifact.created_at) >= Date.parse(run.run_started_at), "Artifact predates its validation run");
  assert.ok(Date.parse(artifact.created_at) <= Date.parse(run.updated_at), "Artifact was not created by this completed run attempt");
  assert.equal(releaseKind, "candidate", "Only a source commit matching the main workflow run is deployable");

  assert.equal(branchPolicies.length, 1, "Production environment must allow exactly one ref");
  assert.equal(branchPolicies[0].name, "main");
  assert.equal(branchPolicies[0].type, "branch");
  assert.equal(environment.deployment_branch_policy.custom_branch_policies, true);
  const reviewerRule = environment.protection_rules.find(rule => rule.type === "required_reviewers");
  assert.ok(reviewerRule, "A required-reviewer rule is needed");
  assert.ok(reviewerRule.reviewers?.length > 0, "At least one GitHub user or team reviewer is required");

  if (approvalPolicy === "single-owner/v1") {
    assert.equal(repositoryPolicy, "single-owner/v1", "Single-owner release mode is not explicitly enabled");
    assert.equal(ownerType, "User", "Single-owner mode is restricted to personal repositories");
    assert.equal(actor.toLowerCase(), ownerLogin.toLowerCase(), "Only the repository owner may authorize a release");
    assert.equal(triggeringActor.toLowerCase(), ownerLogin.toLowerCase(), "Only the repository owner may rerun or trigger a release");
    const expected = canonicalSingleOwnerApproval({
      repository,
      sourceSha,
      treeSha256,
      validationRunId,
      artifactId,
    });
    assert.equal(policyApproval, expected, "Per-release consent does not match the exact source and artifact");
  } else {
    assert.equal(approvalPolicy, "required-reviewers/v1", "Unknown approval policy");
  }

  return {
    approvalPolicy,
    actor,
    repository,
    sourceSha,
    releaseKind,
    treeSha256,
    validationRunId,
    validationAttempt: Number(validationAttempt),
    artifactId: Number(artifactId),
    artifactZipSha256,
    consent: policyApproval,
  };
}

function verifyManifest(manifest, sourceSha, files) {
  assert.ok(manifest.schema === 1 || manifest.schema === "yace-pages/v1", "Unsupported YACE artifact manifest");
  assert.equal(manifest.candidateSha ?? manifest.sourceSha, sourceSha, "Static manifest source SHA mismatch");
  assert.deepEqual(files, manifest.files, "Downloaded static artifact differs from the reviewed manifest");
  const treeSha256 = treeDigest(files);
  if (manifest.treeSha256) assert.equal(manifest.treeSha256, treeSha256, "Static tree digest mismatch");
  return treeSha256;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "authorize") {
    const [requestPath, outputPath] = process.argv.slice(3);
    assert.ok(requestPath && outputPath, "Expected request and output JSON paths");
    const result = validateRequest(readJson(requestPath));
    fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
    console.log(`Authorized ${result.approvalPolicy} release request for ${result.sourceSha}`);
  } else if (process.argv[2] === "verify-manifest") {
    const [manifestPath, staticRoot, sourceSha] = process.argv.slice(3);
    assert.ok(manifestPath && staticRoot && sourceSha, "Expected manifest, extracted static directory and source SHA");
    const manifest = readJson(manifestPath);
    const files = inventoryFiles(staticRoot);
    console.log(JSON.stringify({ treeSha256: verifyManifest(manifest, sourceSha, files) }));
  } else if (process.argv[2] === "tree") {
    const [staticRoot] = process.argv.slice(3);
    assert.ok(staticRoot, "Expected extracted static directory");
    console.log(JSON.stringify({ treeSha256: treeDigest(inventoryFiles(staticRoot)) }));
  } else {
    throw new Error("Expected authorize or verify-manifest mode");
  }
}

export { canonicalSingleOwnerApproval, inventoryFiles, treeDigest, validateRequest, verifyManifest };
