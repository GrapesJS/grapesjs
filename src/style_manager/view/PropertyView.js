var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  template: _.template(`
  <div class="<%= ppfx %>field">
    <span id='<%= pfx %>input-holder'></span>
  </div>
  <div style="clear:both"></div>`),

  templateLabel: _.template(`
  <div class="<%= pfx %>label">
    <span class="<%= pfx %>icon <%= icon %>" title="<%= info %>">
      <%= label %>
    </span>
    <b class="<%= pfx %>clear">&Cross;</b>
  </div>`),

  events: {
    'change': 'valueUpdated'
  },

  initialize(o) {
    this.config = o.config || {};
    this.em = this.config.em;
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.target = o.target || {};
    this.propTarget = o.propTarget || {};
    this.onChange = o.onChange || {};
    this.onInputRender = o.onInputRender  || {};
    this.customValue  = o.customValue  || {};
    this.defaultValue = this.model.get('defaults');
    this.property = this.model.get('property');
    this.input = this.$input = null;
    const pfx = this.pfx;
    this.className = pfx + 'property';
    this.inputHolderId = '#' + pfx + 'input-holder';
    this.sector = this.model.collection && this.model.collection.sector;

    if(!this.model.get('value'))
      this.model.set('value', this.model.get('defaults'));

    this.listenTo(this.propTarget, 'update', this.targetUpdated);
    this.listenTo(this.model, 'destroy remove', this.remove);
    this.listenTo(this.model, 'change:value', this.valueChanged);
    this.listenTo(this.model, 'targetUpdated', this.targetUpdated);
    this.listenTo(this.model, 'change:visible', this.updateVisibility);
    this.listenTo(this.model, 'change:status', this.updateStatus);
    this.events[`click .${pfx}clear`] = 'clear';
    this.delegateEvents();
  },

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
   * Clear the property
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
   * @deprecated
   * @return {Model|null}
   */
  getTarget() {
    return this.propTarget && this.propTarget.model;
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
   * Fired when the input value is updated
   */
  valueUpdated() {
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

    let value = '';
    let status = '';
    let targetValue = this.getTargetValue({ignoreDefault: 1});
    let defaultValue = this.getDefaultValue();
    let computedValue = this.getComputedValue();
    const config = this.config;
    const em = config.em;
    const model = this.model;

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

    //value = this.tryFetchFromFunction(value);
    this.setValue(value, 1);
    this.model.set('status', status);

    if (em) {
      em.trigger('styleManager:change', this);
      em.trigger(`styleManager:change:${model.get('property')}`, this);
    }

    /*
    if(this.getTarget()) {
      if(!this.sameValue()){
        this.renderInputRequest();
      }
    }*/

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
   * Checks if the value from selected component is the
   * same of the value of the model
   *
   * @return {Boolean}
   * */
  sameValue() {
    return this.getComponentValue() == this.getValueForTarget();
  },


  /**
   * Get the value from the selected component of this property
   * @return {String}
   * */
  getComponentValue() {
    var propModel = this.model;
    var target = this.getTargetModel();

    if(!target)
      return;

    var targetProp = target.get('style')[this.property];
    if(targetProp)
      this.componentValue = targetProp;
    else
      this.componentValue = this.defaultValue + (this.unit || ''); // todo model

    // Check if wrap inside function is required
    if (propModel.get('functionName')) {
      var v = this.fetchFromFunction(this.componentValue);
      if(v)
        this.componentValue = v;
    }

    // This allow to ovveride the normal flow of selecting component value,
    // useful in composite properties
    if(this.customValue && typeof this.customValue === "function"){
      var index = propModel.collection.indexOf(propModel);
      var t = this.customValue(this, index);
      if(t)
        this.componentValue = t;
    }

    return this.componentValue;
  },

  /**
   * Refactor of getComponentValue
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

    if (!result && !opts.ignoreDefault) {
      result = this.getDefaultValue();
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
   * Returns default value
   * @return {String}
   * @private
   */
  getDefaultValue() {
    return this.model.get('defaults');
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
   * Fetch the string from function type value
   * @param {String} v Function type value
   *
   * @return {String}
   * */
  fetchFromFunction(v) {
    return v.substring(v.indexOf("(") + 1, v.lastIndexOf(")"));
  },

  tryFetchFromFunction(value) {
    if (!this.model.get('functionName')) {
      return value;
    }

    var valueStr = value + '';
    var start = valueStr.indexOf("(") + 1;
    var end = valueStr.lastIndexOf(")");
    return valueStr.substring(start, end);
  },

  /**
   * Returns value from inputs
   * @return {string}
   */
  getValueForTarget() {
    return this.model.get('value');
  },

  /**
   * Returns value from input
   * @return {string}
   */
  getInputValue() {
    return this.$input ? this.$input.val() : '';
  },

  /**
   * Property was changed, so I need to update the component too
   * @param   {Object}  e  Events
   * @param    {Mixed}    val  Value
   * @param    {Object}  opt  Options
   * */
  valueChanged(e, val, opt) {
    var mVal = this.getValueForTarget();
    var em = this.config.em;
    var model = this.model;

    if(this.$input)
      this.setValue(mVal);

    if(!this.getTarget())
      return;

    // Check if component is allowed to be styled
    if (!this.isTargetStylable() || !this.isComponentStylable()) {
      return;
    }

    var value = this.getValueForTarget();

    var func = model.get('functionName');
    if(func)
      value =  func + '(' + value + ')';

    var target = this.getTarget();
    var onChange = this.onChange;

    if(onChange && typeof onChange === "function"){
      onChange(target, this, opt);
    }else
      this.updateTargetStyle(value, null, opt);

    if(em){
      em.trigger('component:update', model);
      em.trigger('component:styleUpdate', model);
      em.trigger('component:styleUpdate:' + model.get('property'), model);
    }
  },

  /**
   * Update target style
   * @param  {string} propertyValue
   * @param  {string} propertyName
   * @param  {Object} opts
   */
  updateTargetStyle(propertyValue, propertyName, opts) {
    var propName = propertyName || this.property;
    var value = propertyValue || '';
    var avSt = opts ? opts.avoidStore : 0;
    var target = this.getTarget();
    var targetStyle = _.clone(target.get('style'));

    if(value)
      targetStyle[propName] = value;
    else
      delete targetStyle[propName];

    target.set('style', targetStyle, { avoidStore : avSt});

    // Helper exists when is active a State in Style Manager
    let helper = this.getHelperModel();
    helper && helper.setStyle(targetStyle, {avoidStore: avSt});
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
   * Set value to the input
   * @param   {String}  value
   * @param   {Boolean}  force
   * */
  setValue(value, force) {
    var f = force === 0 ? 0 : 1;
    var def = this.model.get('defaults');
    var v = this.model.get('value') || def;
    if(value || f){
      v = value;
    }
    if(this.$input)
      this.$input.val(v);
    this.model.set({value: v}, {silent: true});
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

  renderLabel() {
    let model = this.model;
    this.$el.html(this.templateLabel({
      pfx: this.pfx,
      ppfx: this.ppfx,
      icon: model.get('icon'),
      info: model.get('info'),
      label: model.get('name'),
    }));
  },

  /**
   * Render field property
   * */
  renderField() {
    this.renderTemplate();
    this.renderInput();
    delete this.componentValue;
  },

  /**
   * Render loaded template
   * */
  renderTemplate() {
    this.$el.append( this.template({
      pfx    : this.pfx,
      ppfx  : this.ppfx,
      icon  : this.model.get('icon'),
      info  : this.model.get('info'),
      label  : this.model.get('name'),
    }));
  },

  /**
   * Renders input, to override
   * */
  renderInput() {
    if(!this.$input){
      this.$input = $('<input>', {
        placeholder: this.model.get('defaults'),
        type: 'text'
      });
      this.$el.find(this.inputHolderId).html(this.$input);
    }
    this.setValue(this.componentValue, 0);
  },

  /**
   * Request to render input of the property
   * */
  renderInputRequest() {
    this.renderInput();
  },

  /**
   * Clean input
   * */
  cleanValue() {
    this.setValue('');
  },

  render() {
    this.renderLabel();
    this.renderField();
    this.$el.attr('class', this.className);
    this.updateStatus();
    return this;
  },

});
