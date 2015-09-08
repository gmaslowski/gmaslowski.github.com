---
layout: page
permalink: /projects/
title: projects
description: projects which I commit to
---

<ul class="post-list">
{% for project in site.projects reversed %}
    <li>
        <h2><a class="poem-title" href="{{ poem.url | prepend: site.baseurl }}">{{ poem.title }}</a></h2>
        <p class="post-meta">{{ poem.date | date: '%B %-d, %Y' }}</p>
      </li>
{% endfor %}
</ul>
