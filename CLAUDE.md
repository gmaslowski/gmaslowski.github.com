# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal blog and portfolio site for Greg Maslowski, built with Jekyll and hosted on GitHub Pages. Published at https://maslowski.cloud.

## Running locally

Ruby is managed via **rbenv** (Ruby 3.3.0). Prefix every Ruby/Jekyll command with `eval "$(rbenv init -)"`:

```bash
# Install dependencies
eval "$(rbenv init -)" && bundle install

# Serve locally with live reload at http://localhost:4000
eval "$(rbenv init -)" && bundle exec jekyll serve

# Build only
eval "$(rbenv init -)" && bundle exec jekyll build
```

Notes:
- `_config.yml` hardcodes the production URL (`https://maslowski.cloud`), so the local preview loads production assets. If absolute URLs matter locally, temporarily swap in the commented-out `url: http://localhost:4000` line — but never commit that change.
- `_config.yml` is read once at startup; restart `jekyll serve` after editing it.
- `_site/` is Jekyll's build output — never hand-edit it. `.jekyll-cache/` is disposable local cache.
- `Gemfile.lock` is committed and pins the dependency set — change it only via `bundle`.

## Creating a new post

Create `_posts/YYYY-MM-DD-slug.markdown` with this front matter (an empty post is just this front matter with no body):

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
image: assets/image.png   # optional; shown in the post list card
---
```

- Only posts with `category: blog` appear in the post list.
- Images referenced in the post body use `{{ site.url }}/assets/...` for absolute URLs. The `image:` front matter path has no leading slash (templates prepend `{{ site.url }}/`).
- To unpublish a post without deleting it, add `published: false` to its front matter.

### Project entries

The Projects page lists posts with `category: project`. They live in `_posts/` too, with `layout: project`, plus `image` and `link` (external URL, e.g. the GitHub repo) in the front matter — no body needed.

## Repo map

Standard Jekyll site:

- `_layouts/` — all wrap `compress.html`. `home.html` (homepage with canvas animation), `post-list.html`, `post.html`, `projects.html`, `page.html`.
- `_includes/` — partials: header/nav, `disqus.html` comments, `scripts.html`. `share.html` is intentionally empty (share buttons removed by design — don't re-add).
- `_pages/` — static pages (`about.md`, `posts.md`, `tags.md`, `projects.md`, `404.md`), included via `include: [_pages]` in `_config.yml`.
- `assets/_sass/` — SCSS partials compiled from `assets/css/main.scss`. The active theme is `_daisy.scss` (with `_variables.scss`, `_reset.scss`, `_syntax.scss`); `_base.scss` and `_site.scss` are legacy and NOT imported — style changes go in `_daisy.scss`.
- `assets/js/cursor-glow.js` — canvas particle animation, loaded via `_includes/scripts.html`.

## Content notes

Greg writes about EV fleet charging (OCPP, ISO 15118, VDV 261), distributed systems, and software architecture. Tenix (tenix.eu) builds Charge Management Software for electric bus fleets.

Blog voice: direct, technical, no buzzwords; show expertise through specifics, not claims. Newer posts go deep on real implementation problems, not overviews.
