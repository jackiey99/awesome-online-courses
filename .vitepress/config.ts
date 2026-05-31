import { defineConfig } from "vitepress";

const SITE_BASE = "/awesome-online-courses/";

export default defineConfig({
  title: "Awesome Online Courses",
  description: "An index + study notes for hand-picked online courses",
  cleanUrls: true,
  base: SITE_BASE,

  srcExclude: ["README.md", "data/**/*.md", "pipeline/**/*.md", "public/**/*.md"],

  markdown: {
    math: true,
    image: { lazyLoading: true },
  },

  // VitePress doesn't prepend `base` to absolute-path <img> srcs that came
  // from markdown (e.g. ![](/foo.png) stays /foo.png and 404s on a project
  // Pages site). Patch the final HTML so authors can keep writing /foo.png
  // and have it resolve against the deployed base path.
  transformHtml(code) {
    return code.replace(
      /<img\b([^>]*?)\bsrc="\/(?!\/)(?!awesome-online-courses\/)([^"]+)"/g,
      `<img$1 src="${SITE_BASE}$2"`,
    );
  },

  themeConfig: {
    socialLinks: [
      { icon: "github", link: "https://github.com/jackiey99/awesome-online-courses" },
    ],

    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
              modal: {
                noResultsText: "无匹配结果",
                resetButtonTitle: "清除查询",
                footer: { selectText: "选择", navigateText: "切换", closeText: "关闭" },
              },
            },
          },
        },
      },
    },
  },

  locales: {
    root: {
      label: "简体中文",
      lang: "zh-CN",
      themeConfig: {
        nav: [
          { text: "首页", link: "/" },
          { text: "课程列表", link: "/courses/" },
          {
            text: "CS285",
            items: [
              { text: "课程总览", link: "/courses/cs285/" },
              { text: "Lecture 1 · 导论", link: "/courses/cs285/lecture-01" },
            ],
          },
          { text: "❤️ 支持作者", link: "/donate" },
        ],
        sidebar: {
          "/courses/": [
            {
              text: "CS285 · Deep Reinforcement Learning",
              collapsed: false,
              items: [
                { text: "课程总览", link: "/courses/cs285/" },
                { text: "Lecture 1 · 导论", link: "/courses/cs285/lecture-01" },
              ],
            },
          ],
        },
        outline: { level: [2, 3], label: "本页目录" },
        docFooter: { prev: "上一篇", next: "下一篇" },
        lastUpdatedText: "最后更新",
        darkModeSwitchLabel: "外观",
        sidebarMenuLabel: "菜单",
        returnToTopLabel: "回到顶部",
        langMenuLabel: "切换语言",
      },
    },

    en: {
      label: "English",
      lang: "en-US",
      link: "/en/",
      themeConfig: {
        nav: [
          { text: "Home", link: "/en/" },
          { text: "Courses", link: "/en/courses/" },
          {
            text: "CS285",
            items: [
              { text: "Overview", link: "/en/courses/cs285/" },
              { text: "Lecture 1 · Introduction", link: "/en/courses/cs285/lecture-01" },
            ],
          },
          { text: "❤️ Support", link: "/en/donate" },
        ],
        sidebar: {
          "/en/courses/": [
            {
              text: "CS285 · Deep Reinforcement Learning",
              collapsed: false,
              items: [
                { text: "Overview", link: "/en/courses/cs285/" },
                { text: "Lecture 1 · Introduction", link: "/en/courses/cs285/lecture-01" },
              ],
            },
          ],
        },
        outline: { level: [2, 3], label: "On this page" },
      },
    },
  },
});
