import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { reauthorize } from "./pages-release-admission.mjs";
import {
  canonicalSingleOwnerApproval,
  inventoryFiles,
  treeDigest,
  validateRequest,
  verifyManifest,
} from "./pages-release-authorization.mjs";

function fixture() {
  const sourceSha = "a".repeat(40);
  const runId = 1234;
  const attempt = 2;
  const artifactId = 5678;
  const files = { "assets/app.js": "c".repeat(64), "index.html": "d".repeat(64) };
  const treeSha256 = treeDigest(files);
  const request = {
    approvalPolicy: "single-owner/v1",
    repositoryPolicy: "single-owner/v1",
    repository: "Yacinewhatchandcode/Yace19ai.com",
    ownerLogin: "Yacinewhatchandcode",
    ownerType: "User",
    actor: "yacinewhatchandcode",
    triggeringActor: "Yacinewhatchandcode",
    sourceSha,
    validationRunId: String(runId),
    validationAttempt: String(attempt),
    artifactId: String(artifactId),
    artifactZipSha256: `sha256:${"b".repeat(64)}`,
    treeSha256,
    releaseKind: "candidate",
    policyApproval: canonicalSingleOwnerApproval({
      repository: "Yacinewhatchandcode/Yace19ai.com",
      sourceSha,
      treeSha256,
      validationRunId: runId,
      artifactId,
    }),
    sourceIsAncestorOfMain: true,
    validationWorkflowMatchesCurrent: true,
    mainSha: sourceSha,
    repo: {
      id: 9,
      full_name: "Yacinewhatchandcode/Yace19ai.com",
      owner: { login: "Yacinewhatchandcode", type: "User" },
    },
    environment: {
      can_admins_bypass: true,
      protection_rules: [{
        type: "required_reviewers",
        prevent_self_review: false,
        reviewers: [{ type: "User", reviewer: { login: "Yacinewhatchandcode" } }],
      }],
      deployment_branch_policy: { custom_branch_policies: true, protected_branches: false },
    },
    branchPolicies: [{ name: "main", type: "branch" }],
    run: {
      id: runId,
      run_attempt: attempt,
      event: "workflow_dispatch",
      head_branch: "main",
      head_sha: sourceSha,
      status: "completed",
      conclusion: "success",
      path: ".github/workflows/deploy.yml",
      workflow_id: 99,
      repository: { full_name: "Yacinewhatchandcode/Yace19ai.com" },
      run_started_at: "2026-10-03T16:39:09Z",
      updated_at: "2026-10-03T16:40:20Z",
    },
    currentWorkflow: { id: 99 },
    artifact: {
      id: artifactId,
      name: `candidate-${sourceSha}`,
      digest: `sha256:${"b".repeat(64)}`,
      expired: false,
      created_at: "2026-10-03T16:40:15Z",
      workflow_run: {
        id: runId,
        head_sha: sourceSha,
        head_branch: "main",
        repository_id: 9,
        head_repository_id: 9,
      },
    },
  };
  return { request, files, sourceSha, treeSha256 };
}

test("single-owner release requires exact owner, policy, main SHA, run, artifact, digest and consent", () => {
  const { request } = fixture();
  assert.equal(validateRequest(request).approvalPolicy, "single-owner/v1");
  for (const change of [
    { actor: "not-the-owner" },
    { triggeringActor: "not-the-owner" },
    { ownerType: "Organization" },
    { repositoryPolicy: "required-reviewers/v1" },
    { sourceIsAncestorOfMain: false },
    { run: { ...request.run, head_sha: "f".repeat(40) } },
    { validationWorkflowMatchesCurrent: false },
    { validationAttempt: "1" },
    { artifact: { ...request.artifact, workflow_run: { ...request.artifact.workflow_run, head_sha: "e".repeat(40) } } },
    { artifactZipSha256: `sha256:${"f".repeat(64)}` },
    { policyApproval: `${request.policyApproval}:wrong` },
    { branchPolicies: [{ name: "*", type: "branch" }] },
  ]) {
    assert.throws(() => validateRequest({ ...request, ...change }), JSON.stringify(change));
  }
  const selfReviewAllowed = {
    ...request,
    environment: {
      ...request.environment,
      protection_rules: [{ ...request.environment.protection_rules[0], prevent_self_review: true }],
    },
  };
  assert.equal(validateRequest(selfReviewAllowed).approvalPolicy, "single-owner/v1");
});

