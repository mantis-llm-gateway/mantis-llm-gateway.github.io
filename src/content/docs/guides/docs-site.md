---
title: Docs Site Workflow
description: Maintain the Astro/Starlight documentation site.
sidebar:
  order: 4
---

This website uses [Astro](https://astro.build/) with Starlight. Starlight provides the
documentation layout, sidebar, search, dark mode, table of contents, and Markdown content
pipeline.

## Project Layout

```text
mantis-llm-gateway.github.io/
├── astro.config.mjs
├── src/
│   ├── content/docs/       # Markdown docs pages
│   ├── assets/             # bundled images, including the logo
│   └── styles/custom.css   # site styling overrides
├── public/assets/          # static images used by docs pages
└── .github/workflows/deploy.yml
```

## Edit Content

Documentation pages live in `src/content/docs/` as Markdown. Edit those files directly
when changing the case study, guides, or API reference.

## Preview Locally

```sh
npm install
npm run dev
```

## Build Locally

```sh
npm run build
```

## Publish

Push to `main`. The GitHub Actions workflow builds the Astro site and deploys it to
GitHub Pages. In the GitHub repository settings, Pages should use GitHub Actions as
the source.
