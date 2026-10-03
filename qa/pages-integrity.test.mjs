import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

test("static artifact verification rejects wrong SHA, tampering, extra files and symlinks", () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "yace-integrity-"));
  const root = path.join(temporary, "dist");
  const manifest = path.join(temporary, "manifest.json");
  const sha = "a".repeat(40);
  function run(mode, candidate = sha) {
    return spawnSync(process.execPath, ["qa/pages-integrity.mjs", mode, root, candidate, manifest], { encoding: "utf8" });
  }
  try {
    fs.mkdirSync(root);
    fs.writeFileSync(path.join(root, "index.html"), "<h1>Static demo</h1>");
    assert.equal(run("create").status, 0);
    assert.equal(run("verify").status, 0);
    assert.notEqual(run("verify", "b".repeat(40)).status, 0);
    fs.writeFileSync(path.join(root, "index.html"), "<h1>Tampered</h1>");
    assert.notEqual(run("verify").status, 0);
    fs.writeFileSync(path.join(root, "index.html"), "<h1>Static demo</h1>");
    fs.writeFileSync(path.join(root, "extra.js"), "extra");
    assert.notEqual(run("verify").status, 0);
    fs.unlinkSync(path.join(root, "extra.js"));
    fs.symlinkSync(manifest, path.join(root, "link"));
    assert.notEqual(run("create").status, 0);
    assert.notEqual(run("verify").status, 0);
  } finally {
    fs.rmSync(temporary, { recursive: true });
  }
});
