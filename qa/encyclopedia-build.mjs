import assert from "node:assert/strict";
import { lstat, readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const sourceRoot = "public/encyclopedia";
const distRoot = "dist/encyclopedia";
const allowedExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".mp4",
  ".pptx",
  ".svg",
]);
const forbiddenArtifact = /(?:^|\/)(?:qa-factory|.*(?:AUTONOMOUS_TOUT_STATUS|DESIGN_CONTRACT|E2E_PATHWAY_REPORT|FEATURE_COVERAGE_REPORT|GAP_ANALYSIS|QA_COVERAGE_REPORT).*)/i;
const forbiddenContent = /(?:\/Users\/|docs\/presentations\/site-yace19ai|qa-factory)/;

async function walk(root, directory = root) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(root, path));
    else paths.push(relative(root, path));
  }
  return paths;
}

async function validateRuntime(root) {
  const files = await walk(root);
  assert.equal(files.length, 493, `${root} must contain exactly the curated runtime set`);

  for (const file of files) {
    assert(allowedExtensions.has(extname(file)), `non-runtime file published: ${file}`);
    assert(!forbiddenArtifact.test(file), `QA or audit artifact published: ${file}`);
    assert(!(await lstat(join(root, file))).isSymbolicLink(), `symlink published: ${file}`);
  }

  const registry = JSON.parse(await readFile(join(root, "public/registry.json"), "utf8"));
  assert.equal(registry.deck_count, 433, "registry deck count changed");
  assert.equal(registry.decks.length, 433, "registry must contain 433 decks");

  const deckFiles = files.filter((file) => file.startsWith("public/decks/") && file.endsWith(".pptx"));
  assert.equal(deckFiles.length, 433, "all and only registered decks must be published");
  const deckSet = new Set(deckFiles);
  for (const deck of registry.decks) {
    assert(deckSet.has(`public/decks/${deck.id}.pptx`), `missing deck: ${deck.id}`);
  }

  const filmsHtml = await readFile(join(root, "films/index.html"), "utf8");
  const mp4Refs = [...filmsHtml.matchAll(/src="(mp4\/[^"]+\.mp4)"/g)].map((match) => match[1]);
  const clipRefs = [...filmsHtml.matchAll(/href="(clips\/[^"]+\.html)"/g)].map((match) => match[1]);
  assert.equal(mp4Refs.length, 20, "film gallery must reference 20 MP4s");
  assert.equal(clipRefs.length, 20, "film gallery must reference 20 HTML clips");
  for (const file of [...mp4Refs, ...clipRefs]) {
    assert(files.includes(`films/${file}`), `missing film asset: ${file}`);
  }

  for (const file of files.filter((path) => /\.(?:html|js|css|json)$/.test(path))) {
    const content = await readFile(join(root, file), "utf8");
    assert(!forbiddenContent.test(content), `non-public path or QA reference in ${file}`);
  }

  const treeHtml = await readFile(join(root, "index.html"), "utf8");
  assert.match(treeHtml, /PRIME-AI · Tier B Arborescence/);
  assert.match(treeHtml, /public\/registry\.json|app\.js/);
}

await validateRuntime(sourceRoot);

try {
  await stat(distRoot);
  await validateRuntime(distRoot);
  const rootHtml = await readFile("dist/index.html", "utf8");
  assert.match(rootHtml, /Yace19ai — Local portfolio/, "existing homepage was replaced");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

console.log("Encyclopedia runtime assets and scoped build route validated.");
