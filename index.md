---
layout: home

hero:
  name: Awesome Online Courses
  text: 精选在线课程 · 配套学习笔记
  tagline: 收录值得学的公开课，并为每门课生成结构化的双语学习笔记
  actions:
    - theme: brand
      text: 开始浏览
      link: /courses/
    - theme: alt
      text: GitHub
      link: https://github.com/jackiey99/awesome-online-courses

features:
  - title: 🎯 精选课程
    details: 每个领域（ML、DL、RL、NLP、CV、Systems、Math）都只收录质量过硬、有完整视频的公开课
  - title: 📝 结构化笔记
    details: 每节课基于视频字幕 + slides 自动生成的学习笔记，含核心概念、易混点、练习题、延伸阅读
  - title: 🌐 中英双语
    details: 所有笔记都有中英两版，方便对照原课程语境与中文理解
---

## 当前进度

- ✅ **CS285 Deep RL** · [Lecture 1](/courses/cs285/lecture-01)（已完成笔记）
- 🚧 CS285 Lecture 2-25（待生成）
- 📋 其他课程见 [完整课程索引](https://github.com/jackiey99/awesome-online-courses)

## 这个站点是怎么做出来的？

每节课的笔记是这样产出的：

1. `yt-dlp` 拉取 YouTube 自动字幕
2. 从课程官网下载 slides PDF
3. 用 Claude 读 transcript + slides，生成结构化笔记
4. VitePress 渲染成网站

详见仓库 [pipeline/](https://github.com/jackiey99/awesome-online-courses/tree/master/pipeline)。
