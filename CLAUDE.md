# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal blog and portfolio site for Greg Maslowski (maslowski.cloud), built with Jekyll and hosted on GitHub Pages. Published at https://maslowski.cloud.

## Commands

```bash
# Serve locally with live reload
bundle exec jekyll serve

# Build only
bundle exec jekyll build

# Install dependencies
bundle install
```

Local dev server runs at http://localhost:4000. The production URL is https://maslowski.cloud — note that `_config.yml` has the production URL hardcoded; the commented-out `url: http://localhost:4000` line can be swapped for local development if absolute URLs matter.

CI builds are done via Travis CI (`bundle exec jekyll build` with Ruby 2.3).

## Architecture

This is a standard Jekyll site with a two-column layout: a fixed left panel (branding + nav) and a scrollable right panel (content).

**Key config** (`_config.yml`): controls site title, social links (Twitter, GitHub, LinkedIn, Stack Overflow), background images per page type, and Jekyll plugins (`jekyll-feed`, `jekyll-sitemap`, `jekyll-gist`).

**Layouts** (`_layouts/`): all wrap `compress.html` (whitespace-stripping layout). The main ones are:
- `home.html` — homepage with canvas animation
- `post-list.html` — lists posts filtered to `category: blog`
- `post.html` — individual post with date, tags, Disqus comments, pagination, and share buttons
- `page.html` / `page-no-shares.html` — static pages

**Includes** (`_includes/`): reusable partials — `left.html` renders the left panel, `social-links.html` and `links.html` drive nav, `disqus.html` handles comments, `share.html` share buttons.

**Pages** (`_pages/`): static pages (`about.md`, `posts.md`, `tags.md`, `projects.md`, `404.md`). Included via `include: [_pages]` in `_config.yml`.

**Posts** (`_posts/`): Markdown files named `YYYY-MM-DD-title.markdown`. Only posts with `category: blog` appear in the post list. Front matter fields used: `layout`, `title`, `date`, `description`, `category`, `tag` (array), `comments`, `image`.

**Styles** (`assets/_sass/`): SCSS partials compiled from `assets/css/main.scss`. Variables are in `_variables.scss`.

## Writing a new post

Create `_posts/YYYY-MM-DD-slug.markdown` with this front matter:

```yaml
---
layout: post
title: "Post Title"
date: YYYY-MM-DD
description: One-line summary shown in the post list
category: blog
tag:
- tag1
- tag2
comments: true
image: assets/image.png   # optional; shown in left panel for this post
---
```

Images referenced in posts use `{{ site.url }}/assets/...` for absolute URLs.
