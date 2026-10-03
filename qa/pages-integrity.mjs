import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const [mode, root, sha, manifestPath] = process.argv.slice(2);
assert.ok(["create", "verify"].includes(mode), "Expected create or verify");
assert.match(sha || "", /^[0-9a-f]{40}$/, "Expected a full candidate SHA");
assert.ok(root && manifestPath, "Expected artifact directory and manifest path");

function inventory(directory, prefix = "") {
  const files = {};
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    assert.ok(!entry.isSymbolicLink(), `Symlink forbidden: ${relative}`);
    if (entry.isDirectory()) Object.assign(files, inventory(absolute, relative));
    else {
      assert.ok(entry.isFile(), `Non-static entry: ${relative}`);
      files[relative] = createHash("sha256").update(fs.readFileSync(absolute)).digest("hex");
    }
  }
  return files;
}

const files = inventory(root);
assert.ok(files["index.html"], "Missing static entry point");
if (mode === "create") {
  fs.writeFileSync(manifestPath, `${JSON.stringify({ schema: 1, candidateSha: sha, files }, null, 2)}\n`);
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.schema, 1);
  assert.equal(manifest.candidateSha, sha, "Artifact source SHA mismatch");
  assert.deepEqual(files, manifest.files, "Artifact SHA-256 inventory mismatch");
}
console.log(`Static artifact ${mode}: ${sha} (${Object.keys(files).length} files)`);
