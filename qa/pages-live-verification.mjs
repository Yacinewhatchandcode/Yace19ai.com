import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

export function deploymentLogBinding(logUrl, run, repository) {
  const log = new URL(logUrl);
  assert.equal(log.origin, "https://github.com");
  assert.equal(log.search, "");
  assert.equal(log.hash, "");
  const prefix = `/${repository}/actions/runs/${run.id}`;
  if (log.pathname === prefix) {
    assert.equal(run.run_attempt, 1, "Reruns require explicit attempt or job evidence");
    return { jobId: null };
  }
  if (log.pathname === `${prefix}/attempts/${run.run_attempt}`) return { jobId: null };
  const suffix = log.pathname.startsWith(`${prefix}/job/`) ? log.pathname.slice(`${prefix}/job/`.length) : "";
  assert.match(suffix, /^[1-9][0-9]*$/, "Deployment log must bind to the exact run and a positive job ID");
  return { jobId: suffix };
}

export function verifyDeployment(deployment, statuses, run, repository, pageUrl, job = null) {
  assert.equal(deployment.sha, run.head_sha);
  assert.equal(deployment.environment, "github-pages");
  assert.equal(deployment.ref, "main");
  assert.ok(Date.parse(deployment.created_at) >= Date.parse(run.run_started_at));
  const status = [...statuses].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0];
  assert.equal(status?.state, "success");
  assert.equal(status.environment_url?.replace(/\/$/, ""), pageUrl.replace(/\/$/, ""));
  const { jobId } = deploymentLogBinding(status.log_url, run, repository);
  if (jobId) {
    assert.equal(String(job?.id), jobId);
    assert.equal(job.run_id, run.id, "Deployment job must belong to the publishing run");
    assert.equal(job.run_attempt, run.run_attempt, "Deployment job must belong to the publishing attempt");
    assert.equal(job.html_url, status.log_url, "Deployment job URL must match the provider status log");
    assert.equal(job.status, "completed", "Receipt requires a completed deployment job");
    assert.equal(job.conclusion, "success", "Receipt requires a successful deployment job");
  }
  return status;
}

export async function verifyLiveFiles(files, baseUrl, fetchFile = fetch) {
  const base = new URL(baseUrl);
  assert.equal(base.origin, "https://yace19ai.com");
  assert.ok(files["index.html"], "Missing reviewed index");
  let verified = 0;
  for (const [relative, expected] of Object.entries(files)) {
    assert.ok(!relative.startsWith("/") && !relative.split("/").includes(".."));
    const url = new URL(relative === "index.html" ? "/" : relative.split("/").map(encodeURIComponent).join("/"), `${base.origin}/`);
    const response = await fetchFile(url, { redirect: "error", signal: AbortSignal.timeout(120_000) });
    assert.equal(response.status, 200, `Live artifact request failed: ${relative}`);
    const hash = createHash("sha256");
    for await (const chunk of response.body) hash.update(chunk);
    assert.equal(hash.digest("hex"), expected, `Live bytes differ from reviewed artifact: ${relative}`);
    verified++;
  }
  return { verifiedFiles: verified };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [manifestPath, pageUrl, outputPath] = process.argv.slice(2);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const result = await verifyLiveFiles(manifest.files, pageUrl);
  fs.writeFileSync(outputPath, `${JSON.stringify(result)}\n`);
}
