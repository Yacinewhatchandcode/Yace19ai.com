import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

export function repositoryApi(repository, execute = execFileSync) {
  assert.match(repository, /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
  return endpoint => {
    assert.equal(typeof endpoint, "string");
    assert.ok(!endpoint.startsWith("/"), "Repository endpoint must be relative");
    const route = `repos/${repository}${endpoint ? `/${endpoint}` : ""}`;
    return JSON.parse(execute("gh", ["api", route], { encoding: "utf8" }));
  };
}
