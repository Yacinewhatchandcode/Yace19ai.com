import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { original, reviewedPreserved, validateRestore, validateInventory } from "./pages-restore.mjs";

function fixture() {
  const context = { GITHUB_REPOSITORY: original.repository, GITHUB_REF: "refs/heads/main",
    GITHUB_SHA: "a".repeat(40), GITHUB_ACTOR: "Yacinewhatchandcode", TRIGGERING_ACTOR: "Yacinewhatchandcode" };
  const request = { operation: "preserve", runId: original.runId, artifactId: original.artifactId,
    archiveDigest: original.archiveDigest, sourceSha: original.sourceSha, tarSha256: "" };
  const records = {
    mainSha: context.GITHUB_SHA,
    repository: { id: 9, full_name: original.repository, owner: { type: "User", login: "Yacinewhatchandcode" } },
    branchPolicies: [{ name: "main", type: "branch" }],
    environment: { deployment_branch_policy: { custom_branch_policies: true },
      protection_rules: [{ type: "required_reviewers", reviewers: [{ type: "User", reviewer: { login: "Yacinewhatchandcode" } }] }] },
    run: { id: Number(original.runId), head_sha: original.sourceSha, event: "workflow_dispatch",
      path: ".github/workflows/deploy.yml", head_branch: "main", status: "completed", conclusion: "success",
      repository: { full_name: original.repository }, run_started_at: "2026-10-03T14:29:00Z", updated_at: "2026-10-03T14:31:00Z" },
    artifact: { id: Number(original.artifactId), name: "github-pages", digest: original.archiveDigest,
      expired: false, expires_at: "2099-01-01T00:00:00Z", created_at: "2026-10-03T14:30:00Z",
      workflow_run: { id: Number(original.runId), head_sha: original.sourceSha, repository_id: 9, head_repository_id: 9 } },
  };
  return { context, request, records };
}

test("original restore/preserve binds only the pinned successful main artifact and owner", () => {
  const { context, request, records } = fixture();
  assert.equal(validateRestore(request, records, context), request);
  assert.equal(validateRestore({ ...request, operation: "restore" }, records, context).operation, "restore");
  for (const change of [{ sourceSha: context.GITHUB_SHA }, { runId: "123" }, { archiveDigest: `sha256:${"a".repeat(64)}` }]) {
    assert.throws(() => validateRestore({ ...request, ...change }, records, context));
  }
  for (const change of [{ GITHUB_REF: "refs/heads/other" }, { GITHUB_ACTOR: "another-user" }, { TRIGGERING_ACTOR: "another-user" }]) {
    assert.throws(() => validateRestore(request, records, { ...context, ...change }));
  }
  for (const change of [
    { artifact: { ...records.artifact, expired: true } },
    { artifact: { ...records.artifact, expires_at: "2020-01-01T00:00:00Z" } },
    { run: { ...records.run, conclusion: "failure" } },
    { branchPolicies: [{ name: "*", type: "branch" }] },
  ]) assert.throws(() => validateRestore(request, { ...records, ...change }, context));
});

test("preserved wrappers require independent reviewed tar digest and trusted owner main preservation run", () => {
  const { context, request, records } = fixture();
  const tarSha256 = "b".repeat(64);
  const preserved = { ...request, artifactId: "456", runId: "123", archiveDigest: `sha256:${"c".repeat(64)}`, tarSha256 };
  const run = { ...records.run, id: 123, head_sha: context.GITHUB_SHA,
    actor: { login: context.GITHUB_ACTOR }, triggering_actor: { login: context.TRIGGERING_ACTOR } };
  const artifact = { ...records.artifact, id: 456, digest: preserved.archiveDigest,
    workflow_run: { ...records.artifact.workflow_run, id: 123, head_sha: run.head_sha } };
  const fresh = { ...records, run, artifact, workflowMatchesCurrent: true };
  validateRestore(preserved, fresh, context);
  assert.throws(() => validateRestore({ ...preserved, tarSha256: "" }, fresh, context));
  assert.throws(() => validateRestore(preserved, { ...fresh, workflowMatchesCurrent: false }, context));
  const files = { "index.html": "d".repeat(64) };
  const provenance = { original, tarSha256, files };
  assert.equal(validateInventory(preserved, { tarSha256, files, provenance }).tarSha256, tarSha256);
  assert.throws(() => validateInventory(preserved, { tarSha256: "e".repeat(64), files, provenance }));
  assert.throws(() => validateInventory(preserved, { tarSha256, files, provenance: { ...provenance, original: { ...original, runId: "999" } } }));
});

