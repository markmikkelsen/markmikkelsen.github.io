import {
  access,
  copyFile,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "dist");
const pages = [
  "index.html",
  "research.html",
  "publications.html",
  "software.html",
  "talks.html",
  "about.html",
  "contact.html",
  "404.html",
];
const rootFiles = ["LICENSE", "robots.txt", "sitemap.xml"];
const headerMarker = "<!-- include:header -->";
const header = (
  await readFile(path.join(root, "partials/header.html"), "utf8")
).trim();
const bibliography = JSON.parse(
  await readFile(path.join(root, "assets/publications.json"), "utf8"),
);
const publicationsByDoi = new Map(
  bibliography.map((publication) => [publication.doi, publication]),
);
const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const publicationTypes = [
  ...new Set(bibliography.map((publication) => publication.type)),
];
const typeFilters =
  '<div class="filters pub-type-filters" role="group" aria-label="Filter by publication type">' +
  '<button class="filter" data-type="all" aria-pressed="true">All types</button>' +
  publicationTypes
    .map(
      (type) =>
        `<button class="filter" data-type="${escapeHtml(type)}" aria-pressed="false">${escapeHtml(type)}</button>`,
    )
    .join("") +
  "</div>";

await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, "assets"), { recursive: true });
await writeFile(path.join(output, ".nojekyll"), "\n");

for (const file of rootFiles)
  await copyFile(path.join(root, file), path.join(output, file));
for (const file of await readdir(path.join(root, "assets"))) {
  await copyFile(
    path.join(root, "assets", file),
    path.join(output, "assets", file),
  );
}

for (const page of pages) {
  const source = await readFile(path.join(root, page), "utf8");
  if (source.split(headerMarker).length !== 2) {
    throw new Error(`${page}: expected exactly one shared header marker`);
  }
  let html = source.replace(headerMarker, () => header);
  if (page === "publications.html") {
    const marker = "<!-- include:publication-types -->";
    if (html.split(marker).length !== 2)
      throw new Error("Expected one publication type filter marker");
    html = html.replace(marker, () => typeFilters);
    html = html.replace(
      /<article\b[^>]*class="pub"[^>]*>[\s\S]*?<\/article>/g,
      (article) => {
        const doi = article.match(/href="https:\/\/doi\.org\/([^"#]+)"/)?.[1];
        const publication = publicationsByDoi.get(doi);
        if (!publication?.type)
          throw new Error(`Missing publication type in JSON for ${doi}`);
        return article.replace(
          "<article ",
          () => `<article data-type="${escapeHtml(publication.type)}" `,
        );
      },
    );
  }
  await writeFile(path.join(output, page), html);
}

const missing = [];
for (const page of pages) {
  const html = await readFile(path.join(output, page), "utf8");
  if (!/<title>[^<]+<\/title>/.test(html))
    missing.push(`${page}: missing title`);
  if (
    page !== "404.html" &&
    ![...html.matchAll(/<meta\b[^>]*>/gi)].some(
      ([tag]) =>
        /\bname\s*=\s*["']description["']/i.test(tag) &&
        /\bcontent\s*=\s*(["'])[^"']*\S[^"']*\1/i.test(tag),
    )
  )
    missing.push(`${page}: missing description`);
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:)/.test(target)) continue;
    try {
      await access(path.resolve(output, target));
    } catch {
      missing.push(`${page}: missing ${target}`);
    }
  }
}

if (missing.length) {
  console.error(missing.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Built ${pages.length} pages in ${output}`);
  console.log("Local link and metadata checks passed.");
}
