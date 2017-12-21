import { filter } from 'underscore';
const Selector = require('./Selector');

module.exports = require('backbone').Collection.extend({
  model: Selector,

  getStyleable() {
    return filter(this.models, item =>
      item.get('active') && !item.get('private'));
  },

  getValid() {
    return filter(this.models, item => !item.get('private'));
  },

  getFullString(collection) {
    const result = [];
    const coll = collection || this;
    coll.forEach(selector => result.push(selector.getFullName()));
    return result.join('').trim();
  }
});
