import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { readReceiptEvidence } from "./pages-receipt-evidence.mjs";

test("receipt reader consumes candidate LCA layout and restore layout, requiring every input", () => {
  for (const restoring of [false, true]) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "receipt-evidence-"));
    const sha = "a".repeat(40);
    const manifestPath = restoring ? "pages-integrity.json" : "reviewed-artifact/pages-integrity.json";
    const inputs = {
      "release-approval.json": { sourceSha: sha, ...(restoring ? { operation: "restore", artifactSourceSha: sha } : {}) },
      [manifestPath]: { candidateSha: sha, files: { "index.html": "b".repeat(64) } },
      ...(!restoring ? { "rollback-evidence.json": { previousDeployment: { id: 123 }, successfulStatus: { state: "success" } } } : {}),
    };
    try {
      for (const [relative, value] of Object.entries(inputs)) {
        fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
        fs.writeFileSync(path.join(root, relative), JSON.stringify(value));
      }
      assert.equal(readReceiptEvidence(root).manifest.candidateSha, sha);
      for (const relative of Object.keys(inputs)) {
        const file = path.join(root, relative);
        const value = fs.readFileSync(file);
        fs.unlinkSync(file);
        assert.throws(() => readReceiptEvidence(root));
        fs.writeFileSync(file, value);
      }
      const duplicate = path.join(root, "other/pages-integrity.json");
      fs.mkdirSync(path.dirname(duplicate));
      fs.writeFileSync(duplicate, JSON.stringify(inputs[manifestPath]));
      assert.throws(() => readReceiptEvidence(root), /exact single producer manifest/);
    } finally {
      fs.rmSync(root, { recursive: true });
    }
  }
});
