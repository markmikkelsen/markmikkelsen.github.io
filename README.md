# Mark Mikkelsen's personal website

A responsive, multi-page website for Mark Mikkelsen, Ph.D., built as a dependency-free static site.

## Pages

- `index.html` — homepage and research overview
- `research.html` — research program and themes
- `publications.html` — bibliography grouped by year with search, year, publication type, and author role filters
- `software.html` — Gannet, Osprey, NIfTI-MRS, MRS-BIDS, and open science principles
- `talks.html` — invited talks and workshop presentations
- `people.html` — lab members, external mentees, and teaching
- `about.html` — professional biography and expertise
- `contact.html` — contact channels
- `404.html` — static not-found page

## Build

Run:

```sh
npm run build
```

The command creates a checked, deployable copy in `dist/`. No package installation is required.

## Shared head, header, and footer

Edit `partials/head.html` to update the `<head>` tags shared by every page (character set, viewport, theme color, favicon, theme script, stylesheet, and script), `partials/header.html` to update the name, navigation, or header controls, and `partials/footer.html` to update the footer, once for all nine pages. Each source HTML page contains `<!-- include:head -->`, `<!-- include:header -->`, and `<!-- include:footer -->` markers; the build replaces them with the shared partials. Each page's `<head>` keeps only what is specific to it: its title, description, and Open Graph title, description, and type. The build also adds `partials/head-social.html` (canonical URL, Open Graph URL, site name, locale, and image, and the Twitter card type) to every page not marked `noindex`, filling in `{{url}}` from the page's file name and the image from `socialImages` in `scripts/build.mjs` (pages not listed there use the default image). Footer links with a `data-nav` value matching the page's `<body data-page>` are omitted on that page, so a page never links to itself in the footer. Run `npm run build` after editing, then preview or publish `dist/`. Preview the built pages rather than the source HTML files, which contain the placeholders. The partials are embedded during the build and appear immediately without a separate browser request.

## Features

- Responsive navigation and page layouts
- Light and dark themes with locally remembered preference
- Accessible skip links, focus states, landmarks, and reduced-motion support
- 63 peer-reviewed publications and one labeled preprint, with full author lists and DOI links
- Direct DOI and authoritative source links
- Page-specific titles, descriptions, and Open Graph summaries
- Favicon, custom 404 page, `robots.txt`, and GitHub Pages compatibility
- `sitemap.xml` generated at build time, with each page's last-modified date taken from its git history
- Structured data (`schema.org` `Person`) on the homepage for search engines
- No analytics, advertising, cookies, external fonts, or runtime dependencies

## License

- **Website code** (HTML markup, CSS, JavaScript, build scripts, and deployment configuration) is licensed under the [MIT License](LICENSE).
- **Original website content**, including text embedded in HTML, is licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/) unless otherwise noted. See [LICENSE-CC.txt](LICENSE-CC.txt) for details and third-party exclusions.
