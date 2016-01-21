# GrapesJS

GrapesJS is a free and open source Web Template Editor for building HTML templates to be used inside sites, webapps, newsletters or anything else related with HTML.
Be aware that is not a 'Website Builder' but a tool to create HTML structure and containers for contents. The great thing about Grapes is that you can customize it, extend it or even integrate with other applications.

<Image>

### Features (configurable)

* Style Manager, for component styling
  <image>

* Layer Manager, that comes handy with nested elements
  <image>

* Code exporter
  <image>

* Asset Manager, for uploading and managing images
  <image>

* Local and remote storage

* Default built-in commands (basically for creating and managing different components)


### Installation

Download GrapesJS from npm `npm install grapesjs` or bower `bower install grapesjs`


### Development

GrapesJS uses [RequireJS](http://requirejs.org/) to organize its files

Install dependencies.

```sh
$ npm install
```

Build with [Grunt](http://gruntjs.com/)

```sh
$ grunt build
```

Launch server, which also gonna watch some files, and try out the demo on `localhost:9000/index.html`

```sh
$ grunt dev --port 9000
```

Tests are already available inside browser on `localhost:9000/test/index.html`


### Usage


### Configuration


### API

Documentation cooming soon


### Testing

Tests are run by [PhantomJS](http://phantomjs.org/) using [Mocha](https://mochajs.org/) (with [Chai](http://chaijs.com/) and [Sinon](http://sinonjs.org/) help)

```sh
$ grunt test
```


### Contributing

Usual pull request

## License

BSD 3-clause