import { isUndefined } from 'underscore';
import Property from './Property';
import InputNumber from '../../domain_abstract/ui/InputNumber';
import { hasWin } from '../../utils/mixins';

/**
 * @typedef PropertyNumber
 * @property {Array<String>} units Array of units, eg. `['px', '%']`
 * @property {Number} min Minimum value.
 * @property {Number} max Maximum value.
 * @property {Number} step Step value.
 *
 */
export default class PropertyNumber extends Property {
  defaults() {
    return {
      ...Property.getDefaults(),
      units: [],
      unit: '',
      min: '',
      max: '',
      step: 1,
    };
  }

  /**
   * Get property units.
   * @returns {Array<String>}
   */
  getUnits() {
    return this.get('units') || [];
  }

  /**
   * Get property unit value.
   * @returns {String}
   */
  getUnit() {
    return this.get('unit');
  }

  /**
   * Get min value.
   * @returns {Number}
   */
  getMin() {
    return this.get('min');
  }

  /**
   * Get max value.
   * @returns {Number}
   */
  getMax() {
    return this.get('max');
  }

  /**
   * Get step value.
   * @returns {Number}
   */
  getStep() {
    return this.get('step');
  }

  /**
   * Update property unit value.
   * The change is also propagated to the selected targets.
   * @param {String} unit New unit value
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.noTarget=false] If `true` the change won't be propagated to selected targets.
   * @returns {String}
   */
  upUnit(unit, opts) {
    return this._up({ unit }, opts);
  }

  initialize(props = {}, opts = {}) {
    Property.callParentInit(Property, this, props, opts);
    const unit = this.get('unit');
    const units = this.get('units');
    this.input = hasWin() && new InputNumber({ model: this });

    if (units.length && !unit) {
      this.set('unit', units[0], { silent: 1 });
    }
    Property.callInit(this, props, opts);
  }

  __getClearProps() {
    return {
      ...Property.prototype.__getClearProps(),
      unit: '',
    };
  }

  parseValue(val, opts = {}) {
    const parsed = Property.prototype.parseValue.apply(this, arguments);
    const { value, unit } = this.input.validateInputValue(parsed.value, {
      deepCheck: 1,
      ...opts,
    });
    parsed.value = value;
    parsed.unit = unit;
    return parsed;
  }

  getFullValue() {
    let value = this.get('value');
    let unit = this.get('unit');
    value = !isUndefined(value) ? value : '';
    unit = !isUndefined(unit) && value ? unit : '';
    value = `${value}${unit}`;
    return Property.prototype.getFullValue.apply(this, [value]);
  }
}
