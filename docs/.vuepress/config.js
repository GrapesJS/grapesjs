module.exports = {
  title: 'GrapesJS',
  description: 'GrapesJS documentation',
  base: '/docs/',
  ga: '', // Google Analytics ID
  serviceWorker: false, // Enable Service Worker for offline usage
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
    lastUpdated: 'Lastttt Updated',
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
      { text: 'API Reference', link: '/api/' },
      { text: 'Support ❤️', link: 'https://opencollective.com/grapesjs' },
      { text: 'Twitter', link: 'https://twitter.com/grapesjs' },
      { text: 'Github', link: 'https://github.com/artf/grapesjs' },
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
      ],
    }
  },
}
