import 'regenerator-runtime/runtime';
import 'whatwg-fetch';
import _ from 'underscore';

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
global.__GJS_VERSION__ = '';
global.grapesjs = require('./../src').default;
global.$ = global.grapesjs.$;
global.localStorage = localStorage;
