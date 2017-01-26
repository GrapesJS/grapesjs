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

You can get GrapesJS with `bower install grapesjs` or via `git clone https://github.com/artf/grapesjs.git` to directly use it. For development purpose you should follow instructions below.


## Development

GrapesJS uses [RequireJS](http://requirejs.org/) to organize its files inside `src` folder and [Grunt](http://gruntjs.com/) for build them to `dist`

Clone the repository and enter inside the folder

```sh
$ npm install -g grunt-cli
$ git clone https://github.com/artf/grapesjs.git
$ cd grapesjs
```

Install all necessary dependencies

```sh
$ npm install
```

Build GrapesJS

```sh
$ npm run build
```

Launch server, which also gonna watch some files, and try out the demo on `localhost:8000`

```sh
$ npm start
```

Tests are already available inside browser on `localhost:8000/test`

If [Grunt](http://gruntjs.com/) is already installed globally you could change the port by using `grunt dev --port 9000`


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


## Configuration

Check the getting started guide here: [wiki]


## API

API References (draft) could be found here: [API-Reference]


## Testing

```sh
$ npm test
```

## Acknowledgements

GrapesJS is built on top of this amazing open source projects:

* [Backbone] - gives Backbone to web applications
* [Backbone.Undo] - a simple Backbone undo-manager
* [Keymaster] - keyboard shortcuts
* [CodeMirror] - versatile text editor
* [Spectrum] - no hassle colorpicker
* [FontAwesome] - the iconic font and CSS framework


## Sponsors

The project is sponsored by

[![Sendloop](http://grapesjs.com/img/sendloop-logo-l.png)](https://sendloop.com)


## Support

If you like the project support it with a donation of your choice.

[![PayPalMe](http://grapesjs.com/img/ppme.png)](https://paypal.me/grapesjs)


## License

BSD 3-clause


[Backbone]: <http://backbonejs.org/>
[Backbone.Undo]: <http://backbone.undojs.com/>
[Keymaster]: <https://github.com/madrobby/keymaster>
[CodeMirror]: <http://codemirror.net/>
[Spectrum]: <https://github.com/bgrins/spectrum>
[FontAwesome]: <https://fortawesome.github.io/Font-Awesome/>
[wiki]: <https://github.com/artf/grapesjs/wiki>
[API-Reference]: <https://github.com/artf/grapesjs/wiki/API-Reference>
[CMS]: <https://it.wikipedia.org/wiki/Content_management_system>
