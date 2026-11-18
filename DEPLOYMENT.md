# Publication guide

The production-ready site is generated in `dist/`.

## Launch checklist

- [x] Review the built site on desktop and mobile, including navigation, publication filters, contact details, and the CV download.
- [x] Connect the website to a GitHub repository: initialize Git locally, choose or create the repository, and push the website source.
- [x] Choose the public web address and hosting: https://markmikkelsen.github.io/ on GitHub Pages.
- [x] Add canonical page URLs, absolute social-sharing metadata, and a sitemap using the selected public URL.
- [x] Build and publish the site, then check the live pages.

## Build and preview

1. Run `npm run build`.
2. Preview `dist/` with any static web server.
3. Push changes to `main`. `.github/workflows/pages.yml` builds and publishes only `dist/`.

GitHub Pages must use **GitHub Actions** as its publishing source. The workflow can also be started manually from the repository’s Actions tab.

No build dependencies, server runtime, database, analytics, cookies, or environment variables are required.

## Before connecting a public domain

- Review the CV-based professional email and faculty appointment dates.
- The supplied CV is included in `assets/` and linked from the homepage and About page.
- The talks archive includes all 13 CV-listed invited talks and the INSPECTOR workshop.
- If the public domain changes, update canonical URLs and Open Graph metadata in the source pages, plus `sitemap.xml` and `robots.txt`.
- Replace or supplement the schematic scientific illustration if an approved portrait or research image is preferred.

## Hosting notes

The site uses relative URLs and works from a domain root or a project subdirectory. The included `.nojekyll` file makes the output compatible with GitHub Pages without Jekyll processing. The custom `404.html` can be used by hosts that support static error pages.
