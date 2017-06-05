import _ from 'underscore';
import expect from 'expect';
import sinon from 'sinon';
import Backbone from 'backbone';
import grapesjs from './../src';
import { JSDOM } from 'jsdom';
import jquery from 'jquery';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
const window = dom.window;
const $ = jquery(window);

//https://www.npmjs.com/package/proxyquire

// Fix for the spectrum lib
var Module = require('module');
var originalRequire = Module.prototype.require;

Module.prototype.require = function(name) {
  if (name == 'jquery') {
    return $;
  }
  return originalRequire.apply(this, arguments);
};

global.window = window;
global.document = window.document;
global.$ = $;
global._ = _;
global.expect = expect;
global.sinon = sinon;
global.grapesjs = grapesjs;
global.Backbone = Backbone;
window.$ = $;
Backbone.$ = $;

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});
