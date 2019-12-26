import { filter } from 'underscore';
import Backbone from 'backbone';
import Selector from './Selector';

export default Backbone.Collection.extend({
  model: Selector,

  modelId: attr => `${attr.name}_${attr.type || Selector.TYPE_CLASS}`,

  getStyleable() {
    return filter(
      this.models,
      item => item.get('active') && !item.get('private')
    );
  },

  getValid({ noDisabled } = {}) {
    return filter(this.models, item => !item.get('private')).filter(item =>
      noDisabled ? item.get('active') : 1
    );
  },

  getFullString(collection) {
    const result = [];
    const coll = collection || this;
    coll.forEach(selector => result.push(selector.getFullName()));
    return result.join('').trim();
  }
});
