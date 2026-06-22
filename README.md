# Mantis documentation site

This repository contains the public documentation website for Mantis, built with
[Astro](https://astro.build/) and the Starlight documentation theme.

## Develop locally

```sh
npm install
npm run dev
```

The development server prints the local preview URL.

## Build

```sh
npm run build
```

The production build is generated in `dist/`.

## Deploy

GitHub Actions deploys the Astro build to GitHub Pages on every push to `main`.
In the repository settings, configure Pages to use GitHub Actions as the source.
