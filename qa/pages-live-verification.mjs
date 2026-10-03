import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

export function verifyDeployment(deployment, statuses, run, repository, pageUrl) {
  assert.equal(deployment.sha, run.head_sha);
  assert.equal(deployment.environment, "github-pages");
  assert.equal(deployment.ref, "main");
  assert.ok(Date.parse(deployment.created_at) >= Date.parse(run.run_started_at));
  const status = [...statuses].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0];
  assert.equal(status?.state, "success");
  assert.equal(status.environment_url?.replace(/\/$/, ""), pageUrl.replace(/\/$/, ""));
  const log = new URL(status.log_url);
  assert.equal(log.origin, "https://github.com");
  const prefix = `/${repository}/actions/runs/${run.id}`;
  assert.ok(log.pathname === prefix || log.pathname === `${prefix}/attempts/${run.run_attempt}`,
    "Deployment status must link to the exact publishing run/attempt");
  if (run.run_attempt !== 1) {
    assert.equal(log.pathname, `${prefix}/attempts/${run.run_attempt}`, "Reruns require explicit attempt evidence");
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
