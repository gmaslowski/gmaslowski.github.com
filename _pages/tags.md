---
layout: page
title: Tag Archive
description: "An archive of posts sorted by tag."
permalink: /tags.html
---

{% capture site_tags %}{% for tag in site.tags %}{{ tag | first }}{% unless forloop.last %},{% endunless %}{% endfor %}{% endcapture %}
{% assign tags_list = site_tags | split:',' | sort %}

{% for item in (0..site.tags.size) %}{% unless forloop.last %}
{% capture this_word %}{{ tags_list[item] | strip_newlines }}{% endcapture %}
   <h2 id="{{ this_word }}" class="tag-heading">{{ this_word }}</h2>
   <ul>
    {% for post in site.tags[this_word] %}{% if post.title != null %}
    <li class="entry-title"><a href="{{ site.url }}{{ post.url }}" title="{{ post.title }}">{{ post.title }}</a></li>
    {% endif %}{% endfor %}
  </ul>
{% endunless %}{% endfor %}