test("preserve is deployment-free and candidate source enforcement remains separate", () => {
  const workflow = fs.readFileSync(".github/workflows/deploy.yml", "utf8");
  const prepare = workflow.split("\n  prepare-restore:")[1].split("\n  restore:")[0];
  assert.ok(!prepare.includes("actions/deploy-pages"));
  assert.ok(!prepare.includes("pages: write"));
  assert.ok(!prepare.includes("id-token: write"));
  assert.ok(!prepare.includes("actions/upload-pages-artifact"));
  assert.match(workflow, /inputs\.operation == 'candidate' && inputs\.publish/);
  assert.match(workflow, /inputs\.operation == 'restore' && inputs\.publish == false/);
  assert.match(workflow, /test "\$SOURCE_SHA" = "\$RELEASE_WORKFLOW_SHA"/);
  assert.match(prepare, /path: \$\{\{ runner.temp \}\}\/restore\/verified\/artifact\.tar/);
});

test("reviewed historical preservation is pinned despite the subsequent workflow correction", () => {
  const { context, request, records } = fixture();
  const preserved = { ...request, ...reviewedPreserved, sourceSha: original.sourceSha };
  const run = { ...records.run, id: Number(preserved.runId), head_sha: reviewedPreserved.sourceSha,
    run_attempt: 1, actor: { login: context.GITHUB_ACTOR }, triggering_actor: { login: context.TRIGGERING_ACTOR } };
  const artifact = { ...records.artifact, id: Number(preserved.artifactId), digest: preserved.archiveDigest,
    workflow_run: { ...records.artifact.workflow_run, id: run.id, head_sha: run.head_sha } };
  const fresh = { ...records, run, artifact, workflowMatchesCurrent: false };
  validateRestore(preserved, fresh, context);
  for (const change of [{ tarSha256: "c".repeat(64) }, { runId: "123" },
    { archiveDigest: `sha256:${"d".repeat(64)}` }]) {
    assert.throws(() => validateRestore({ ...preserved, ...change }, fresh, context));
  }
  assert.throws(() => validateRestore(preserved, { ...fresh, run: { ...run, run_attempt: 2 } }, context));
  assert.throws(() => validateRestore(preserved, { ...fresh, run: { ...run, head_sha: context.GITHUB_SHA },
    artifact: { ...artifact, workflow_run: { ...artifact.workflow_run, head_sha: context.GITHUB_SHA } } }, context));
});

