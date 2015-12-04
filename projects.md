---
layout: page
permalink: /projects/
title: projects
description: projects which I commit to
---

<ul class="post-list">
{% for project in site.projects reversed %}
    <li>
        <h2><a class="project-title" href="{{ project.link }}">{{ project.title }}</a></h2>
        <p class="post-meta">{{ project.description | date: '%B %-d, %Y' }}</p>
        <p class="post-meta">{{ project.date | date: '%B %-d, %Y' }}</p>
        <p class="post-meta"><a href="{{ project.link }}">{{ project.link }}</a></p>
      </li>
{% endfor %}
</ul>
