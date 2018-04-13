import _ from 'underscore';
import expect from 'expect';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
const window = dom.window;

// Fix for the require of jquery
var Module = require('module');
var originalRequire = Module.prototype.require;
Module.prototype.require = function(name) {
  if (name == 'jquery') {
    return originalRequire.call(this, 'cash-dom');
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
global.FormData = window.FormData;
global._ = _;
global.expect = expect;
global.sinon = sinon;
global.localStorage = localStorage;
global.navigator = { userAgent: 'node.js' };

// polyfill required elements from JSDOM
global.HTMLBodyElement = window.HTMLBodyElement;
global.HTMLDivElement = window.HTMLDivElement;
global.HTMLImageElement = window.HTMLImageElement;
global.HTMLUListElement = window.HTMLUListElement;
global.HTMLAnchorElement = window.HTMLAnchorElement;
global.HTMLLIElement = window.HTMLLIElement;
global.HTMLTableElement = window.HTMLTableElement;
global.HTMLSpanElement = window.HTMLSpanElement;
global.HTMLCanvasElement = window.HTMLCanvasElement;
global.SVGElement = window.SVGElement;

Object.keys(window).forEach(key => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});

global.Backbone = require('backbone');
global.$ = Backbone.$;
window.$ = Backbone.$;

global.grapesjs = require('./../src');
