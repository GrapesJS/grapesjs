# Introduction

[[toc]]

## What is GrapesJS?
At first glance might think this is just another page/HTML builder, but it's something more. GrapesJS is a multi-purpose, Web Builder Framework, which means it allows you to easily create a drag & drop enabled builder of "things".  By "things" we mean anything with HTML-like structure, which entails much more than web pages. We use HTML-like structure basically everywhere: Newsletters (eg. [MJML](https://mjml.io/)), Native Mobile Applications (eg. [React Native](https://github.com/facebook/react-native)), Native Desktop Applications (eg. [Vuido](https://vuido.mimec.org)), PDFs (eg. [React PDF](https://github.com/diegomura/react-pdf)), etc. So, for everything you can imagine as a set of elements like `<tag some="attribute">... other nested elements ...</tag>` you can create easily a GrapesJS builder around it and then use it independently your applications.
GrapesJS ships with features and tools that enable you to craft easy to use builders. Which allows your users to create complex HTML-like templates without any knowledge of coding.





## Why GrapesJS?
GrapesJS was designed  primarily to for use inside Content Management Systems to speed up the creation of dynamic templates and replace common WYSIWYG editors. Which are good for content editing, but inappropriate for creating HTML structures. Instead of creating an application we decided to create an extensible framework that could be used by anyone for any purpose.





## Quick Start
To showcase the power of GrapesJS we have created some presets.

* [grapesjs-preset-webpage](https://github.com/artf/grapesjs-preset-webpage) - [Webpage Builder](http://artf.github.io/grapesjs/demo.html)
* [grapesjs-preset-newsletter](https://github.com/artf/grapesjs-preset-newsletter) - [Newsletter Builder](http://artf.github.io/grapesjs/demo-newsletter-editor.html)
* [grapesjs-mjml](https://github.com/artf/grapesjs-mjml) - [Newsletter Builder with MJML](http://artf.github.io/grapesjs/demo-mjml.html)

You can actually use them as a starting point for your editors, so, just follow the instructions on their repositories to get a quick start for your builder.





## Download

Latest version: [![npm](https://img.shields.io/npm/v/grapesjs.svg?colorB=e67891)](https://www.npmjs.com/package/grapesjs)

You can download GrapesJS from one of these sources

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




## Changelog

To track changes made in the library we rely on [Github Releases](https://github.com/artf/grapesjs/releases)

