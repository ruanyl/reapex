module.exports = {
  title: "Reapex",
  description:
    "Intuitive state management and data flow orchestration library for React and Vue application",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
  themeConfig: {
    repo: "vitejs/vite",
    logo: "/logo.svg",
    docsDir: "docs",
    docsBranch: "master",
    editLinks: true,
    editLinkText: "Suggest changes to this page",

    /* algolia: {
      apiKey: 'b573aa848fd57fb47d693b531297403c',
      indexName: 'vitejs',
      searchParameters: {
        facetFilters: ['tags:en']
      }
    }, */

    /* carbonAds: {
      carbon: 'CEBIEK3N',
      placement: 'vitejsdev'
    },*/

    nav: [{ text: "Guide", link: "/guide/" }],

    sidebar: {
      "/config/": "auto",
      "/plugins": "auto",
      // catch-all fallback
      "/": [
        {
          text: "Guide",
          children: [
            {
              text: "Install",
              link: "/guide/install",
            },
            {
              text: "Getting Started",
              link: "/guide/",
            },
          ],
        },
        /* {
          text: 'APIs',
          children: [
            {
              text: 'Plugin API',
              link: '/guide/api-plugin'
            },
            {
              text: 'HMR API',
              link: '/guide/api-hmr'
            },
            {
              text: 'JavaScript API',
              link: '/guide/api-javascript'
            },
            {
              text: 'Config Reference',
              link: '/config/'
            }
          ]
        }*/
      ],
    },
  },
};
