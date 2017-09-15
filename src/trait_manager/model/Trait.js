var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  defaults: {
    type: 'text', // text, number, range, select
    label: '',
    name: '',
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
    if (this.get('target')) {
      this.target = this.get('target');
      this.unset('target');
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
