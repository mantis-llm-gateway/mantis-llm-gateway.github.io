// Syntax palette for code blocks, replacing Starlight's bundled Night Owl.
//
// Only token colours are declared here. `useStarlightUiThemeColors` in
// astro.config.mjs keeps the frame, borders, title bar and scrollbars deriving
// from --sl-color-*, so the block's chrome follows the site's theme on its own.
//
// Every value is measured against two backgrounds: the real one
// (--surface-2, #1d3036 / #f4f8f8) and the proxy Expressive Code uses for its
// own contrast pass (#23262f / #f6f7f9). Coloured roles clear 5.6:1 on both and
// comments 4.7:1, so EC's minimum-contrast pass never rewrites them.
//
// Four hues carry meaning; neutrals carry structure:
//   teal   — strings, the substance of a config file
//   coral  — numbers and the language constants (true/false/null)
//   blue   — keywords, storage and operators
//   gold   — function and command names
// Teal and coral are the brand pair, lightened or darkened per theme for
// contrast the way --ui-accent-text already is. Blue and gold are derived to
// sit at the same low chroma so nothing shouts over the prose around it.

const dark = {
  plain: '#d2e0e0',
  comment: '#879b9b',
  punctuation: '#93acae',
  property: '#e8f0f0',
  string: '#00bdaa',
  number: '#fb866f',
  keyword: '#81aada',
  function: '#d29f4b',
};

const light = {
  plain: '#1e3138',
  comment: '#5f7172',
  punctuation: '#4f6769',
  property: '#102028',
  string: '#006b60',
  number: '#bd2405',
  keyword: '#2e629e',
  function: '#7e5a20',
};

/** Scope assignments, shared by both themes. */
const tokenColors = (c) => [
  { settings: { foreground: c.plain } },

  {
    scope: ['comment', 'punctuation.definition.comment'],
    settings: { foreground: c.comment, fontStyle: '' },
  },

  // Quotes, braces and separators sit behind the values they delimit.
  {
    scope: [
      'punctuation',
      'meta.brace',
      'punctuation.separator',
      'punctuation.terminator',
      'punctuation.definition.string',
    ],
    settings: { foreground: c.punctuation },
  },

  {
    scope: ['string', 'string.quoted', 'string.template', 'markup.inline.raw'],
    settings: { foreground: c.string },
  },

  {
    scope: [
      'constant.numeric',
      'constant.language',
      'constant.character',
      'constant.other.boolean',
      'keyword.other.unit',
    ],
    settings: { foreground: c.number },
  },

  {
    scope: [
      'keyword',
      'keyword.control',
      'keyword.operator',
      'storage',
      'storage.type',
      'storage.modifier',
      'variable.language',
    ],
    settings: { foreground: c.keyword },
  },

  {
    scope: ['entity.name.function', 'support.function', 'meta.function-call'],
    settings: { foreground: c.function },
  },

  // Keys, headers and attributes — the structure a reader scans first, so they
  // take the brightest neutral rather than a hue.
  {
    scope: [
      'support.type.property-name',
      'meta.object-literal.key',
      'variable.other.member',
      'entity.name.tag',
      'entity.other.attribute-name',
    ],
    settings: { foreground: c.property },
  },

  {
    scope: ['variable', 'variable.other', 'variable.parameter'],
    settings: { foreground: c.plain },
  },

  { scope: ['invalid', 'invalid.illegal'], settings: { foreground: c.number } },

  // Diff markup, used by Expressive Code's ins/del line markers.
  { scope: ['markup.inserted', 'markup.inserted.diff'], settings: { foreground: c.string } },
  { scope: ['markup.deleted', 'markup.deleted.diff'], settings: { foreground: c.number } },
  { scope: ['markup.changed', 'markup.changed.diff'], settings: { foreground: c.keyword } },
];

export const mantisDark = {
  name: 'mantis-dark',
  type: 'dark',
  colors: { 'editor.foreground': dark.plain },
  settings: tokenColors(dark),
};

export const mantisLight = {
  name: 'mantis-light',
  type: 'light',
  colors: { 'editor.foreground': light.plain },
  settings: tokenColors(light),
};
