import React, { Component } from 'react';
import CardProps from './Modal'

class Gallery extends React.Component {

    render(){
        return (
          <div class="gallery">
              {% assign image_files = site.static_files | where: "image", true %}
    
           <div id="column-1" class="column">
            {% for myimage in image_files reversed %}
            {% assign every_third = forloop.index | modulo:3 %}
            {% assign cardIndex = forloop.rindex0 %}
    
            {% if every_third == 1 %}
           
              <CardProps cardminiimg="https://images.weserv.nl/?url=https://lifeexamined.github.io{{ myimage.path }}&w=200&h=200&output=jpg&q=65" cardprop="{{ myimage.path }}" id="{{ cardIndex }}" />
            
            {% else %}
            {% continue %}
            {% endif %}
            {% endfor %}
          </div>
          
          <div id="column-2" class="column">
            {% for myimage in image_files reversed %}
            {% assign every_third = forloop.index | modulo:3 %}
            {% assign cardIndex = forloop.rindex0 %}
    
            {% if every_third == 2 %}
    
            <CardProps cardminiimg="https://images.weserv.nl/?url=https://lifeexamined.github.io{{ myimage.path }}&w=200&h=200&output=jpg&q=65" cardprop="{{ myimage.path }}" id="{{ cardIndex }}" />
              
            {% else %}
            {% continue %}
            {% endif %}
            {% endfor %}
          </div>
    
          <div id="column-3" class="column">
            {% for myimage in image_files reversed %}
            {% assign every_third = forloop.index | modulo:3 %}
            {% assign cardIndex = forloop.rindex0 %}
    
            {% if every_third == 0 %}
    
              <CardProps cardminiimg="https://images.weserv.nl/?url=https://lifeexamined.github.io{{ myimage.path }}&w=200&h=200&output=jpg&q=65" cardprop="{{ myimage.path }}" id="{{ cardIndex }}" />
              
            {% else %}
            {% continue %} 
            {% endif %}
            {% endfor %}
          </div>
          </div>
          
          )
        }
    
    }

    export default Gallery;