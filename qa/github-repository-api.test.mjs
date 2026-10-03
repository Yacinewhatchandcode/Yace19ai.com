import assert from "node:assert/strict";
import test from "node:test";
import { repositoryApi } from "./github-repository-api.mjs";

test("repository API invokes gh with exact root and relative endpoint arguments", () => {
  const calls = [];
  const api = repositoryApi("Yacinewhatchandcode/Yace19ai.com", (...args) => {
    calls.push(args);
    return '{"ok":true}';
  });
  for (const endpoint of ["", "environments/github-pages", "environments/github-pages/deployment-branch-policies"]) {
    assert.deepEqual(api(endpoint), { ok: true });
  }
  assert.deepEqual(calls, [
    ["gh", ["api", "repos/Yacinewhatchandcode/Yace19ai.com"], { encoding: "utf8" }],
    ["gh", ["api", "repos/Yacinewhatchandcode/Yace19ai.com/environments/github-pages"], { encoding: "utf8" }],
    ["gh", ["api", "repos/Yacinewhatchandcode/Yace19ai.com/environments/github-pages/deployment-branch-policies"], { encoding: "utf8" }],
  ]);
  assert.throws(() => api("/environments/github-pages"));
});

test("API errors propagate instead of masking permission or missing-resource failures", () => {
  const error = new Error("HTTP 404");
  const api = repositoryApi("owner/repo", () => { throw error; });
  assert.throws(() => api(""), value => value === error);
});