function assertSkippedAncestorGates(workflow) {
  const jobs = new Map([...workflow.split("\njobs:\n")[1].matchAll(
    /^  ([\w-]+):\n([\s\S]*?)(?=^  [\w-]+:\n|$(?![\s\S]))/gm,
  )].map(([, name, body]) => [name, {
    condition: body.match(/^    if: (.+)$/m)?.[1] || "",
    needs: (body.match(/^    needs: (.+)$/m)?.[1] || "")
      .replace(/[[\]]/g, "").split(",").map(value => value.trim()).filter(Boolean),
  }]));
  const skippedRoots = new Set();
  for (const job of jobs.values()) {
    for (const [, skipped] of job.condition.matchAll(/needs\.([\w-]+)\.result == 'skipped'/g)) {
      assert.ok(job.needs.includes(skipped));
      assert.ok(job.condition.includes("always()"), "Skipped-result bridge must override implicit success()");
      skippedRoots.add(skipped);
    }
  }
  function hasSkippedAncestor(name) {
    return jobs.get(name).needs.some(dependency =>
      skippedRoots.has(dependency) || hasSkippedAncestor(dependency));
  }
  for (const [name, job] of jobs) {
    if (!hasSkippedAncestor(name)) continue;
    assert.ok(/always\(\)|!cancelled\(\)/.test(job.condition), `${name} must override skipped ancestor success()`);
    for (const dependency of job.needs) {
      const expected = skippedRoots.has(dependency) ? "skipped" : "success";
      assert.ok(job.condition.includes(`needs.${dependency}.result == '${expected}'`),
        `${name} must explicitly gate ${dependency} result`);
    }
  }
  return { jobs, hasSkippedAncestor };
}

test("skipped-ancestor release jobs override implicit success with explicit dependency result gates", () => {
  const workflow = fs.readFileSync(".github/workflows/deploy.yml", "utf8");
  const { jobs, hasSkippedAncestor } = assertSkippedAncestorGates(workflow);
  assert.deepEqual(jobs.get("deploy").needs, ["prepare-release"]);
  assert.ok(hasSkippedAncestor("deploy"));
  assert.deepEqual(jobs.get("restore").needs, ["prepare-restore"]);
  assert.equal(jobs.get("prepare-restore").needs.length, 0);
  assert.equal(hasSkippedAncestor("restore"), false);
  assert.throws(() => assertSkippedAncestorGates(workflow.replace(
    "if: ${{ !cancelled() && github.event_name == 'workflow_dispatch' && inputs.operation == 'candidate' && inputs.publish && needs.prepare-release.result == 'success' }}",
    "if: github.event_name == 'workflow_dispatch' && inputs.operation == 'candidate' && inputs.publish",
  )));
  assert.throws(() => assertSkippedAncestorGates(workflow.replace(
    " && needs.prepare-release.result == 'success'", "",
  )));
});

test("actual deploy job graph and inputs admit skipped validation only after successful preparation and never cancellation", () => {
  const workflow = fs.readFileSync(".github/workflows/deploy.yml", "utf8");
  const { jobs } = assertSkippedAncestorGates(workflow);
  const condition = jobs.get("deploy").condition.replace(/^\$\{\{\s*|\s*\}\}$/g, "");
  assert.ok(condition.includes("!cancelled()"));
  assert.deepEqual(jobs.get("deploy").needs, ["prepare-release"]);
  assert.deepEqual(jobs.get("prepare-release").needs, ["validate"]);
  assert.ok(jobs.get("prepare-release").condition.includes("needs.validate.result == 'skipped'"));
  const baseline = { cancelled: false, event: "workflow_dispatch", operation: "candidate",
    publish: true, validate: "skipped", prepare: "success" };
  function reachable(context) {
    return condition.split(/\s*&&\s*/).every(clause => {
      switch (clause) {
        case "!cancelled()": return !context.cancelled;
        case "github.event_name == 'workflow_dispatch'": return context.event === "workflow_dispatch";
        case "inputs.operation == 'candidate'": return context.operation === "candidate";
        case "inputs.publish": return context.publish;
        case "needs.prepare-release.result == 'success'": return context.prepare === "success";
        default: assert.fail(`Uncovered real deploy condition: ${clause}`);
      }
    });
  }
  assert.equal(reachable(baseline), true);
  for (const change of [
    { prepare: "failure" }, { prepare: "skipped" }, { prepare: "cancelled" },
    { cancelled: true }, { publish: false }, { operation: "restore" },
    { operation: "preserve" }, { event: "pull_request" },
  ]) assert.equal(reachable({ ...baseline, ...change }), false, JSON.stringify(change));
});
