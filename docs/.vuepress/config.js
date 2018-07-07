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
        '/api/editor.md',
        '/api/assets.md',
      ],
      '/': [
        '',
        ['/getting-started', 'Getting Started'],
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
        }
      ],
    }
  },
}
