import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://mantis-llm-gateway.github.io',
  integrations: [
    starlight({
      title: 'Mantis',
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
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { slug: 'index', label: 'Overview' },
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
