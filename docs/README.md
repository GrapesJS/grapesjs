# Introduction

[[toc]]

## What is GrapesJS?
At first look you might probably think it's just another kind of page/HTML builder, but actually is something more. GrapesJS is a multi-purpose, Web Builder Framework, which means it allows you easily create your, drag & drop enabled, builder of "THINGS". For "THINGS" we consider anything web structure related, so HTML at first, but don't just think about web pages, we use HTML-like structure basically everywhere: Newsletters (eg. [MJML](https://mjml.io/)), Native Mobile Applications (eg. [React Native](https://github.com/facebook/react-native)), Native Desktop Applications (eg. [Vuido](https://vuido.mimec.org)), PDFs (eg. [React PDF](https://github.com/diegomura/react-pdf)), etc. So, for everything you can imagine as a set of elements like `<tag some="attribute">... other nested elements ...</tag>` you can create easily a GrapesJS builder around it and then use it independently in some of your applications.
GrapesJS comes along with different features and tools which enable you to craft easy to use builders, which will allow your users to create complex HTML-like templates without any knowledge of coding.





## Why GrapesJS?
Mainly, GrapesJS was designed to be used inside some CMS to speed up the creation of dynamic templates and replace common WYSIWYG editors, which are good for content editing but inappropriate for creating HTML structures. Then, with the same concept, instead of creating just an application we decided to create a framework that could be extended and used by everyone for any kind purpose.





## Quick Start
To show up of what GrapesJS is capable of we have created some presets.

* [grapesjs-preset-webpage](https://github.com/artf/grapesjs-preset-webpage) - [Webpage Builder](http://artf.github.io/grapesjs/demo.html)
* [grapesjs-preset-newsletter](https://github.com/artf/grapesjs-preset-newsletter) - [Newsletter Builder](http://artf.github.io/grapesjs/demo-newsletter-editor.html)
* [grapesjs-mjml](https://github.com/artf/grapesjs-mjml) - [Newsletter Builder with MJML](http://artf.github.io/grapesjs/demo-mjml.html)

You can actually use them as a starting point for your editors, so, just follow the instructions on their repositories to get a quick start for your builder.





## Download

Latest version: [![npm](https://img.shields.io/npm/v/grapesjs.svg?colorB=e67891)](https://www.npmjs.com/package/grapesjs)

You can download GrapesJS from one of this sources

* CDNs
  * unpkg
    * `https://unpkg.com/grapesjs`
    * `https://unpkg.com/grapesjs/dist/css/grapes.min.css`
  * cdnjs
    * `https://cdnjs.cloudflare.com/ajax/libs/grapesjs/0.12.17/grapes.min.js`
    * `https://cdnjs.cloudflare.com/ajax/libs/grapesjs/0.12.17/css/grapes.min.css`
* npm
  * `npm i grapesjs`
* git
  * `git clone https://github.com/artf/grapesjs.git`
