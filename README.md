# Mark Mikkelsen — academic website

A responsive, multi-page academic website for Mark Mikkelsen, Ph.D., built as a dependency-free static site.

## Pages

- `index.html` — homepage and research overview
- `research.html` — research program and themes
- `publications.html` — 64-entry bibliography grouped by year with search, year, and publication-type filters
- `software.html` — Gannet, NIfTI-MRS, MRS-BIDS, and open-science principles
- `talks.html` — 13 invited talks and an additional workshop presentation
- `about.html` — professional biography and expertise
- `contact.html` — professional contact channels
- `404.html` — static not-found page

## Build

Run:

```sh
npm run build
```

The command creates a checked, deployable copy in `dist/`. No package installation is required.

## Shared header

Edit `partials/header.html` to update the name, navigation, or header controls once for all eight pages. Each source HTML page contains an `<!-- include:header -->` marker; the build replaces it with the shared header. Run `npm run build` after editing, then preview or publish `dist/`. Preview the built pages rather than the source HTML files, which contain the header placeholder. The header is embedded during the build and appears immediately without a separate browser request.

## Features

- Responsive navigation and page layouts
- Light and dark themes with locally remembered preference
- Accessible skip links, focus states, landmarks, and reduced-motion support
- 63 peer-reviewed publications and one labeled preprint, with full author lists and DOI links
- Direct DOI and authoritative source links
- Page-specific titles, descriptions, and Open Graph summaries
- SVG favicon, custom 404 page, `robots.txt`, and GitHub Pages compatibility
- No analytics, advertising, cookies, external fonts, or runtime dependencies

## Final publication choices

The public site is https://markmikkelsen.github.io/. Canonical URLs, absolute social-sharing metadata, and a sitemap use this address. GitHub Actions builds and publishes `dist/` whenever changes are pushed to `main`. The supplied November 15, 2026 CV is linked from the homepage and About page. See `DEPLOYMENT.md`.

## License

Unless otherwise noted, original non-software website content is licensed under the [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/). Third-party materials and software/source code are excluded unless expressly stated otherwise. See `LICENSE` for details.

## CV content update

Publication records in `assets/publications.json` and the rendered bibliography follow the November 15, 2026 CV. The duplicate in-press record is excluded, as are manuscripts under preparation. Talks use month-level dates from the CV; the previously documented INSPECTOR workshop is retained. Employment dates, location, and professional email follow the same CV. The downloadable PDF is an unchanged copy of the supplied file.

## Former institutional websites

Former Weill Cornell profile and lab websites may be used as source material when developing this site. Do not link visitors to those websites or present Weill Cornell as a current affiliation. Retain relevant historical references, including appointment dates and talk venues.

Publication-type filter options and each article’s type are read from `assets/publications.json` during the build. Rebuild after changing the JSON. Search, year, and type filters combine.
