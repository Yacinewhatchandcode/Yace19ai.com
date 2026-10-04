import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { verifyDeployment, verifyLiveFiles } from "./pages-live-verification.mjs";

test("deployment evidence binds SHA, timestamp, status URL and exact run attempt", () => {
  const run = { id: 123, run_attempt: 1, head_sha: "a".repeat(40), run_started_at: "2026-10-03T18:00:00Z" };
  const deployment = { sha: run.head_sha, ref: "main", environment: "github-pages", created_at: "2026-10-03T18:01:00Z" };
  const status = { state: "success", environment_url: "https://yace19ai.com/", log_url: "https://github.com/owner/repo/actions/runs/123", created_at: "2026-10-03T18:02:00Z" };
  assert.equal(verifyDeployment(deployment, [status], run, "owner/repo", status.environment_url), status);
  for (const change of [{ log_url: "https://github.com/owner/repo/actions/runs/124" }, { state: "failure" }, { environment_url: "https://example.com/" }]) {
    assert.throws(() => verifyDeployment(deployment, [{ ...status, ...change }], run, "owner/repo", status.environment_url));
  }
  assert.throws(() => verifyDeployment(deployment, [status], { ...run, run_attempt: 2 }, "owner/repo", status.environment_url));
  assert.throws(() => verifyDeployment({ ...deployment, sha: "b".repeat(40) }, [status], run, "owner/repo", status.environment_url));
});

test("live verification hashes index, routes and assets and rejects stale content", async () => {
  const digest = value => createHash("sha256").update(value).digest("hex");
  const files = { "index.html": digest("index"), "fleet/index.html": digest("route"), "assets/app.js": digest("asset") };
  const bodies = ["index", "route", "asset"];
  let index = 0;
  assert.deepEqual(await verifyLiveFiles(files, "https://yace19ai.com/", async () => new Response(bodies[index++])), { verifiedFiles: 3 });
  await assert.rejects(verifyLiveFiles(files, "https://yace19ai.com/", async () => new Response("old")), /Live bytes differ/);
  await assert.rejects(verifyLiveFiles(files, "https://example.com/", async () => new Response("index")));
});

test("real Pages job log shape is verified through exact job API run and attempt", () => {
  const repository = "Yacinewhatchandcode/Yace19ai.com";
  const run = { id: 37129793980, run_attempt: 1, head_sha: "a".repeat(40), run_started_at: "2026-10-03T10:00:00Z" };
  const deployment = { sha: run.head_sha, ref: "main", environment: "github-pages", created_at: "2026-10-03T10:01:00Z" };
  const status = { state: "success", environment_url: "https://yace19ai.com/",
    log_url: "https://github.com/Yacinewhatchandcode/Yace19ai.com/actions/runs/37129793980/job/111222465858",
    created_at: "2026-10-03T10:02:00Z" };
  const job = { id: 111222465858, run_id: run.id, run_attempt: 1, html_url: status.log_url,
    status: "completed", conclusion: "success" };
  assert.equal(verifyDeployment(deployment, [status], run, repository, status.environment_url, job), status);
  assert.equal(verifyDeployment(deployment, [status], { ...run, run_attempt: 2 }, repository, status.environment_url,
    { ...job, run_attempt: 2 }), status);
  for (const change of [{ run_id: 123 }, { run_attempt: 2 }, { id: 123 }]) {
    assert.throws(() => verifyDeployment(deployment, [status], run, repository, status.environment_url, { ...job, ...change }));
  }
  assert.throws(() => verifyDeployment(deployment, [status], run, repository, status.environment_url));
  for (const suffix of ["/extra", "?attempt=1", "/../111222465859"]) {
    assert.throws(() => verifyDeployment(deployment, [{ ...status, log_url: status.log_url + suffix }], run, repository, status.environment_url, job));
  }
});

test("Pages lifecycle requires completed owner-environment job before independent receipt verification", () => {
  const repository = "Yacinewhatchandcode/Yace19ai.com";
  const run = { id: 37178884100, run_attempt: 1, head_sha: "a".repeat(40), run_started_at: "2026-10-04T05:00:00Z" };
  const deployment = { id: 6837084407, sha: run.head_sha, ref: "main", environment: "github-pages",
    created_at: "2026-10-04T05:01:00Z" };
  const logUrl = `https://github.com/${repository}/actions/runs/${run.id}/job/111222465858`;
  const pending = { state: "in_progress", environment_url: "https://yace19ai.com/", log_url: logUrl,
    created_at: "2026-10-04T05:01:01Z" };
  const job = { id: 111222465858, run_id: run.id, run_attempt: 1, html_url: logUrl,
    status: "in_progress", conclusion: null };
  assert.throws(() => verifyDeployment(deployment, [pending], run, repository, pending.environment_url, job));
  const success = { ...pending, state: "success", created_at: "2026-10-04T05:02:00Z" };
  assert.throws(() => verifyDeployment(deployment, [success], run, repository, pending.environment_url, job));
  const completed = { ...job, status: "completed", conclusion: "success" };
  assert.equal(verifyDeployment(deployment, [pending, success], run, repository, pending.environment_url, completed), success);
  assert.throws(() => verifyDeployment(deployment, [success], run, repository, pending.environment_url,
    { ...completed, conclusion: "failure" }));
});
