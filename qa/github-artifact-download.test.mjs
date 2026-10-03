import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { downloadArtifact } from "./github-artifact-download.mjs";

test("binary download uses supported gh args and file descriptor stdout without text encoding or buffers", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pages-download-"));
  try {
    const target = path.join(root, "artifact.zip");
    const bytes = Buffer.from([0, 255, 128, 80, 75]);
    let descriptor;
    downloadArtifact("owner/repo", "123", target, (command, args, options) => {
      assert.equal(command, "gh");
      assert.deepEqual(args, ["api", "-H", "Accept: application/vnd.github+json", "repos/owner/repo/actions/artifacts/123/zip"]);
      assert.deepEqual(Object.keys(options), ["stdio"]);
      assert.equal(options.stdio[0], "ignore");
      assert.equal(options.stdio[2], "pipe");
      descriptor = options.stdio[1];
      fs.writeSync(descriptor, bytes);
    });
    assert.deepEqual(fs.readFileSync(target), bytes);
    assert.throws(() => fs.fstatSync(descriptor), /EBADF/);
  } finally {
    fs.rmSync(root, { recursive: true });
  }
});

test("failed binary downloads close stdout, remove only their partial file and propagate errors", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "pages-download-"));
  try {
    const target = path.join(root, "partial.zip");
    const error = new Error("HTTP 403");
    let descriptor;
    assert.throws(() => downloadArtifact("owner/repo", "123", target, (_command, _args, options) => {
      descriptor = options.stdio[1];
      fs.writeSync(descriptor, Buffer.from("partial"));
      throw error;
    }), value => value === error);
    assert.equal(fs.existsSync(target), false);
    assert.throws(() => fs.fstatSync(descriptor), /EBADF/);
    fs.writeFileSync(target, "existing");
    assert.throws(() => downloadArtifact("owner/repo", "123", target), /EEXIST/);
    assert.equal(fs.readFileSync(target, "utf8"), "existing");
  } finally {
    fs.rmSync(root, { recursive: true });
  }
});
