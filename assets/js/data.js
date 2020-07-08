const cardObj = {
    "properties": [
    {% for myimage in image_files %}
    {% assign cardNumber = forloop.index %}
    {
      "index":{{ cardNumber }},
      "path":"{{ myimage.path }}"
    },
    {% endfor %}
    ]
  }
  