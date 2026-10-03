import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { verifyDeployment, verifyLiveFiles } from "./pages-live-verification.mjs";

const [evidenceDirectory, pageUrl, outputPath] = process.argv.slice(2);
const repository = process.env.GITHUB_REPOSITORY;
const api = endpoint => JSON.parse(execFileSync("gh", ["api", `repos/${repository}/${endpoint}`], { encoding: "utf8" }));
const run = api(`actions/runs/${process.env.GITHUB_RUN_ID}/attempts/${process.env.GITHUB_RUN_ATTEMPT}`);
assert.equal(String(run.id), process.env.GITHUB_RUN_ID);
assert.equal(String(run.run_attempt), process.env.GITHUB_RUN_ATTEMPT);
assert.equal(run.head_sha, process.env.GITHUB_SHA);
const approval = JSON.parse(fs.readFileSync(path.join(evidenceDirectory, "release-approval.json"), "utf8"));
assert.equal(approval.sourceSha, run.head_sha);
const deployments = api("deployments?environment=github-pages&per_page=100");
const candidates = deployments.filter(item => item.sha === run.head_sha
  && item.environment === "github-pages" && item.ref === "main"
  && Date.parse(item.created_at) >= Date.parse(run.run_started_at));
const runLog = `https://github.com/${repository}/actions/runs/${run.id}`;
const matches = [];
for (const deployment of candidates) {
  const statuses = api(`deployments/${deployment.id}/statuses`);
  if (statuses.some(status => status.log_url === runLog || status.log_url === `${runLog}/attempts/${run.run_attempt}`)) {
    matches.push({ deployment, statuses });
  }
}
assert.equal(matches.length, 1, "Require one deployment bound to this exact run/attempt, not latest matching SHA");
const { deployment, statuses } = matches[0];
const status = verifyDeployment(deployment, statuses, run, repository, pageUrl);
const manifest = JSON.parse(fs.readFileSync(path.join(evidenceDirectory, "pages-integrity.json"), "utf8"));
assert.equal(manifest.candidateSha, run.head_sha);
const live = await verifyLiveFiles(manifest.files, pageUrl);
const rollback = JSON.parse(fs.readFileSync(path.join(evidenceDirectory, "rollback-evidence.json"), "utf8"));
const receipt = { current: { id: deployment.id, sha: deployment.sha, url: pageUrl, record: deployment, successfulStatus: status },
  publishingRun: { id: run.id, attempt: run.run_attempt, startedAt: run.run_started_at },
  approval, live, rollback: rollback.previousDeployment, rollbackSuccessfulStatus: rollback.successfulStatus };
fs.writeFileSync(outputPath, `${JSON.stringify(receipt, null, 2)}\n`);
fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
  `## Verified immutable static release\n\nSource: \`${deployment.sha}\`\n\nDeployment: ${deployment.id}; run: ${run.id}/${run.run_attempt}\n\nLive URL: ${pageUrl}; verified file hashes: ${live.verifiedFiles}\n\nPrevious deployment: ${rollback.previousDeployment.id} (\`${rollback.previousDeployment.sha}\`). Rollback execution remains unavailable.\n`);
