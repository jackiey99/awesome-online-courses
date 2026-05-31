import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Awesome Online Courses",
  description: "An index + study notes for hand-picked online courses",
  lang: "zh-CN",
  cleanUrls: true,
  base: "/awesome-online-courses/",

  srcExclude: ["README.md", "data/**/*.md", "pipeline/**/*.md"],

  markdown: {
    math: true,
  },

  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "课程列表", link: "/courses/" },
      {
        text: "CS285",
        items: [
          { text: "Lecture 1 · 导论（中）", link: "/courses/cs285/lecture-01" },
          { text: "Lecture 1 · Intro (EN)", link: "/courses/cs285/lecture-01.en" },
        ],
      },
      { text: "GitHub", link: "https://github.com/jackiey99/awesome-online-courses" },
    ],

    sidebar: {
      "/courses/cs285/": [
        {
          text: "CS285 · Deep Reinforcement Learning",
          collapsed: false,
          items: [
            { text: "课程总览", link: "/courses/cs285/" },
            {
              text: "Lecture 1 · 导论",
              collapsed: false,
              items: [
                { text: "🇨🇳 中文笔记", link: "/courses/cs285/lecture-01" },
                { text: "🇬🇧 English notes", link: "/courses/cs285/lecture-01.en" },
              ],
            },
          ],
        },
      ],
      "/courses/": [
        {
          text: "已收录课程",
          items: [
            { text: "CS285 Deep RL", link: "/courses/cs285/" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/jackiey99/awesome-online-courses" },
    ],

    outline: {
      level: [2, 3],
      label: "本页目录",
    },

    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },

    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: "搜索", buttonAriaLabel: "搜索" },
              modal: {
                noResultsText: "无匹配结果",
                resetButtonTitle: "清除",
                footer: {
                  selectText: "选择",
                  navigateText: "切换",
                  closeText: "关闭",
                },
              },
            },
          },
        },
      },
    },
  },
});
