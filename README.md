# [GrapesJS](http://grapesjs.com)

[![Build Status](https://travis-ci.org/artf/grapesjs.svg?branch=master)](https://travis-ci.org/artf/grapesjs)
[![Chat](https://img.shields.io/badge/chat-discord-7289da.svg)](https://discord.gg/QAbgGXq)
[![CDNJS](https://img.shields.io/cdnjs/v/grapesjs.svg)](https://cdnjs.com/libraries/grapesjs)
[![npm](https://img.shields.io/npm/v/grapesjs.svg)](https://www.npmjs.com/package/grapesjs)
[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=QksxaStYaGI3eE5VMDlPTEh0Z3hYOXEwRWNMc1ZYT0lNbEJxMWdOZWFDZz0tLWlqcFVWb05PMmlQMmU3emFIZkFNWVE9PQ==--e89345be5e303d515276e3accd6f1316dfa857ab)](https://www.browserstack.com/automate/public-build/QksxaStYaGI3eE5VMDlPTEh0Z3hYOXEwRWNMc1ZYT0lNbEJxMWdOZWFDZz0tLWlqcFVWb05PMmlQMmU3emFIZkFNWVE9PQ==--e89345be5e303d515276e3accd6f1316dfa857ab)


<p align="center"><img src="http://grapesjs.com/img/grapesjs-front-page-m.jpg" alt="GrapesJS" width="500" align="center"/></p>


GrapesJS is a free and open source Web Builder Framework which helps building HTML templates, faster and easily, to be delivered in sites, newsletters or mobile apps. Mainly, GrapesJS was designed to be used inside a [CMS] to speed up the creation of dynamic templates. To better understand this concept check the image below

<br/>
<p align="center"><img src="http://grapesjs.com/img/gjs-concept.png" alt="GrapesJS - Style Manager" height="400" align="center"/></p>
<br/>

Generally any 'template system', that you'd find in various applications like CMS, is composed by the **structure** (HTML), **style** (CSS) and **variables**, which are then replaced with other templates and contents on server-side and rendered on client.

This demos show examples of what is possible to achieve:
Webpage Demo - http://grapesjs.com/demo.html
Newsletter Demo - http://grapesjs.com/demo-newsletter-editor.html





## Table of contents

* [Features](#features)
* [Download](#download)
* [Usage](#usage)
* [Development](#development)
* [Documentation](#documentation)
* [API](#api)
* [Testing](#testing)
* [Plugins](#plugins)
* [Support](#support)
* [Changelog](https://github.com/artf/grapesjs/releases)
* [Contributing](https://github.com/artf/grapesjs/blob/master/CONTRIBUTING.md)
* [License](#license)




## Features

| Blocks | Style Manager | Layer Manager |
|--|--|--|
|<img  src="http://grapesjs.com/img/sc-grapesjs-blocks-prp.jpg"  alt="GrapesJS - Block Manager"  height="400"  align="center"/>|<img  src="http://grapesjs.com/img/sc-grapesjs-style-2.jpg"  alt="GrapesJS - Style Manager"  height="400"  align="center"/>|<img  src="http://grapesjs.com/img/sc-grapesjs-layers-2.jpg"  alt="GrapesJS - Layer Manager"  height="400"  align="center"/>|

| Code Viewer | Asset Manager |
|--|--|
|<img  src="http://grapesjs.com/img/sc-grapesjs-code.jpg"  alt="GrapesJS - Code Viewer"  height="300"  align="center"/>|<img  src="http://grapesjs.com/img/sc-grapesjs-assets-1.jpg"  alt="GrapesJS - Asset Manager"  height="250"  align="center"/>|

* Local and remote storage

* Default built-in commands (basically for creating and managing different components)





## Download

* CDNs
  * UNPKG (resolves to the latest version)
    * `https://unpkg.com/grapesjs`
    * `https://unpkg.com/grapesjs/dist/css/grapes.min.css`
  * CDNJS (replace `X.X.X` with the current version)
    * `https://cdnjs.cloudflare.com/ajax/libs/grapesjs/X.X.X/grapes.min.js`
    * `https://cdnjs.cloudflare.com/ajax/libs/grapesjs/X.X.X/css/grapes.min.css`
* NPM
  * `npm i grapesjs`
* GIT
  * `git clone https://github.com/artf/grapesjs.git`

For the development purpose you should follow instructions below.





## Usage

```html
<link rel="stylesheet" href="path/to/grapes.min.css">
<script src="path/to/grapes.min.js"></script>

<div id="gjs"></div>

<script type="text/javascript">
  var editor = grapesjs.init({
      container : '#gjs',
      components: '<div class="txt-red">Hello world!</div>',
      style: '.txt-red{color: red}',
  });
</script>
```

You could also grab the content directly from the element with `fromElement` property

```html
<div id="gjs">
  <div class="txt-red">Hello world!</div>
  <style>.txt-red{color: red}</style>
</div>

<script type="text/javascript">
  var editor = grapesjs.init({
      container : '#gjs',
      fromElement: true,
  });
</script>
```

For more practical example I suggest to look up the code inside this demo: http://grapesjs.com/demo.html


## Development

GrapesJS uses [Webpack](https://github.com/webpack/webpack) as a module bundler and [Babel](https://github.com/babel/babel) as a compiler.

Clone the repository and install all the necessary dependencies

```sh
$ git clone https://github.com/artf/grapesjs.git
$ cd grapesjs
$ npm i
```

Start the dev server

```sh
$ npm start
```

Once the development server is started you should be able to reach the demo page (eg. `http://localhost:8080`)





## Documentation

Check the getting started guide here: [Documentation]





## API

API References could be found here: [API-Reference]





## Testing

```sh
$ npm test
```





## Plugins

### Extensions
* [grapesjs-plugin-export](https://github.com/artf/grapesjs-plugin-export) - Export GrapesJS templates in a zip archive
* [grapesjs-plugin-filestack](https://github.com/artf/grapesjs-plugin-filestack) - Add Filestack uploader in Asset Manager
* [grapesjs-plugin-ckeditor](https://github.com/artf/grapesjs-plugin-ckeditor) - Replaces the built-in RTE with CKEditor
* [grapesjs-aviary](https://github.com/artf/grapesjs-aviary) - Add the Aviary Image Editor (dismissed, use the plugin below instead)
* [grapesjs-tui-image-editor](https://github.com/artf/grapesjs-tui-image-editor) - GrapesJS TOAST UI Image Editor
* [grapesjs-blocks-basic](https://github.com/artf/grapesjs-blocks-basic) - Basic set of blocks
* [grapesjs-plugin-forms](https://github.com/artf/grapesjs-plugin-forms) - Set of form components and blocks
* [grapesjs-navbar](https://github.com/artf/grapesjs-navbar) - Simple navbar component
* [grapesjs-component-countdown](https://github.com/artf/grapesjs-component-countdown) - Simple countdown component
* [grapesjs-style-gradient](https://github.com/artf/grapesjs-style-gradient) - Add `gradient` type input to the Style Manager
* [grapesjs-style-filter](https://github.com/artf/grapesjs-style-filter) - Add `filter` type input to the Style Manager
* [grapesjs-blocks-flexbox](https://github.com/artf/grapesjs-blocks-flexbox) - Add the flexbox block
* [grapesjs-lory-slider](https://github.com/artf/grapesjs-lory-slider) - Slider component by using [lory](https://github.com/meandmax/lory)
* [grapesjs-tabs](https://github.com/artf/grapesjs-tabs) - Simple tabs component
* [grapesjs-tooltip](https://github.com/artf/grapesjs-tooltip) - Simple, CSS only, tooltip component for GrapesJS
* [grapesjs-custom-code](https://github.com/artf/grapesjs-custom-code) - Embed custom code
* [grapesjs-touch](https://github.com/artf/grapesjs-touch) - Enable touch support
* [grapesjs-indexeddb](https://github.com/artf/grapesjs-indexeddb) - Storage wrapper for IndexedDB
* [grapesjs-firestore](https://github.com/artf/grapesjs-firestore) - Storage wrapper for [Cloud Firestore](https://firebase.google.com/docs/firestore)
* [grapesjs-parser-postcss](https://github.com/artf/grapesjs-parser-postcss) - Custom CSS parser for GrapesJS by using [PostCSS](https://github.com/postcss/postcss)

### Presets
* [grapesjs-preset-webpage](https://github.com/artf/grapesjs-preset-webpage) - Webpage Builder
* [grapesjs-preset-newsletter](https://github.com/artf/grapesjs-preset-newsletter) - Newsletter Builder
* [grapesjs-mjml](https://github.com/artf/grapesjs-mjml) - Newsletter Builder with MJML components


Find out more about plugins here: [Creating plugins](https://github.com/artf/grapesjs/wiki/Creating-plugins)





## Support

If you like the project support it with a donation of your choice or become a backer/sponsor via [Open Collective](https://opencollective.com/grapesjs)

[![PayPalMe](http://grapesjs.com/img/ppme.png)](https://paypal.me/grapesjs)
[![Bitcoin](https://user-images.githubusercontent.com/11614725/52977952-87235f80-33cf-11e9-9607-7a9a354e1155.png)](https://commerce.coinbase.com/checkout/fc90b940-558d-408b-a166-28a823c98173)

<a href="https://opencollective.com/grapesjs/sponsors/0/website"><img src="https://opencollective.com/grapesjs/sponsors/0/avatar"></a>
<a href="https://opencollective.com/grapesjs/sponsors/1/website"><img src="https://opencollective.com/grapesjs/sponsors/1/avatar"></a>
<a href="https://opencollective.com/grapesjs/sponsors/2/website"><img src="https://opencollective.com/grapesjs/sponsors/2/avatar"></a>
<a href="https://opencollective.com/grapesjs/sponsors/3/website"><img src="https://opencollective.com/grapesjs/sponsors/3/avatar"></a>
<a href="https://opencollective.com/grapesjs/sponsors/4/website"><img src="https://opencollective.com/grapesjs/sponsors/4/avatar"></a>
<a href="https://opencollective.com/grapesjs/sponsors/5/website"><img src="https://opencollective.com/grapesjs/sponsors/5/avatar"></a>
<a href="https://opencollective.com/grapesjs/sponsors/6/website"><img src="https://opencollective.com/grapesjs/sponsors/6/avatar"></a>
<a href="https://opencollective.com/grapesjs/sponsors/7/website"><img src="https://opencollective.com/grapesjs/sponsors/7/avatar"></a>
<a href="https://opencollective.com/grapesjs/sponsors/8/website"><img src="https://opencollective.com/grapesjs/sponsors/8/avatar"></a>
<a href="https://opencollective.com/grapesjs/sponsors/9/website"><img src="https://opencollective.com/grapesjs/sponsors/9/avatar"></a>

<a href="https://opencollective.com/grapesjs/backers/0/website"><img src="https://opencollective.com/grapesjs/backers/0/avatar"></a>
<a href="https://opencollective.com/grapesjs/backers/1/website"><img src="https://opencollective.com/grapesjs/backers/1/avatar"></a>
<a href="https://opencollective.com/grapesjs/backers/2/website"><img src="https://opencollective.com/grapesjs/backers/2/avatar"></a>
<a href="https://opencollective.com/grapesjs/backers/3/website"><img src="https://opencollective.com/grapesjs/backers/3/avatar"></a>
<a href="https://opencollective.com/grapesjs/backers/4/website"><img src="https://opencollective.com/grapesjs/backers/4/avatar"></a>
<a href="https://opencollective.com/grapesjs/backers/5/website"><img src="https://opencollective.com/grapesjs/backers/5/avatar"></a>
<a href="https://opencollective.com/grapesjs/backers/6/website"><img src="https://opencollective.com/grapesjs/backers/6/avatar"></a>
<a href="https://opencollective.com/grapesjs/backers/7/website"><img src="https://opencollective.com/grapesjs/backers/7/avatar"></a>
<a href="https://opencollective.com/grapesjs/backers/8/website"><img src="https://opencollective.com/grapesjs/backers/8/avatar"></a>
<a href="https://opencollective.com/grapesjs/backers/9/website"><img src="https://opencollective.com/grapesjs/backers/9/avatar"></a>
<a href="https://opencollective.com/grapesjs/backers/10/website"><img src="https://opencollective.com/grapesjs/backers/10/avatar"></a>
<a href="https://opencollective.com/grapesjs/backers/11/website"><img src="https://opencollective.com/grapesjs/backers/11/avatar"></a>
<a href="https://opencollective.com/grapesjs/backers/12/website"><img src="https://opencollective.com/grapesjs/backers/12/avatar"></a>

<br>

[![BrowserStack](https://user-images.githubusercontent.com/11614725/39406324-4ef89c40-4bb5-11e8-809a-113d9432e5a5.png)](https://www.browserstack.com)<br/>
Thanks to [BrowserStack](https://www.browserstack.com) for providing us browser testing services


## License

BSD 3-clause


[Documentation]: <https://grapesjs.com/docs/>
[API-Reference]: <https://grapesjs.com/docs/api/>
[CMS]: <https://it.wikipedia.org/wiki/Content_management_system>
