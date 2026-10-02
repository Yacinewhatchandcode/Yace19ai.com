import { mkdir, readFile, writeFile } from "node:fs/promises";

// Pages does not offer an SPA rewrite. Publish real HTML entry points for known routes.
const html = await readFile("dist/index.html", "utf8");
for (const route of ["fleet", "games", "philosophy", "media"]) {
  await mkdir(`dist/${route}`, { recursive: true });
  await writeFile(`dist/${route}/index.html`, html);
}
await writeFile("dist/404.html", html);
