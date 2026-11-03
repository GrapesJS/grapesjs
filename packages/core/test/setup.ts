import 'regenerator-runtime/runtime';
import _ from 'underscore';

const localStorage: Record<string, any> = {
  getItem(key: string) {
    return this[key];
  },
  setItem(key: string, value: string) {
    this[key] = value;
  },
  removeItem(key: string) {
    delete this[key];
  },
};

Object.assign(global, { _, __GJS_VERSION__: '' });
const grapesjs: typeof import('../src').default = require('../src').default;
Object.assign(global, { grapesjs, $: grapesjs.$ });
Object.defineProperty(global, 'localStorage', {
  value: localStorage,
  configurable: true,
});