test("reviewer policy accepts the configured required-reviewer environment without rewriting its settings", () => {
  const { request } = fixture();
  const reviewers = {
    type: "required_reviewers",
    prevent_self_review: false,
    reviewers: [{ type: "User" }],
  };
  const reviewerRequest = {
    ...request,
    approvalPolicy: "required-reviewers/v1",
    repositoryPolicy: undefined,
    actor: "another-user",
    environment: {
      can_admins_bypass: true,
      protection_rules: [reviewers],
      deployment_branch_policy: { custom_branch_policies: true, protected_branches: false },
    },
  };
  assert.equal(validateRequest(reviewerRequest).approvalPolicy, "required-reviewers/v1");
  assert.throws(() => validateRequest({ ...reviewerRequest, environment: { ...reviewerRequest.environment, protection_rules: [{ ...reviewers, reviewers: [] }] } }));
  const protectedBranches = {
    ...reviewerRequest,
    environment: {
      ...reviewerRequest.environment,
      deployment_branch_policy: { custom_branch_policies: true, protected_branches: true },
    },
  };
  assert.equal(validateRequest(protectedBranches).approvalPolicy, "required-reviewers/v1");
});

test("manifest verifier binds exact static files, source SHA and canonical tree digest", () => {
  const { files, sourceSha, treeSha256 } = fixture();
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "yace-pages-auth-"));
  try {
    const root = path.join(temporary, "dist");
    fs.mkdirSync(path.join(root, "assets"), { recursive: true });
    fs.writeFileSync(path.join(root, "assets/app.js"), "app");
    fs.writeFileSync(path.join(root, "index.html"), "index");
    const actualFiles = inventoryFiles(root);
    const manifest = { schema: 1, candidateSha: sourceSha, files: actualFiles };
    assert.equal(verifyManifest(manifest, sourceSha, actualFiles), treeDigest(actualFiles));
    assert.throws(() => verifyManifest(manifest, "f".repeat(40), actualFiles));
    assert.throws(() => verifyManifest(manifest, sourceSha, { ...actualFiles, "extra.txt": "0".repeat(64) }));
    assert.notEqual(treeSha256, treeDigest(actualFiles));
    fs.symlinkSync(path.join(root, "index.html"), path.join(root, "assets/link"));
    assert.throws(() => inventoryFiles(root), /Symlink forbidden/);
  } finally {
    fs.rmSync(temporary, { recursive: true });
  }
});

test("environment admission rechecks actors, opt-in, branch policy and artifact expiry from fresh API records", () => {
  const { request } = fixture();
  const records = {
    "": request.repo,
    "actions/variables/STATIC_RELEASE_APPROVAL_POLICY": { value: request.repositoryPolicy },
    "environments/github-pages": request.environment,
    "environments/github-pages/deployment-branch-policies": { branch_policies: request.branchPolicies },
    [`actions/artifacts/${request.artifactId}`]: request.artifact,
    [`actions/runs/${request.validationRunId}/attempts/${request.validationAttempt}`]: request.run,
    "actions/workflows/deploy.yml": request.currentWorkflow,
    "branches/main": { commit: { sha: request.sourceSha } },
  };
  const context = { GITHUB_REPOSITORY: request.repository, GITHUB_SHA: request.sourceSha,
    GITHUB_ACTOR: request.actor, TRIGGERING_ACTOR: request.triggeringActor };
  assert.equal(reauthorize(request, context, key => records[key]).sourceSha, request.sourceSha);
  for (const [key, value] of [
    ["actions/variables/STATIC_RELEASE_APPROVAL_POLICY", { value: "disabled" }],
    [`actions/artifacts/${request.artifactId}`, { ...request.artifact, expired: true }],
    ["environments/github-pages/deployment-branch-policies", { branch_policies: [{ name: "*", type: "branch" }] }],
    ["branches/main", { commit: { sha: "b".repeat(40) } }],
  ]) {
    assert.throws(() => reauthorize(request, context, endpoint => endpoint === key ? value : records[endpoint]));
  }
  assert.throws(() => reauthorize(request, { ...context, TRIGGERING_ACTOR: "someone-else" }, key => records[key]));
});
