import { isUndefined } from 'underscore';
import Property from './Property';
import InputNumber from 'domain_abstract/ui/InputNumber';
import { hasWin } from 'utils/mixins';

export default Property.extend({
  defaults: {
    ...Property.prototype.defaults,
    // Array of units, eg. ['px', '%']
    units: [],

    // Selected unit, eg. 'px'
    unit: '',

    // Integer value steps
    step: 1,

    // Minimum value
    min: '',

    // Maximum value
    max: ''
  },

  initialize(props = {}, opts = {}) {
    Property.callParentInit(Property, this, props, opts);
    const unit = this.get('unit');
    const units = this.get('units');
    this.input = hasWin() && new InputNumber({ model: this });

    if (units.length && !unit) {
      this.set('unit', units[0]);
    }
    Property.callInit(this, props, opts);
  },

  clearValue(opts = {}) {
    this.set({ value: undefined, unit: undefined }, opts);
    return this;
  },

  parseValue(val) {
    const parsed = Property.prototype.parseValue.apply(this, arguments);
    const { value, unit } = this.input.validateInputValue(parsed.value, {
      deepCheck: 1
    });
    parsed.value = value;
    parsed.unit = unit;
    return parsed;
  },

  getFullValue() {
    let value = this.get('value');
    let unit = this.get('unit');
    value = !isUndefined(value) ? value : '';
    unit = !isUndefined(unit) && value ? unit : '';
    value = `${value}${unit}`;
    return Property.prototype.getFullValue.apply(this, [value]);
  }
});
