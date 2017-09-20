var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  template(model) {
    const pfx = this.pfx;
    return `
      <div class="${pfx}label">
        ${this.templateLabel(model)}
      </div>
      <div class="${this.ppfx}fields">
        ${this.templateInput(model)}
      </div>
    `;
  },

  templateLabel(model) {
    const pfx = this.pfx;
    const icon = model.get('icon');
    const info = model.get('info');
    return `
      <span class="${pfx}icon ${icon}" title="${info}">
        ${model.get('name')}
      </span>
      <b class="${pfx}clear">&Cross;</b>
    `;
  },

  templateInput(model) {
    return `
      <div class="${this.ppfx}field">
        <input placeholder="${model.getDefaultValue()}"/>
      </div>
    `;
  },

  events: {
    'change': 'inputValueChanged'
  },

  initialize(o = {}) {
    this.config = o.config || {};
    this.em = this.config.em;
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.target = o.target || {};
    this.propTarget = o.propTarget || {};
    this.onChange = o.onChange;
    this.onInputRender = o.onInputRender  || {};
    this.customValue  = o.customValue  || {};
    const model = this.model;
    this.property = model.get('property');
    this.input = this.$input = null;
    const pfx = this.pfx;
    this.inputHolderId = '#' + pfx + 'input-holder';
    this.sector = model.collection && model.collection.sector;

    if (!model.get('value')) {
      model.set('value', model.getDefaultValue());
    }

    this.listenTo(this.propTarget, 'update', this.targetUpdated);
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model, 'change:value', this.modelValueChanged);
    this.listenTo(model, 'targetUpdated', this.targetUpdated);
    this.listenTo(model, 'change:visible', this.updateVisibility);
    this.listenTo(model, 'change:status', this.updateStatus);
    this.events[`click .${pfx}clear`] = 'clear';
    this.delegateEvents();

    const init = this.init && this.init.bind(this);
    init && init();
  },

  /**
   * Triggers when the status changes. The status indicates if the value of
   * the proprerty is changed or inherited
   * @private
   */
  updateStatus() {
    const status = this.model.get('status');
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    const config = this.config;
    const updatedCls = `${ppfx}color-hl`;
    const computedCls = `${ppfx}color-warn`;
    const labelEl = this.$el.find(`> .${pfx}label`);
    const clearStyle = this.getClearEl().style;
    labelEl.removeClass(`${updatedCls} ${computedCls}`);
    clearStyle.display = 'none';

    switch (status) {
      case 'updated':
        labelEl.addClass(updatedCls);

        if (config.clearProperties) {
          clearStyle.display = 'inline';
        }
        break;
      case 'computed':
        labelEl.addClass(computedCls);
        break;
    }
  },

  /**
   * Clear the property from the target
   */
  clear() {
    const target = this.getTargetModel();
    target.removeStyle(this.model.get('property'));
    this.targetUpdated();
  },

  /**
   * Get clear element
   * @return {HTMLElement}
   */
  getClearEl() {
    return this.el.querySelector(`.${this.pfx}clear`);
  },

  /**
   * Returns selected target which should have 'style' property
   * @return {Model|null}
   */
  getTarget() {
    return this.getTargetModel();
  },

  /**
   * Returns Styleable model
   * @return {Model|null}
   */
  getTargetModel() {
    return this.propTarget && this.propTarget.model;
  },

  /**
   * Returns helper Styleable model
   * @return {Model|null}
   */
  getHelperModel() {
    return this.propTarget && this.propTarget.helper;
  },

  /**
   * Triggers when the value of element input/s is changed, so have to update
   * the value of the model which will propogate those changes to the target
   */
  inputValueChanged() {
    this.model.set('value', this.getInputValue());
    this.elementUpdated();
  },

  /**
   * Fired when the element of the property is updated
   */
  elementUpdated() {
    this.model.set('status', 'updated');
  },

  /**
   * Fired when the target is changed
   * */
  targetUpdated() {
    if (!this.checkVisibility()) {
      return;
    }

    const config = this.config;
    const em = config.em;
    const model = this.model;
    let value = '';
    let status = '';
    let targetValue = this.getTargetValue({ignoreDefault: 1});
    let defaultValue = model.getDefaultValue();
    let computedValue = this.getComputedValue();

    if (targetValue) {
      value = targetValue;

      if (config.highlightChanged) {
        status = 'updated';
      }
    } else if (computedValue && config.showComputed &&
        computedValue != defaultValue) {
      value = computedValue;

      if (config.highlightComputed) {
        status = 'computed';
      }
    } else {
      value = defaultValue;
      status = '';
    }

    model.set('value', value, {silent: 1});
    this.setValue(value, {targetUpdate: 1});
    model.set('status', status);

    if (em) {
      em.trigger('styleManager:change', this);
      em.trigger(`styleManager:change:${model.get('property')}`, this);
    }
  },

  checkVisibility() {
    var result = 1;

    // Check if need to hide the property
    if (this.config.hideNotStylable) {
      if (!this.isTargetStylable() || !this.isComponentStylable()) {
        this.hide();
        result = 0;
      } else {
        this.show();
      }
      // Sector is not passed to Composite and Stack types
      if (this.sector) {
        this.sector.trigger('updateVisibility');
      }
    }

    return result;
  },

  /**
   * Get the value of this property from the target (eg, Component, CSSRule)
   * @param {Object} [opts] Options
   * @param {Boolean} [options.fetchFromFunction]
   * @param {Boolean} [options.ignoreDefault]
   * @return string
   * @private
   */
  getTargetValue(opts = {}) {
    var result;
    var model = this.model;
    var target = this.getTargetModel();
    var customFetchValue = this.customValue;

    if (!target) {
      return result;
    }

    result = target.getStyle()[model.get('property')];

    // TODO when stack type asks the sub-property (in valueOnIndex method)
    // to provide its target value and its detached, I should avoid parsing
    // (at least is wrong applying 'functionName' cleaning)
    result = model.parseValue(result);

    if (!result && !opts.ignoreDefault) {
      result = model.getDefaultValue();
    }

    if (typeof customFetchValue == 'function' && !opts.ignoreCustomValue) {
      let index = model.collection.indexOf(model);
      let customValue = customFetchValue(this, index);

      if (customValue) {
        result = customValue;
      }
    }

    return result;
  },

  /**
   * Returns computed value
   * @return {String}
   * @private
   */
  getComputedValue() {
    let computed = this.propTarget.computed;
    const valid = this.config.validComputed;
    const property = this.model.get('property');
    return computed && valid.indexOf(property) >= 0 && computed[property];
  },

  /**
   * Returns value from input
   * @return {string}
   */
  getInputValue() {
    const input = this.getInputEl();
    return input ? input.value : '';
  },

  /**
   * Triggers when the `value` of the model changes, so the target and
   * the input element should be updated
   * @param {Object} e  Event
   * @param {Mixed} val  Value
   * @param {Object} opt  Options
   * */
  modelValueChanged(e, val, opt) {
    const em = this.config.em;
    const model = this.model;
    const value = model.getFullValue();
    const target = this.getTarget();
    const onChange = this.onChange;
    this.setRawValue(value);

    // Check if component is allowed to be styled
    if (!target || !this.isTargetStylable() || !this.isComponentStylable()) {
      return;
    }

    if (onChange) {
      onChange(target, this, opt);
    } else {
      this.updateTargetStyle(value, null, opt);
    }

    if (em) {
      em.trigger('component:update', model);
      em.trigger('component:styleUpdate', model);
      em.trigger('component:styleUpdate:' + model.get('property'), model);
    }
  },

  /**
   * Update target style
   * @param  {string} value
   * @param  {string} name
   * @param  {Object} opts
   */
  updateTargetStyle(value, name = '', opts = {}) {
    const property = name || this.model.get('property');
    const target = this.getTarget();
    const style = target.getStyle();

    if (value) {
      style[property] = value;
    } else {
      delete style[property];
    }

    target.setStyle(style, opts);

    // Helper is used by `states` like ':hover' to show its preview
    const helper = this.getHelperModel();
    helper && helper.setStyle(style, opts);
  },

  /**
   * Check if target is stylable with this property
   * The target could be the Component as the CSS Rule
   * @return {Boolean}
   */
  isTargetStylable() {
    var stylable = this.getTarget().get('stylable');
    // Stylable could also be an array indicating with which property
    // the target could be styled
    if(stylable instanceof Array)
      stylable = _.indexOf(stylable, this.property) >= 0;
    return stylable;
  },

  /**
   * Check if the selected component is stylable with this property
   * The target could be the Component as the CSS Rule
   * @return {Boolean}
   */
  isComponentStylable() {
    var em = this.em;
    var component = em && em.get('selectedComponent');

    if (!component) {
      return true;
    }

    var stylable = component.get('stylable');
    // Stylable could also be an array indicating with which property
    // the target could be styled
    if(stylable instanceof Array){
      stylable = _.indexOf(stylable, this.property) >= 0;
    }

    return stylable;
  },

  /**
   * Passed a raw value you have to update the input element, generally
   * is the value fetched from targets, so you can receive values with
   * functions, units, etc. (eg. `rotateY(45deg)`)
   * get also
   * @param {string} value
   * @private
   */
  setRawValue(value) {
    this.setValue(this.model.parseValue(value));
  },

  /**
   * Set the value to property input
   * @param {String} value
   * @param {Boolean} force
   * @private
   * */
  setValue(value, opts = {}) {
    const model = this.model;
    let val = value || model.get('value') || model.getDefaultValue();
    const input = this.getInputEl();
    input && (input.value = val);
  },

  getInputEl() {
    if (!this.input) {
      this.input = this.el.querySelector('input');
    }

    return this.input;
  },

  updateVisibility() {
    this.el.style.display = this.model.get('visible') ?
      'block' : 'none';
  },

  show() {
    this.model.set('visible', 1);
  },

  hide() {
    this.model.set('visible', 0);
  },

  /**
   * Clean input
   * */
  cleanValue() {
    this.setValue('');
  },

  render() {
    const pfx = this.pfx;
    const model = this.model;
    const el = this.el;
    el.innerHTML = this.template(model);
    el.className = `${pfx}property ${pfx}${model.get('type')}`;
    this.updateStatus();

    const onRender = this.onRender && this.onRender.bind(this);
    onRender && onRender();
  },

});
