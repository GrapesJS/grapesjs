import _ from 'underscore';
import expect from 'expect';
import sinon from 'sinon';
import Backbone from 'backbone';
import grapesjs from './../src';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
const window = dom.window;
//const $ = jquery(window);

// Fix for the spectrum lib
var Module = require('module');
var originalRequire = Module.prototype.require;

Module.prototype.require = function(name) {
  if (name == 'jquery') {
    return Backbone.$;
  }
  return originalRequire.apply(this, arguments);
};

var localStorage = {
  getItem(key) {
    return this[key];
  },
  setItem(key, value) {
    this[key] = value;
  },
  removeItem(key, value) {
    delete this[key];
  }
};

global.window = window;
global.document = window.document;
global._ = _;
global.expect = expect;
global.sinon = sinon;
global.grapesjs = grapesjs;
global.Backbone = Backbone;
global.localStorage = localStorage;
global.SVGElement = global.Element;
global.navigator = {
  userAgent: 'node.js'
};

// Need this to trigger the cash generation
grapesjs.init({container: 'body',autorender: 0, storageManager: {
  autoload: 0,
  type:'none'
},});
window.$ = Backbone.$;

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});
