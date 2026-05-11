import path from 'node:path'

import {defineConfig} from 'vitepress'

export default defineConfig({
  title: 'React Multiplayer Input',
  description:
    'Drop-in replacement for native input and textarea elements that preserves caret, selection, and scroll during collaborative editing.',
  base: '/react-multiplayer-input/',
  cleanUrls: true,
  lastUpdated: true,
  head: [['link', {rel: 'icon', href: '/react-multiplayer-input/favicon.svg'}]],
  themeConfig: {
    nav: [
      {text: 'Guide', link: '/guide/getting-started'},
      {text: 'API', link: '/api/'},
      {
        text: 'GitHub',
        link: 'https://github.com/sanity-io/react-multiplayer-input',
      },
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            {text: 'Getting started', link: '/guide/getting-started'},
            {text: 'Wrapping a component', link: '/guide/wrapping-a-component'},
            {text: 'Known limitations', link: '/guide/known-limitations'},
          ],
        },
      ],
      '/api/': [
        {
          text: 'API',
          items: [{text: 'Reference', link: '/api/'}],
        },
      ],
    },
    socialLinks: [
      {icon: 'github', link: 'https://github.com/sanity-io/react-multiplayer-input'},
    ],
    editLink: {
      pattern:
        'https://github.com/sanity-io/react-multiplayer-input/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: '© Sanity.io',
    },
    search: {provider: 'local'},
  },
  vite: {
    resolve: {
      alias: {
        'react-multiplayer-input': path.resolve(__dirname, '../../src'),
      },
    },
    ssr: {
      noExternal: ['react-multiplayer-input'],
    },
  },
})
