module.exports = {
  title: 'GrapesJS',
  description: 'GrapesJS documentation',
  base: '/docs/',
  ga: '', // Google Analytics ID
  serviceWorker: false, // Enable Service Worker for offline usage
  head: [
    ['link', { rel: 'icon', href: '/logo-icon.png' }],
    ['link', { rel: 'stylesheet', href: 'https://unpkg.com/grapesjs/dist/css/grapes.min.css' }], // dev https://localhost:8080/dist/css/grapes.min.css
    ['script', { src: '/grapes.min.js' }], // dev https://localhost:8080/dist/grapes.min.js
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
          { text: 'Supporto ❤️', link: 'https://opencollective.com/grapesjs' },
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
        ['/api/assets', 'Asset Manager'],
        ['/api/block_manager', 'Block Manager'],
        ['/api/commands', 'Commands'],
        ['/api/components', 'DOM Components'],
        ['/api/panels', 'Panels'],
        ['/api/style_manager', 'Style Manager'],
      ],
      '/': [
        '',
        ['/getting-started', 'Getting Started'],
        ['/faq', 'FAQ'],
        {
          title: 'Modules',
          collapsable: false,
          children: [
            ['/modules/Assets', 'Assets'],
            ['/modules/Blocks', 'Blocks'],
            ['/modules/Components', 'Components'],
            ['/modules/Components-js', 'Components & JS'],
            ['/modules/Traits', 'Traits'],
            ['/modules/Storage', 'Storage'],
            ['/modules/Plugins', 'Plugins'],
          ]
        }, {
          title: 'Guides',
          collapsable: false,
          children: [
            ['/guides/Replace-Rich-Text-Editor', 'Replace Rich Text Editor'],
          ]
        }
      ],
    }
  },
}
