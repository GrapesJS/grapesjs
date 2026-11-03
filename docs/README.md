# Introduction

[[toc]]

::: tip

Supercharge your web builder with the [Grapes Studio SDK](https://app.grapesjs.com/docs-sdk/overview/getting-started) — a customizable GrapesJS experience, complete with a polished UI that’s ready to embed.

:::


## What is GrapesJS?

At first glance, one might think this is just another page/HTML builder, but it's something more. GrapesJS is a multipurpose web builder framework, which means it allows you to easily create a drag-and-drop builder for "things". By "things", we mean anything with an HTML-like structure, which includes much more than web pages. We use HTML-like structures almost everywhere: newsletters (e.g., [MJML](https://mjml.io/)), native mobile applications (e.g., [React Native](https://github.com/facebook/react-native)), native desktop applications (e.g., [Vuido](https://vuido.mimec.org)), PDFs (e.g., [React PDF](https://github.com/diegomura/react-pdf)), etc. For anything you can imagine as a set of elements like `<tag some="attribute">... other nested elements ...</tag>`, you can easily create a GrapesJS builder and use it independently in your applications.
GrapesJS ships with features and tools that enable you to craft easy-to-use builders, allowing your users to create complex HTML-like templates without any coding knowledge.

## Why GrapesJS?

GrapesJS was designed primarily for use inside content management systems to speed up the creation of dynamic templates and replace common WYSIWYG editors, which are good for editing content but unsuitable for creating HTML structures. Instead of creating an application, we decided to create an extensible framework that could be used by anyone for any purpose.

## Quick Start

To showcase the power of GrapesJS, we have created some presets.

- [grapesjs-preset-webpage](https://github.com/GrapesJS/preset-webpage) - [Webpage Builder](https://grapesjs.com/demo.html)
- [grapesjs-preset-newsletter](https://github.com/GrapesJS/preset-newsletter) - [Newsletter Builder](https://grapesjs.com/demo-newsletter-editor.html)
- [grapesjs-mjml](https://github.com/GrapesJS/mjml) - [Newsletter Builder with MJML](https://grapesjs.com/demo-mjml.html)

You can use them as a starting point for your editors. Follow the instructions in their repositories to get started quickly with your builder.

## Download

Latest version: [![npm](https://img.shields.io/npm/v/grapesjs.svg?colorB=e67891)](https://www.npmjs.com/package/grapesjs)

You can download GrapesJS from one of these sources:

- CDNs
  - unpkg
    - `https://unpkg.com/grapesjs`
    - `https://unpkg.com/grapesjs/dist/css/grapes.min.css`
  - cdnjs
    - `https://cdnjs.cloudflare.com/ajax/libs/grapesjs/0.12.17/grapes.min.js`
    - `https://cdnjs.cloudflare.com/ajax/libs/grapesjs/0.12.17/css/grapes.min.css`
- npm
  - `npm i grapesjs`
- git
  - `git clone https://github.com/GrapesJS/grapesjs.git`

## Changelog

To track changes made to the library, we rely on [GitHub Releases](https://github.com/GrapesJS/grapesjs/releases).
