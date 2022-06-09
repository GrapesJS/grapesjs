import 'regenerator-runtime/runtime';
import 'whatwg-fetch';
import _ from 'underscore';
import sinon from 'sinon';

const localStorage = {
  getItem(key) {
    return this[key];
  },
  setItem(key, value) {
    this[key] = value;
  },
  removeItem(key, value) {
    delete this[key];
  },
};

global._ = _;
global.sinon = sinon;
global.__GJS_VERSION__ = '';
global.grapesjs = require('./../src').default;
global.$ = global.grapesjs.$;
global.localStorage = localStorage;
