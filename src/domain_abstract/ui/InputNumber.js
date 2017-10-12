import {on, off} from 'utils/mixins'

const Backbone = require('backbone');
const $ = Backbone.$;

module.exports = Backbone.View.extend({

  template: _.template(`
  <span class='<%= ppfx %>input-holder'></span>
  <span class='<%= ppfx %>field-units'></span>
  <div class="<%= ppfx %>field-arrows">
    <div class="<%= ppfx %>field-arrow-u"></div>
    <div class="<%= ppfx %>field-arrow-d"></div>
  </div>`),

  initialize(opts) {
    _.bindAll(this, 'moveIncrement', 'upIncrement');
    var opt = opts || {};
    var ppfx = opt.ppfx || '';
    var contClass = opt.contClass || (`${ppfx}field ${ppfx}field-integer`);
    this.ppfx = ppfx;
    this.doc = document;
    this.inputCls = ppfx + 'field-number';
    this.unitCls = ppfx + 'input-unit';
    this.contClass = contClass;
    this.events = {};
    this.events[`click .${ppfx}field-arrow-u`] = 'upArrowClick';
    this.events[`click .${ppfx}field-arrow-d`] = 'downArrowClick';
    this.events[`mousedown .${ppfx}field-arrows`] = 'downIncrement';
    this.events[`change .${this.inputCls}`] = 'handleChange';
    this.events[`change .${this.unitCls}`] = 'handleUnitChange';
    this.listenTo(this.model, 'change:unit change:value', this.handleModelChange);
    this.delegateEvents();
  },

  /**
   * Set value to the model
   * @param {string} value
   * @param {Object} opts
   */
  setValue(value, opts) {
    var opt = opts || {};
    var valid = this.validateInputValue(value, {deepCheck: 1});
    var validObj = {value: valid.value};

    // If found some unit value
    if(valid.unit || valid.force) {
      validObj.unit = valid.unit;
    }

    this.model.set(validObj, opt);

    // Generally I get silent when I need to reflect data to view without
    // reupdating the target
    if(opt.silent) {
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
    var m = this.model;
    this.getInputEl().value = m.get('value');
    var unit = this.getUnitEl();

    if (unit) {
      unit.value = m.get('unit');
    }
  },

  /**
   * Get the input element
   * @return {HTMLElement}
   */
  getInputEl() {
    if (!this.inputEl) {
      const cls = this.inputCls;
      const plh = this.model.get('defaults');
      this.inputEl = $(`<input type="text" class="${cls}" placeholder="${plh}">`);
    }
    return this.inputEl.get(0);
  },

  /**
   * Get the unit element
   * @return {HTMLElement}
   */
  getUnitEl() {
    if(!this.unitEl) {
      var model = this.model;
      var units = model.get('units') || [];
      if(units.length){
        var unitStr = '<select class="' + this.unitCls + '">';
        _.each(units, unit => {
          var selected = unit == model.get('unit') ? 'selected': '';
          unitStr += '<option ' + selected + ' >' + unit + '</option>';
        });
        unitStr += '</select>';
        const temp = document.createElement('div');
        temp.innerHTML = unitStr;
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
    let value  = model.get('value');
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
    let value  = model.get('value');
    value = this.normalizeValue(value - step);
    var valid = this.validateInputValue(value);
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
    this.current = {y: e.pageY, val: value};
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
    model.set('value', this.prValue, {avoidStore: 1});
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

    if(this.prValue && this.moved) {
      var value = this.prValue - step;
      model.set('value', value, {avoidStore: 1})
        .set('value', value + step);
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
      stepDecimals = step.toString().split('.')[1].length || 0;
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
    var val = value || model.get('defaults');
    var units = model.get('units') || [];
    var unit = model.get('unit') || (units.length && units[0]) || '';
    var max = model.get('max');
    var min = model.get('min');

    if(opt.deepCheck) {
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
          val = !isNaN(val) ? val : model.get('defaults');
          var uN = valCopy.replace(val, '');
          // Check if exists as unit
          if(_.indexOf(units, uN) >= 0)
            unit = uN;
        }
      }
    }

    if(typeof max !== 'undefined' && max !== '')
      val = val > max ? max : val;

    if(typeof min !== 'undefined' && min !== '')
      val = val < min ? min : val;

    return {
      force,
      value: val,
      unit
    };
  },

  render() {
    const ppfx = this.ppfx;
    const el = this.$el;
    el.html(this.template({ppfx}));
    el.find(`.${ppfx}input-holder`).append(this.getInputEl());
    const unit = this.getUnitEl();
    unit && el.find(`.${ppfx}field-units`).get(0).appendChild(unit);
    el.addClass(this.contClass);
    return this;
  }

});
