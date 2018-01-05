import { isUndefined } from 'underscore';
var Backbone = require('backbone');
var Category = require('domain_abstract/model/Category');

module.exports = require('backbone').Model.extend({

  defaults: {
    type: 'text', // text, number, range, select
    label: '',
    name: '',
    category: '',
    min: '',
    max: '',
    value: '',
    target: '',
    default: '',
    placeholder: '',
    changeProp: 0,
    options: [],
  },


  initialize() {
    const target = this.get('target');
    const name = this.get('name');
    const changeProp = this.get('changeProp');

    if (target) {
      this.target = target;
      this.unset('target');
      const targetEvent = changeProp ? `change:${name}` : `change:attributes:${name}`;
      this.listenTo(target, targetEvent, this.targetUpdated);
    }
  },


  targetUpdated() {
    const value = this.getTargetValue();
    !isUndefined(value) && this.set({ value }, { fromTarget: 1 });
  },


  getTargetValue() {
    const name = this.get('name');
    const target = this.target;
    const prop = this.get('changeProp');
    if (target) return prop ? target.get(name) : target.getAttributes()[name];
  },


  setTargetValue(value) {
    const target = this.target;
    const name = this.get('name');
    if (isUndefined(value)) return;

    if (this.get('changeProp')) {
      target.set(name, value);
    } else {
      const attrs = { ...target.get('attributes') };
      attrs[name] = value;
      target.set('attributes', attrs);
    }

    let category = this.get('category');
    if (category) {
      if (typeof category == 'string') {
        var catObj = new Category({
          id: category,
          label: category,
          type: 'trait',
        });
      }
    }
  },


  /**
   * Get the initial value of the trait
   * @return {string}
   */
  getInitValue() {
    const target = this.target;
    const name = this.get('name');
    let value;

    if (target) {
      const attrs = target.get('attributes');
      value = this.get('changeProp') ? target.get(name) : attrs[name];
    }

    return value || this.get('value') || this.get('default');
  }

});
