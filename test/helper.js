import _ from 'underscore';
import expect from 'expect';
import sinon from 'sinon';
import jquery from 'jquery';
import Backbone from 'backbone';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global._ = _;
global.expect = expect;
global.sinon = sinon;
dom.window.$ = jquery(dom.window);
Backbone.$ = dom.window.$;

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});
