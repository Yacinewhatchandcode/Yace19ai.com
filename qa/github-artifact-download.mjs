import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export function downloadArtifact(repository, artifactId, destination, execute = execFileSync) {
  assert.match(repository, /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
  assert.match(String(artifactId), /^[1-9][0-9]*$/);
  const descriptor = fs.openSync(destination, "wx");
  try {
    execute("gh", ["api", "-H", "Accept: application/vnd.github+json",
      `repos/${repository}/actions/artifacts/${artifactId}/zip`],
    { stdio: ["ignore", descriptor, "pipe"] });
  } catch (error) {
    fs.closeSync(descriptor);
    fs.unlinkSync(destination);
    throw error;
  }
  fs.closeSync(descriptor);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [repository, artifactId, destination] = process.argv.slice(2);
  downloadArtifact(repository, artifactId, destination);
}
