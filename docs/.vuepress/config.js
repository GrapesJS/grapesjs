const version = require('./../../package.json').version;
const isDev = process.argv[2] === 'dev';
const devPath = 'http://localhost:8080';
const baseUrl = 'https://grapesjs.com';
const subDivider = " ‍  ‍  ‍ ";

module.exports = {
  title: 'GrapesJS',
  description: 'GrapesJS documentation',
  base: '/docs/',
  serviceWorker: false, // Enable Service Worker for offline usage
  head: [
    ['link', { rel: 'icon', href: '/logo-icon.png' }],
    ['link', { rel: 'stylesheet', href: isDev ? `${devPath}/dist/css/grapes.min.css` : `${baseUrl}/stylesheets/grapes.min.css?v${version}` }],
    ['script', { src: isDev ? `${devPath}/grapes.min.js` : `${baseUrl}/js/grapes.min.js?v${version}` }],
  ],
  localesSKIP: {
    '/': {
      lang: 'en-US',
    },
    '/it/': {
      lang: 'it-IT',
      description: 'GrapesJS documentazione',
    }
  },
  themeConfig: {
    editLinks: true,
    docsDir: 'docs',
    docsBranch: 'dev',
    repo: 'artf/grapesjs',
    editLinkText: 'Edit this page on GitHub',

    logo: '/logo.png',
    lastUpdated: 'Last Updated',
    locales: {
      '/': {
        selectText: 'EN',
        label: 'English',
      },
      '/it/': {
        selectText: 'IT',
        label: 'Italiano',
        nav: [
          { text: 'Supportaci', link: 'https://opencollective.com/grapesjs' },
        ],
        sidebar: [
          '/',
          ['/getting-started', 'Getting Started'],
        ]
      }
    },
    nav: [
      { text: 'Docs', link: '/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Support Us', link: 'https://opencollective.com/grapesjs' },
      { text: 'Twitter', link: 'https://twitter.com/grapesjs' },
    ],
    sidebar: {
      '/api/': [
        '',
        ['/api/editor', 'Editor'],
        ['/api/i18n', 'I18n'],
        ['/api/canvas', 'Canvas'],
        ['/api/frame', `${subDivider}Frame`],
        ['/api/canvas_spot', `${subDivider}CanvasSpot`],
        ['/api/assets', 'Asset Manager'],
        ['/api/asset', `${subDivider}Asset`],
        ['/api/block_manager', 'Block Manager'],
        ['/api/block', `${subDivider}Block`],
        ['/api/commands', 'Commands'],
        ['/api/components', 'DOM Components'],
        ['/api/component', `${subDivider}Component`],
        ['/api/panels', 'Panels'],
        ['/api/pages', 'Pages'],
        ['/api/page', `${subDivider}Page`],
        ['/api/layer_manager', 'Layers'],
        ['/api/style_manager', 'Style Manager'],
        ['/api/sector', `${subDivider}Sector`],
        ['/api/property', `${subDivider}Property`],
        ['/api/property_number', `${subDivider}PropertyNumber`],
        ['/api/property_select', `${subDivider}PropertySelect`],
        ['/api/property_composite', `${subDivider}PropertyComposite`],
        ['/api/property_stack', `${subDivider}PropertyStack`],
        ['/api/layer', `${subDivider}Layer`],
        ['/api/storage_manager', 'Storage Manager'],
        ['/api/device_manager', 'Device Manager'],
        ['/api/device', `${subDivider}Device`],
        ['/api/selector_manager', 'Selector Manager'],
        ['/api/selector', `${subDivider}Selector`],
        ['/api/state', `${subDivider}State`],
        ['/api/css_composer', 'CSS Composer'],
        ['/api/css_rule', `${subDivider}CssRule`],
        ['/api/modal_dialog', 'Modal'],
        ['/api/rich_text_editor', 'Rich Text Editor'],
        ['/api/keymaps', 'Keymaps'],
        ['/api/undo_manager', 'Undo Manager'],
        ['/api/parser', 'Parser'],
      ],
      '/': [
        '',
        ['/getting-started', 'Getting Started'],
        // ['/faq', 'FAQ'],
        {
          title: 'Modules',
          collapsable: false,
          children: [
            ['/modules/Components', 'Components'],
            ['/modules/Components-js', 'Components & JS'],
            ['/modules/Traits', 'Traits'],
            ['/modules/Blocks', 'Blocks'],
            ['/modules/Assets', 'Assets'],
            ['/modules/Commands', 'Commands'],
            ['/modules/I18n', 'I18n'],
            ['/modules/Selectors', 'Selectors'],
            ['/modules/Layers', 'Layers'],
            ['/modules/Pages', 'Pages'],
            ['/modules/Style-manager', 'Style Manager'],
            ['/modules/Storage', 'Storage Manager'],
            ['/modules/Modal', 'Modal'],
            ['/modules/Plugins', 'Plugins'],
          ]
        }, {
          title: 'Guides',
          collapsable: false,
          children: [
            ['/guides/Replace-Rich-Text-Editor', 'Replace Rich Text Editor'],
            ['/guides/Custom-CSS-parser', 'Use Custom CSS Parser'],
          ]
        }
      ],
    }
  },
  plugins: [
    [ '@vuepress/google-analytics', { ga: 'UA-74284223-1' } ],
  ],
}
