import { filter } from 'underscore';
const Selector = require('./Selector');

export default require('backbone').Collection.extend({
  model: Selector,

  modelId: attr => `${attr.name}_${attr.type || Selector.TYPE_CLASS}`,

  getStyleable() {
    return filter(
      this.models,
      item => item.get('active') && !item.get('private')
    );
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
