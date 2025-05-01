# pizza-ninjas-core
The goal of this repo is to have an easily accessible copy of the public code for the v1 Pizza Ninjas ordinals.

This code is lifted from my personal Pizza Ninjas #140, Inscription ID: 39399e536443446eda3f26ce7038178ec3b69157f38eaed19caea4614aabaf62i121
(https://app.pizzapets.fun/preview/39399e536443446eda3f26ce7038178ec3b69157f38eaed19caea4614aabaf62i121)

It has been formatted for readability.



## content.json
// SOURCE: https://app.pizzapets.fun/content/9afd90b4578dc1ff739f4478510f4953d9e920e35515b66ebbcfb693e23e2f37i0
// V2 NOTE: This is a reinscription of the draw sat.

- This file primarily contains all the related inscriptions that might be needed when rendering the ninjas.

## draw.js
- This is the core drawing library. 
- It loads in a list of inscription IDs and mini configs that it converts into SVGs that it then draws onto a canvas.
- SVGs are drawn with a 1000 x 1000 viewbox
- The inscribed version of the SVGs contain template strings, like %%ST0%% that get rendered prior to being drawn on the canvas, based on what is passed in to the draw library from the ninja.load call.
- Up to 11 style template strings can be defined, but the inscribed SVG must support them.


## ninjas.js
- this is the ninja javascript, it is the main file for the ninja that orchestrates everything

## ord-client.js 
- this is the ninja's version of ord-client (https://github.com/patrick99e99/ord-client), which is a javascript client that allows easy interaction with recursive endpoints for Ordinals indexers/explorers.

## player.html
- This is the html that is inscribed for the Ninja, as returned by the Ordinals server.

## player_rendered.html
- This is the rendered html in the browser, after the page loads.