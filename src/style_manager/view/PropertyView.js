var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  template: _.template(`
  <div class="<%= ppfx %>field">
    <span id='<%= pfx %>input-holder'></span>
  </div>
  <div style="clear:both"></div>`),

  templateLabel: _.template(`
  <div class="<%= pfx %>label">
    <div class="<%= pfx %>icon <%= icon %>" title="<%= info %>">
      <%= label %>
    </div>
  </div>`),

  events: {'change': 'valueUpdated'},

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
    this.className = this.pfx  + 'property';
    this.inputHolderId = '#' + this.pfx + 'input-holder';
    this.sector = this.model.collection && this.model.collection.sector;

    if(!this.model.get('value'))
      this.model.set('value', this.model.get('defaults'));

    this.listenTo(this.propTarget, 'update', this.targetUpdated);
    this.listenTo(this.model, 'destroy remove', this.remove);
    this.listenTo(this.model, 'change:value', this.valueChanged);
    this.listenTo(this.model, 'targetUpdated', this.targetUpdated);
    this.listenTo(this.model, 'change:visible', this.updateVisibility);
  },

  /**
   * Returns selected target which should have 'style' property
   * @return {Model|null}
   */
  getTarget() {
    if(this.selectedComponent)
      return this.selectedComponent;
    return this.propTarget ? this.propTarget.model : null;
  },

  /**
   * Fired when the input value is updated
   */
  valueUpdated() {
    if(this.$input)
      this.model.set('value', this.getInputValue());
  },

  /**
   * Fired when the target is updated
   * */
  targetUpdated() {
    this.selectedComponent = this.propTarget.model;
    this.helperComponent = this.propTarget.helper;
    this.checkVisibility();

    if(this.getTarget()) {
      if(!this.sameValue()){
        this.renderInputRequest();
      }
    }
  },

  checkVisibility() {
    // Check if need to hide the property
    if (this.config.hideNotStylable) {
      if (!this.isTargetStylable() || !this.isComponentStylable()) {
        this.hide();
      } else {
        this.show();
      }
      // Sector is not passed to Composite and Stack types
      if (this.sector) {
        this.sector.trigger('updateVisibility');
      }
    }
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
   *
   * @return {String}
   * */
  getComponentValue() {
    var propModel = this.model;
    var target = this.getTarget();

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
  getTargetValue(opts) {
    var result;
    var opt = opts || {};
    var model = this.model;
    var target = this.getTarget();

    if (!target) {
      return result;
    }

    result = target.get('style')[model.get('property')];

    if (!result && !opt.ignoreDefault) {
      result = this.getDefaultValue();
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

    var start = value.indexOf("(") + 1;
    var end = value.lastIndexOf(")");
    return value.substring(start, end);
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

    if(this.helperComponent)
      this.helperComponent.set('style', targetStyle, { avoidStore : avSt});
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
    this.$el.html( this.templateLabel({
      pfx    : this.pfx,
      ppfx  : this.ppfx,
      icon  : this.model.get('icon'),
      info  : this.model.get('info'),
      label  : this.model.get('name'),
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
    return this;
  },

});
