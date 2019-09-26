import Backbone from 'backbone';
import { bindAll, isUndefined, indexOf } from 'underscore';
import { on, off } from 'utils/mixins';
import Input from './Input';

const $ = Backbone.$;

export default Input.extend({
  events: {
    'change input': 'handleChange',
    'change select': 'handleUnitChange',
    'click [data-arrow-up]': 'upArrowClick',
    'click [data-arrow-down]': 'downArrowClick',
    'mousedown [data-arrows]': 'downIncrement'
  },

  template() {
    const ppfx = this.ppfx;
    return `
      <span class="${ppfx}input-holder"></span>
      <span class="${ppfx}field-units"></span>
      <div class="${ppfx}field-arrows" data-arrows>
        <div class="${ppfx}field-arrow-u" data-arrow-up></div>
        <div class="${ppfx}field-arrow-d" data-arrow-down></div>
      </div>
    `;
  },

  inputClass() {
    const ppfx = this.ppfx;
    return this.opts.contClass || `${ppfx}field ${ppfx}field-integer`;
  },

  initialize(opts = {}) {
    Input.prototype.initialize.apply(this, arguments);
    bindAll(this, 'moveIncrement', 'upIncrement');
    this.doc = document;
    this.listenTo(this.model, 'change:unit', this.handleModelChange);
  },

  /**
   * Set value to the model
   * @param {string} value
   * @param {Object} opts
   */
  setValue(value, opts) {
    var opt = opts || {};
    var valid = this.validateInputValue(value, { deepCheck: 1 });
    var validObj = { value: valid.value };

    // If found some unit value
    if (valid.unit || valid.force) {
      validObj.unit = valid.unit;
    }

    this.model.set(validObj, opt);

    // Generally I get silent when I need to reflect data to view without
    // reupdating the target
    if (opt.silent) {
      this.handleModelChange();
    }
  },

  /**
   * Handled when the view is changed
   */
  handleChange(e) {
    e.stopPropagation();
    this.setValue(this.getInputEl().value);
    this.elementUpdated();
  },

  /**
   * Handled when the view is changed
   */
  handleUnitChange(e) {
    e.stopPropagation();
    var value = this.getUnitEl().value;
    this.model.set('unit', value);
    this.elementUpdated();
  },

  /**
   * Fired when the element of the property is updated
   */
  elementUpdated() {
    this.model.trigger('el:change');
  },

  /**
   * Updates the view when the model is changed
   * */
  handleModelChange() {
    const model = this.model;
    this.getInputEl().value = model.get('value');
    const unitEl = this.getUnitEl();
    unitEl && (unitEl.value = model.get('unit') || '');
  },

  /**
   * Get the unit element
   * @return {HTMLElement}
   */
  getUnitEl() {
    if (!this.unitEl) {
      const model = this.model;
      const units = model.get('units') || [];

      if (units.length) {
        const options = [];

        units.forEach(unit => {
          const selected = unit == model.get('unit') ? 'selected' : '';
          options.push(`<option ${selected}>${unit}</option>`);
        });

        const temp = document.createElement('div');
        temp.innerHTML = `<select class="${this.ppfx}input-unit">${options.join(
          ''
        )}</select>`;
        this.unitEl = temp.firstChild;
      }
    }

    return this.unitEl;
  },

  /**
   * Invoked when the up arrow is clicked
   * */
  upArrowClick() {
    const model = this.model;
    const step = model.get('step');
    let value = parseInt(model.get('value'), 10);
    value = this.normalizeValue(value + step);
    var valid = this.validateInputValue(value);
    model.set('value', valid.value);
    this.elementUpdated();
  },

  /**
   * Invoked when the down arrow is clicked
   * */
  downArrowClick() {
    const model = this.model;
    const step = model.get('step');
    const value = parseInt(model.get('value'), 10);
    const val = this.normalizeValue(value - step);
    var valid = this.validateInputValue(val);
    model.set('value', valid.value);
    this.elementUpdated();
  },

  /**
   * Change easily integer input value with click&drag method
   * @param Event
   *
   * @return void
   * */
  downIncrement(e) {
    e.preventDefault();
    this.moved = 0;
    var value = this.model.get('value');
    value = this.normalizeValue(value);
    this.current = { y: e.pageY, val: value };
    on(this.doc, 'mousemove', this.moveIncrement);
    on(this.doc, 'mouseup', this.upIncrement);
  },

  /** While the increment is clicked, moving the mouse will update input value
   * @param Object
   *
   * @return bool
   * */
  moveIncrement(ev) {
    this.moved = 1;
    const model = this.model;
    const step = model.get('step');
    const data = this.current;
    var pos = this.normalizeValue(data.val + (data.y - ev.pageY) * step);
    this.prValue = this.validateInputValue(pos).value;
    model.set('value', this.prValue, { avoidStore: 1 });
    return false;
  },

  /**
   * Stop moveIncrement method
   * */
  upIncrement() {
    const model = this.model;
    const step = model.get('step');
    off(this.doc, 'mouseup', this.upIncrement);
    off(this.doc, 'mousemove', this.moveIncrement);

    if (this.prValue && this.moved) {
      var value = this.prValue - step;
      model.set('value', value, { avoidStore: 1 }).set('value', value + step);
      this.elementUpdated();
    }
  },

  normalizeValue(value, defValue = 0) {
    const model = this.model;
    const step = model.get('step');
    let stepDecimals = 0;

    if (isNaN(value)) {
      return defValue;
    }

    value = parseFloat(value);

    if (Math.floor(value) !== value) {
      const side = step.toString().split('.')[1];
      stepDecimals = side ? side.length : 0;
    }

    return stepDecimals ? parseFloat(value.toFixed(stepDecimals)) : value;
  },

  /**
   * Validate input value
   * @param {String} value Raw value
   * @param {Object} opts Options
   * @return {Object} Validated string
   */
  validateInputValue(value, opts) {
    var force = 0;
    var opt = opts || {};
    var model = this.model;
    const defValue = ''; //model.get('defaults');
    var val = !isUndefined(value) ? value : defValue;
    var units = model.get('units') || [];
    var unit = model.get('unit') || (units.length && units[0]) || '';
    var max = model.get('max');
    var min = model.get('min');

    if (opt.deepCheck) {
      var fixed = model.get('fixedValues') || [];

      if (val) {
        // If the value is one of the fixed values I leave it as it is
        var regFixed = new RegExp('^' + fixed.join('|'), 'g');
        if (fixed.length && regFixed.test(val)) {
          val = val.match(regFixed)[0];
          unit = '';
          force = 1;
        } else {
          var valCopy = val + '';
          val += ''; // Make it suitable for replace
          val = parseFloat(val.replace(',', '.'));
          val = !isNaN(val) ? val : defValue;
          var uN = valCopy.replace(val, '');
          // Check if exists as unit
          if (indexOf(units, uN) >= 0) unit = uN;
        }
      }
    }

    if (!isUndefined(max) && max !== '') val = val > max ? max : val;
    if (!isUndefined(min) && min !== '') val = val < min ? min : val;

    return {
      force,
      value: val,
      unit
    };
  },

  render() {
    Input.prototype.render.call(this);
    this.unitEl = null;
    const unit = this.getUnitEl();
    unit &&
      this.$el
        .find(`.${this.ppfx}field-units`)
        .get(0)
        .appendChild(unit);
    return this;
  }
});
