const Property = require('./Property');

module.exports = Property.extend({

  defaults: Object.assign({}, Property.prototype.defaults, {
    // Array of units, eg. ['px', '%']
    units: [],

    // Selected unit, eg. 'px'
    unit: '',

    // Integer value steps
    step: 1,

    // Minimum value
    min: '',

    // Maximum value
    max: '',
  }),

  init() {
    const unit = this.get('unit');
    const units = this.get('units');

    if (units.length && !unit) {
      this.set('unit', units[0]);
    }
  },

  getFullValue() {
    let value = this.get('value') + this.get('unit');
    return Property.prototype.getFullValue.apply(this, [value]);
  },

});
