import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { repositoryApi } from "./github-repository-api.mjs";
import { deploymentLogBinding, verifyDeployment, verifyLiveFiles } from "./pages-live-verification.mjs";
import { readReceiptEvidence } from "./pages-receipt-evidence.mjs";

const [evidenceDirectory, pageUrl, outputPath] = process.argv.slice(2);
const repository = process.env.GITHUB_REPOSITORY;
const api = repositoryApi(repository);
const run = api(`actions/runs/${process.env.GITHUB_RUN_ID}/attempts/${process.env.GITHUB_RUN_ATTEMPT}`);
assert.equal(String(run.id), process.env.GITHUB_RUN_ID);
assert.equal(String(run.run_attempt), process.env.GITHUB_RUN_ATTEMPT);
assert.equal(run.head_sha, process.env.GITHUB_SHA);
const { approval, manifest, rollback } = readReceiptEvidence(evidenceDirectory);
assert.equal(approval.sourceSha, run.head_sha);
const deployments = api("deployments?environment=github-pages&per_page=100");
const candidates = deployments.filter(item => item.sha === run.head_sha
  && item.environment === "github-pages" && item.ref === "main"
  && Date.parse(item.created_at) >= Date.parse(run.run_started_at));
const matches = [];
for (const deployment of candidates) {
  const statuses = api(`deployments/${deployment.id}/statuses`);
  const latest = [...statuses].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0];
  const runPath = `/${repository}/actions/runs/${run.id}`;
  if (latest?.log_url) {
    const log = new URL(latest.log_url);
    if (log.origin !== "https://github.com" || !(log.pathname === runPath || log.pathname.startsWith(`${runPath}/`))) continue;
    const { jobId } = deploymentLogBinding(latest.log_url, run, repository);
    const job = jobId ? api(`actions/jobs/${jobId}`) : null;
    matches.push({ deployment, statuses, job });
  }
}
assert.equal(matches.length, 1, "Require one deployment bound to this exact run/attempt, not latest matching SHA");
const { deployment, statuses, job } = matches[0];
const status = verifyDeployment(deployment, statuses, run, repository, pageUrl, job);
assert.equal(manifest.candidateSha, approval.artifactSourceSha ?? run.head_sha);
const live = await verifyLiveFiles(manifest.files, pageUrl);
const receipt = { current: { id: deployment.id, sha: deployment.sha, url: pageUrl, record: deployment, successfulStatus: status },
  artifactSourceSha: manifest.candidateSha,
  publishingRun: { id: run.id, attempt: run.run_attempt, startedAt: run.run_started_at, deploymentJob: job },
  approval, live, rollback: rollback.previousDeployment, rollbackSuccessfulStatus: rollback.successfulStatus };
fs.writeFileSync(outputPath, `${JSON.stringify(receipt, null, 2)}\n`);
fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
  `## Verified immutable static release\n\nTooling/deployment SHA: \`${deployment.sha}\`; content SHA: \`${manifest.candidateSha}\`\n\nDeployment: ${deployment.id}; run: ${run.id}/${run.run_attempt}\n\nLive URL: ${pageUrl}; verified file hashes: ${live.verifiedFiles}\n\nPrevious deployment: ${rollback.previousDeployment?.id ?? "restore operation"}; original tar: ${approval.tarSha256 ?? "candidate artifact"}.\n`);
