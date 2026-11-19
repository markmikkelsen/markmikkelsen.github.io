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
  "people.html",
  "about.html",
  "contact.html",
  "404.html",
];
const rootFiles = ["LICENSE", "LICENSE-CC.txt", "robots.txt", "sitemap.xml"];
const siteUrl = "https://markmikkelsen.github.io/";
const readPartial = async (name) =>
  (await readFile(path.join(root, "partials", `${name}.html`), "utf8")).trim();
// Partials are expanded in this order, so a partial may include ones listed
// after it (head includes theme-init).
const partials = {
  head: await readPartial("head"),
  "theme-init": await readPartial("theme-init"),
  header: await readPartial("header"),
  footer: await readPartial("footer"),
};
// Canonical and Open Graph URL/image tags, added to every indexable page.
const headSocial = await readPartial("head-social");
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
  const currentPage = source.match(/<body\b[^>]*\bdata-page="([^"]+)"/)?.[1];
  let html = source;
  for (const [name, partial] of Object.entries(partials)) {
    const marker = `<!-- include:${name} -->`;
    if (html.split(marker).length !== 2) {
      throw new Error(`${page}: expected exactly one shared ${name} marker`);
    }
    let content = partial;
    // The footer omits its link to the page being viewed.
    if (name === "footer" && currentPage) {
      content = content.replace(
        new RegExp(
          `\\s*<a\\b[^>]*\\bdata-nav="${currentPage}"[^>]*>[\\s\\S]*?</a\\s*>`,
          "g",
        ),
        "",
      );
    }
    html = html.replace(marker, () => content);
  }
  if (!/<meta\b[^>]*\bname="robots"[^>]*\bnoindex\b/.test(html)) {
    const url = siteUrl + (page === "index.html" ? "" : page);
    html = html.replace(
      /\n(\s*)<\/head>/,
      (_, indent) => `\n${headSocial.replaceAll("{{url}}", url)}\n${indent}</head>`,
    );
  }
  // GitHub Pages serves 404.html at whatever URL was requested, including
  // nested paths, so its local links must be root-absolute to resolve.
  if (page === "404.html") {
    html = html.replace(
      /\b(href|src)="(?!https?:|mailto:|#|\/)([^"]+)"/g,
      (_, attribute, target) => `${attribute}="/${target}"`,
    );
  }
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
const builtPages = new Map();
for (const page of pages) {
  const html = await readFile(path.join(output, page), "utf8");
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => id));
  builtPages.set(page, { html, ids });
}
for (const [page, { html }] of builtPages) {
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
  if (page !== "404.html" && !/<link rel="canonical" href="https:/.test(html))
    missing.push(`${page}: missing canonical URL`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:)/.test(target)) continue;
    const [file, fragment] = target.split("#");
    if (file) {
      try {
        await access(path.join(output, file));
      } catch {
        missing.push(`${page}: missing ${target}`);
        continue;
      }
    }
    if (fragment) {
      const targetPage = file ? path.normalize(file).replace(/^\//, "") : page;
      const ids = builtPages.get(targetPage)?.ids;
      if (ids && !ids.has(decodeURIComponent(fragment)))
        missing.push(`${page}: missing anchor ${target}`);
    }
  }
}

if (missing.length) {
  console.error(missing.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Built ${pages.length} pages in ${output}`);
  console.log("Local link, anchor, and metadata checks passed.");
}
