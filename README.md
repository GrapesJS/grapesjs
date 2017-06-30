# [GrapesJS](http://grapesjs.com)

[![Build Status](https://travis-ci.org/artf/grapesjs.svg?branch=master)](https://travis-ci.org/artf/grapesjs)

<p align="center"><img src="http://grapesjs.com/img/grapesjs-front-page-m.jpg" alt="GrapesJS" width="500" align="center"/></p>
<br/>

GrapesJS is a free and open source Web Builder Framework which helps you building HTML templates to be used inside sites, newsletters and mobile apps.
Mainly GrapesJS was designed to be used inside a [CMS] to speed up a creation of dynamic templates. To better understand this concept check the image below

<br/>
<p align="center"><img src="http://grapesjs.com/img/gjs-concept.png" alt="GrapesJS - Style Manager" height="400" align="center"/></p>
<br/>

Generally any 'template system', that you'd find in various applications like CMS, is composed by the **structure** (HTML), **style** (CSS) and **variables**, which are then replaced with other templates and contents on server-side and rendered on client.

This demos show examples of what is possible to achieve:
Webpage Demo - http://grapesjs.com/demo.html
Newsletter Demo - http://grapesjs.com/demo-newsletter-editor.html





## Features


* Blocks
<p align="center"><img src="http://grapesjs.com/img/sc-grapesjs-blocks-prp.jpg" alt="GrapesJS - Block Manager" height="400" align="center"/></p>

* Style Manager, for component styling<br/>
<p align="center"><img src="http://grapesjs.com/img/sc-grapesjs-style-2.jpg" alt="GrapesJS - Style Manager" height="400" align="center"/></p>

* Layer Manager, that comes handy with nested elements<br/>
<p align="center"><img src="http://grapesjs.com/img/sc-grapesjs-layers-2.jpg" alt="GrapesJS - Layer Manager" height="400" align="center"/></p>

* Code Viewer <br/>
<p align="center"><img src="http://grapesjs.com/img/sc-grapesjs-code.jpg" alt="GrapesJS - Code Viewer" height="300" align="center"/></p>

* Asset Manager, for uploading and managing images<br/>
<p align="center"><img src="http://grapesjs.com/img/sc-grapesjs-assets-1.jpg" alt="GrapesJS - Asset Manager" height="250" align="center"/></p>

* Local and remote storage

* Default built-in commands (basically for creating and managing different components)





## Installation

* `npm i grapesjs` / `yarn add grapesjs`
* `git clone https://github.com/artf/grapesjs.git`

For development purpose you should follow instructions below.





## Development

GrapesJS uses [Webpack2](https://github.com/webpack/webpack) as a module bundler and [Babel](https://github.com/babel/babel) as a compiler.

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

Build before the commit. This will also increase the patch level version of the package

```sh
$ npm run build
```





## Usage

JQuery is the only hard dependency so you have to include it before using GrapesJS

```html
<script src="http://code.jquery.com/jquery-2.2.0.min.js"></script>
```
After that include scripts from GrapesJS with all your configurations

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





## Documentation

Check the getting started guide here: [wiki]





## API

API References could be found here: [API-Reference]





## Testing

```sh
$ npm test
```





## Sponsors

The project is sponsored by

[![Sendloop](http://grapesjs.com/img/sendloop-logo-l.png)](https://sendloop.com)





## Support

If you like the project support it with a donation of your choice or become a backer/sponsor via [Open Collective](https://opencollective.com/grapesjs)

[![PayPalMe](http://grapesjs.com/img/ppme.png)](https://paypal.me/grapesjs)

<a href="https://opencollective.com/grapesjs/sponsors/0/website" target="_blank"><img src="https://opencollective.com/grapesjs/sponsors/0/avatar"></a>
<a href="https://opencollective.com/grapesjs/sponsors/1/website" target="_blank"><img src="https://opencollective.com/grapesjs/sponsors/1/avatar"></a>

<a href="https://opencollective.com/grapesjs/backers/0/website" target="_blank"><img src="https://opencollective.com/grapesjs/backers/0/avatar"></a>
<a href="https://opencollective.com/grapesjs/backers/1/website" target="_blank"><img src="https://opencollective.com/grapesjs/backers/1/avatar"></a>



## License

BSD 3-clause


[wiki]: <https://github.com/artf/grapesjs/wiki>
[API-Reference]: <https://github.com/artf/grapesjs/wiki/API-Reference>
[CMS]: <https://it.wikipedia.org/wiki/Content_management_system>
