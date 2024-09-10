import { isUndefined } from 'underscore';
import Property, { PropertyProps } from './Property';
import InputNumber from '../../domain_abstract/ui/InputNumber';
import { hasWin } from '../../utils/mixins';

/** @private */
export interface PropertyNumberProps extends PropertyProps {
  /**
   * Array of units, eg. `['px', '%']`
   */
  units?: string[];
  /**
   * Unit defualt value.
   */
  unit?: string;
  /**
   * Minimum value.
   */
  min?: number;
  /**
   * Maximum value.
   */
  max?: number;
  /**
   * Step value.
   * @default 1
   */
  step?: number;
}

/**
 * @typedef PropertyNumber
 * @property {Array<String>} units Array of units, eg. `['px', '%']`
 * @property {Number} min Minimum value.
 * @property {Number} max Maximum value.
 * @property {Number} step Step value.
 *
 */
export default class PropertyNumber extends Property<PropertyNumberProps> {
  input?: InputNumber;

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
    return this.get('unit')!;
  }

  /**
   * Get min value.
   * @returns {Number}
   */
  getMin() {
    return this.get('min')!;
  }

  /**
   * Get max value.
   * @returns {Number}
   */
  getMax() {
    return this.get('max')!;
  }

  /**
   * Get step value.
   * @returns {Number}
   */
  getStep() {
    return this.get('step')!;
  }

  /**
   * Update property unit value.
   * The change is also propagated to the selected targets.
   * @param {String} unit New unit value
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.noTarget=false] If `true` the change won't be propagated to selected targets.
   * @returns {String}
   */
  upUnit(unit: string, opts: { noTarget?: boolean } = {}) {
    return this._up({ unit }, opts);
  }

  initialize(props = {}, opts = {}) {
    // @ts-ignore
    Property.callParentInit(Property, this, props, opts);
    const unit = this.get('unit');
    const units = this.getUnits();
    this.input = hasWin() ? new InputNumber({ model: this }) : undefined;

    if (units.length && !unit) {
      this.set('unit', units[0], { silent: true });
    }
    // @ts-ignore
    Property.callInit(this, props, opts);
  }

  __getClearProps() {
    return {
      ...Property.prototype.__getClearProps(),
      unit: '',
    };
  }

  parseValue(val: any, opts = {}): Partial<PropertyNumberProps> {
    const parsed = Property.prototype.parseValue.apply(this, arguments as any);
    const { value, unit } = this.input!.validateInputValue(parsed.value, {
      deepCheck: 1,
      ...opts,
    }) as any;
    parsed.value = value;
    parsed.unit = unit;
    return parsed;
  }

  getFullValue() {
    const valueProp = this.get('value');
    const unitProp = this.get('unit');
    const value = !isUndefined(valueProp) ? `${valueProp}` : '';
    const unit = !isUndefined(unitProp) && value ? unitProp : '';
    const result = `${value}${unit}`;
    return Property.prototype.getFullValue.apply(this, [result]);
  }
}
