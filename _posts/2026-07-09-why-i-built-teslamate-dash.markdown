---
layout: post
title: "TeslaMate Grafana is great, until you want to show friends a ~1000 km drive"
date: 2026-07-09
description: Why I built teslamate-dash, a read-only, map-first dashboard on top of TeslaMate
category: blog
tag:
- teslamate
- tesla
- go
- side-project
comments: true
image: assets/teslamate-dash.png
---

I run [TeslaMate](https://github.com/teslamate-org/teslamate) at home and I love the data it collects. 
What I stopped loving was showing that data to anyone. TeslaMate ships with [Grafana](https://grafana.com/) dashboards, 
and Grafana is fine when you are debugging a query on a big screen. It is not fine when friends ask 
"so how did that 1000 km drive actually go?" and you are jumping between five dashboards, fiddling with time ranges, 
and opening drives one by one to reconstruct a single trip. By the time you have found the right panel, everybody has 
stopped caring. What I wanted the most was easy analysis: open one page, pick a timeframe, and see the whole story of a 
long drive - the route, where I drove fast, where I charged and how much.

So I built [teslamate-dash](https://github.com/gmaslowski/teslamate-dash). It is a read-only, map-first dashboard that 
connects to the TeslaMate Postgres database already vailable in TeslaMate. Every drive is drawn from its GPS trace and 
colored by speed, so a 1000 km day reads at a glance: deep blue where the Autobahn was empty, pale where traffic crawled. 
Charging sessions are clustered by location into single markers showing session count, total energy, and 
the AC/DC split, so a road trip's charging stops sit right on the route they belong to. On top of that: timeframe 
filters (all time down to 30 days), per-car filtering, headline stats, layer toggles, and 3D buildings on a globe 
projection because zooming into a city you visited is half the fun.

Here it is in motion:

![teslamate-dash demo]({{ site.url }}/assets/teslamate-dash-demo.gif)

The app never writes anything back, makes no outbound calls from the server, and the README shows how to set up a
read-only Postgres role. Your data stays on your machine.

The tech is deliberately boring: one static [Go](https://go.dev/) binary with the web UI embedded, 
a read-only [pgx](https://github.com/jackc/pgx) pool, [MapLibre GL](https://maplibre.org/) plus Vite, one container. 
Multi-arch images are on GHCR, and there is a demo mode with synthetic data if you just want to click around. 
I am using [Claude Code](https://www.claude.com/product/claude-code) along the way, which is what keeps a 
spare-time project like this actually moving.

If it is useful to you, there is a [Buy Me a Coffee](https://buymeacoffee.com/gmaslowski). Feedback and issues welcome.

## Links

- [teslamate-dash on GitHub](https://github.com/gmaslowski/teslamate-dash)
- [TeslaMate](https://github.com/teslamate-org/teslamate)
- [MapLibre GL](https://maplibre.org/)
- [buymeacoffee.com/gmaslowski](https://buymeacoffee.com/gmaslowski)
