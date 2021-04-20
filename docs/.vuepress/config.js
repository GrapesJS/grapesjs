const version = require('./../../package.json').version;
const isDev = process.argv[2] === 'dev';
const devPath = 'http://localhost:8080/dist';

module.exports = {
  title: 'GrapesJS',
  description: 'GrapesJS documentation',
  base: '/docs/',
  serviceWorker: false, // Enable Service Worker for offline usage
  head: [
    ['link', { rel: 'icon', href: '/logo-icon.png' }],
    ['link', { rel: 'stylesheet', href: isDev ? `${devPath}/css/grapes.min.css` : `../stylesheets/grapes.min.css?v${version}` }],
    ['script', { src: isDev ? `${devPath}/grapes.min.js` : `../js/grapes.min.js?v${version}` }],
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
        ['/api/assets', 'Asset Manager'],
        ['/api/block_manager', 'Block Manager'],
        ['/api/commands', 'Commands'],
        ['/api/components', 'DOM Components'],
        ['/api/component', ' - Component'],
        ['/api/panels', 'Panels'],
        ['/api/pages', 'Pages'],
        ['/api/style_manager', 'Style Manager'],
        ['/api/storage_manager', 'Storage Manager'],
        ['/api/device_manager', 'Device Manager'],
        ['/api/selector_manager', 'Selector Manager'],
        ['/api/css_composer', 'CSS Composer'],
        ['/api/modal_dialog', 'Modal'],
        ['/api/rich_text_editor', 'Rich Text Editor'],
        ['/api/keymaps', 'Keymaps'],
        ['/api/undo_manager', 'Undo Manager'],
      ],
      '/': [
        '',
        ['/getting-started', 'Getting Started'],
        // ['/faq', 'FAQ'],
        {
          title: 'Modules',
          collapsable: false,
          children: [
            ['/modules/Assets', 'Assets'],
            ['/modules/Blocks', 'Blocks'],
            ['/modules/Commands', 'Commands'],
            ['/modules/Components', 'Components'],
            ['/modules/Components-js', 'Components & JS'],
            ['/modules/I18n', 'I18n'],
            ['/modules/Traits', 'Traits'],
            ['/modules/Style-manager', 'Style Manager'],
            ['/modules/Storage', 'Storage Manager'],
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
