import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightImageZoom from 'starlight-image-zoom';
import { mantisDark, mantisLight } from './src/styles/code-theme.mjs';

export default defineConfig({
  site: 'https://mantis-llm-gateway.github.io',
  integrations: [
    starlight({
      title: 'Mantis',
      favicon: '/images/mantis_logo_32.svg',
      plugins: [starlightImageZoom()],
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: 'https://mantis-llm-gateway.github.io/images/og.png' } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
        { tag: 'meta', attrs: { property: 'og:image:alt', content: 'Mantis — route, cache, guard, observe.' } },
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
      ],
      description:
        'Documentation for Mantis, an open-source self-hosted LLM gateway for routing, caching, guardrails, and observability.',
      logo: {
        dark: './src/assets/mantis_lockup_dark.svg',
        light: './src/assets/mantis_lockup_32.svg',
        alt: 'Mantis',
        replacesTitle: true,
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/mantis-llm-gateway',
        },
      ],
      components: {
        SocialIcons: './src/components/SocialIcons.astro',
        Hero: './src/components/Hero.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
        Search: './src/components/Search.astro',
        MobileMenuToggle: './src/components/MobileMenuToggle.astro',
      },
      // capability-glyphs.css is vendored from the design handoff — keep it
      // separate so a re-export drops straight in.
      customCss: ['./src/styles/custom.css', './src/styles/capability-glyphs.css'],
      expressiveCode: {
        themes: [mantisDark, mantisLight],
        // Keeps the frame, borders and title bar deriving from --sl-color-*,
        // so only the syntax palette is ours to own.
        useStarlightUiThemeColors: true,
        // EC's default floor is 5.5, stricter than WCAG AA and enough to lift
        // comments out of the background. The palette is measured against 4.5
        // instead, so this pass leaves it alone.
        minSyntaxHighlightingColorContrast: 4.5,
        styleOverrides: {
          codeFontFamily: 'var(--sl-font-mono)',
        },
      },
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { slug: 'index', label: 'Overview' },
            { slug: 'team', label: 'Team' },
            { slug: 'guides/quick-start', label: 'Quick Start' },
            { slug: 'guides/deployment', label: 'Deploy to AWS' },
          ],
        },
        {
          label: 'Case Study',
          items: [
            { slug: 'case-study/introduction', label: '1. Introduction' },
            { slug: 'case-study/background', label: '2. Background' },
            { slug: 'case-study/existing-solutions', label: '3. Existing Solutions' },
            { slug: 'case-study/introducing-mantis', label: '4. Introducing Mantis' },
            { slug: 'case-study/mantis-walkthrough', label: '5. Walkthrough' },
            { slug: 'case-study/architecture', label: '6. Architecture' },
            {
              slug: 'case-study/challenges-design-decisions',
              label: '7. Design Decisions',
            },
            { slug: 'case-study/future-work', label: '8. Future Work' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { slug: 'guides/routing-config', label: 'Routing Config' },
          ],
        },
        {
          label: 'API',
          items: [
            { slug: 'api/chat-completions', label: 'Chat Completions' },
            { slug: 'api/sdk', label: 'Python SDK' },
          ],
        },
      ],
    }),
  ],
});
