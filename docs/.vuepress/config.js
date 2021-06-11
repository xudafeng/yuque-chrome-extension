'use strict';

const pkg = require('../../package');

const name = pkg.name;

module.exports = {
  dest: 'docs_dist',
  base: `/${name}/`,

  locales: {
    '/': {
      lang: 'en-US',
      title: 'Chrome Extension',
      description: 'WIP',
    },
    '/zh/': {
      lang: 'zh-CN',
      title: 'Chrome 插件',
      description: 'WIP',
    },
  },
  head: [
  ],
  serviceWorker: true,
  themeConfig: {
    repo: `xudafeng/${name}`,
    editLinks: true,
    docsDir: 'docs',
    locales: {
      '/': {
        label: 'English',
        selectText: 'Languages',
        editLinkText: 'Edit this page on GitHub',
        lastUpdated: 'Last Updated',
        serviceWorker: {
          updatePopup: {
            message: 'New content is available.',
            buttonText: 'Refresh',
          },
        },
        nav: [
          {
            text: 'Guide',
            link: '/guide/'
          },
        ],
        sidebar: {
          '/guide/': genSidebarConfig([
            'Guide',
            'Advanced',
          ]),
        },
      },
      '/zh/': {
        label: '简体中文',
        selectText: '选择语言',
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdated: '上次更新',
        serviceWorker: {
          updatePopup: {
            message: '发现新内容可用',
            buttonText: '刷新',
          },
        },
        nav: [
          {
            text: '指南',
            link: '/zh/guide/'
          },
        ],
        sidebar: {
          '/zh/guide/': genSidebarConfig([
            '使用指南',
            '高级进阶',
          ]),
        },
      },
    },
  },
};

function genSidebarConfig(arr) {
  return [
    {
      title: arr[0],
      collapsable: false,
      children: [
        'quick-start',
      ],
    },
  ];
}
