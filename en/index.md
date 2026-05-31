---
layout: home

hero:
  name: Awesome Online Courses
  text: Hand-picked courses · Study notes
  tagline: A curated index of public-video courses, plus structured bilingual notes for every lecture
  actions:
    - theme: brand
      text: Browse courses
      link: /en/courses/
    - theme: alt
      text: GitHub
      link: https://github.com/jackiey99/awesome-online-courses

features:
  - title: 🎯 Curated courses
    details: Only courses with strong content and complete video coverage, across ML, DL, RL, NLP, CV, Systems, Math
  - title: 📝 Structured notes
    details: For each lecture, notes built from video transcript + slides — concepts, common pitfalls, exercises, further reading
  - title: 🌐 Bilingual
    details: All notes available in both Chinese and English, so you can stay close to the original lecture context
---

## Current progress

- ✅ **CS285 Deep RL** · [Lecture 1](/en/courses/cs285/lecture-01) (notes complete)
- 🚧 CS285 Lecture 2–25 (in progress)
- 📋 Other courses: see [full index](https://github.com/jackiey99/awesome-online-courses)

## How are these notes produced?

Each lecture's notes are generated through this pipeline:

1. `yt-dlp` pulls YouTube auto-captions
2. Slides PDF downloaded from the course site
3. Claude reads transcript + slides and produces structured notes
4. VitePress renders to website

See [`pipeline/`](https://github.com/jackiey99/awesome-online-courses/tree/master/pipeline) in the repo.
