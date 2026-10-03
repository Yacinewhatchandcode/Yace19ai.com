import assert from "node:assert/strict";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { repositoryApi } from "./github-repository-api.mjs";
import { validateRequest } from "./pages-release-authorization.mjs";

export function reauthorize(request, context, api) {
  assert.equal(request.repository, context.GITHUB_REPOSITORY);
  assert.equal(request.sourceSha, context.GITHUB_SHA);
  const fresh = {
    ...request,
    actor: context.GITHUB_ACTOR,
    triggeringActor: context.TRIGGERING_ACTOR,
    repositoryPolicy: request.approvalPolicy === "single-owner/v1"
      ? api("actions/variables/STATIC_RELEASE_APPROVAL_POLICY").value : undefined,
    repo: api(""),
    environment: api("environments/github-pages"),
    branchPolicies: api("environments/github-pages/deployment-branch-policies").branch_policies,
    artifact: api(`actions/artifacts/${request.artifactId}`),
    run: api(`actions/runs/${request.validationRunId}/attempts/${request.validationAttempt}`),
    currentWorkflow: api("actions/workflows/deploy.yml"),
    mainSha: api("branches/main").commit.sha,
  };
  assert.equal(fresh.mainSha, request.sourceSha, "Main moved while waiting for approval; validate the new head");
  return validateRequest(fresh);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [requestPath, outputPath] = process.argv.slice(2);
  const request = JSON.parse(fs.readFileSync(requestPath, "utf8"));
  const api = repositoryApi(process.env.GITHUB_REPOSITORY);
  fs.writeFileSync(outputPath, `${JSON.stringify(reauthorize(request, process.env, api), null, 2)}\n`);
}
