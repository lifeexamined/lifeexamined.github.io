 {% capture postFiles %}{{site.url}}{{ site.blog_directory }}{{ page.date | date: '%Y' }}/{{ page.date | date: '%m' }}/{{ page.date | date: '%d' }}-{{ page.title | slugify }}{% endcapture %}
