import Backbone from 'backbone';
import { bindAll, isArray, isUndefined, debounce } from 'underscore';
import { camelCase, isObject } from 'utils/mixins';
import { includes, each } from 'underscore';

const clearProp = 'data-clear-style';

export default Backbone.View.extend({
  template() {
    const { pfx, ppfx } = this;
    return `
      <div class="${pfx}label" data-sm-label></div>
      <div class="${ppfx}fields" data-sm-fields></div>
    `;
  },

  templateLabel(model) {
    const { pfx, em } = this;
    const { parent } = model;
    const { icon = '', info = '', id, name } = model.attributes;
    const label = (em && em.t(`styleManager.properties.${id}`)) || name;

    return `
      <span class="${pfx}icon ${icon}" title="${info}">
        ${label}
      </span>
      ${!parent ? `<b class="${pfx}clear" ${clearProp}>&Cross;</b>` : ''}
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
    change: 'inputValueChanged',
    [`click [${clearProp}]`]: 'clear'
  },

  initialize(o = {}) {
    bindAll(this, 'targetUpdated', '__change', '__updateStyle');
    this.config = o.config || {};
    const em = this.config.em;
    this.em = em;
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.target = o.target || {};
    this.propTarget = o.propTarget || {};
    this.onChange = o.onChange;
    this.onInputRender = o.onInputRender || {};
    this.customValue = o.customValue || {};
    const model = this.model;
    this.property = model.get('property');
    this.input = null;
    const pfx = this.pfx;
    this.inputHolderId = '#' + pfx + 'input-holder';
    this.sector = model.collection && model.collection.sector;
    this.__destroyFn = this.destroy ? this.destroy.bind(this) : () => {};
    model.view = this;

    if (!model.get('value')) {
      model.set('value', model.getDefaultValue());
    }

    if (em) {
      this.listenTo(
        em,
        `update:component:style:${this.property}`,
        this.targetUpdated
      );
      //this.listenTo(em, `styleable:change:${this.property}`, this.targetUpdated);

      // Listening to changes of properties in this.requires, so that styleable
      // changes based on other properties are propagated
      const requires = model.get('requires') || {};
      Object.keys(requires).forEach(property => {
        this.listenTo(
          em,
          `component:styleUpdate:${property}`,
          this.targetUpdated
        );
      });
    }

    this.listenTo(this.propTarget, 'update', this.targetUpdated);
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model, 'change:value', this.modelValueChanged);
    this.listenTo(model, 'targetUpdated', this.targetUpdated);
    this.listenTo(model, 'change:visible', this.updateVisibility);
    this.listenTo(model, 'change:status', this.updateStatus);
    this.listenTo(
      model,
      'change:name change:className change:full',
      this.render
    );

    const init = this.init && this.init.bind(this);
    init && init();
  },

  remove() {
    Backbone.View.prototype.remove.apply(this, arguments);
    ['em', 'target', 'input', '$input', 'propTarget', 'sector'].forEach(
      i => (this[i] = {})
    );
    this.__destroyFn(this._getClbOpts());
  },

  /**
   * Triggers when the status changes. The status indicates if the value of
   * the proprerty is changed or inherited
   * @private
   */
  updateStatus() {
    const { model } = this;
    const status = model.get('status');
    const parent = model.parent;
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    const config = this.config;
    const updatedCls = `${ppfx}four-color`;
    const computedCls = `${ppfx}color-warn`;
    const labelEl = this.$el.children(`.${pfx}label`);
    const clearStyleEl = this.getClearEl();
    const clearStyle = clearStyleEl ? clearStyleEl.style : {};
    labelEl.removeClass(`${updatedCls} ${computedCls}`);
    clearStyle.display = 'none';

    switch (status) {
      case 'updated':
        !parent && labelEl.addClass(updatedCls);

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
  clear(ev) {
    ev && ev.stopPropagation();
    this.model.clearValue();
    // Skip one stack with setTimeout to avoid inconsistencies (eg. visible on padding composite clear)
    setTimeout(() => this.targetUpdated());
  },

  /**
   * Get clear element
   * @return {HTMLElement}
   */
  getClearEl() {
    if (!this.clearEl) {
      this.clearEl = this.el.querySelector(`[${clearProp}]`);
    }

    return this.clearEl;
  },

  /**
   * Returns selected target which should have 'style' property
   * @return {Model|null}
   */
  getTarget() {
    return this.getTargetModel();
  },

  getTargets() {
    const { targets } = this.propTarget;
    return targets || [this.getTarget()];
  },

  getFirstTarget() {
    return this.getTargets()[0];
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
  inputValueChanged(ev) {
    ev && ev.stopPropagation();
    if (this.emit) return;
    this.model.setValueFromInput(this.getInputValue());
    this.elementUpdated();
  },

  /**
   * Fired when the element of the property is updated
   */
  elementUpdated() {
    this.setStatus('updated');
  },

  setStatus(value) {
    this.model.set('status', value);
    const parent = this.model.parent;
    parent && value == 'updated' && parent.set('status', value);
  },

  emitUpdateTarget: debounce(function() {
    const em = this.config.em;
    em && em.trigger('styleManager:update:target', this.getFirstTarget());
  }),

  _getTargetData() {
    const { model, config } = this;
    const targetValue = this.getTargetValue({ ignoreDefault: 1 });
    const defaultValue = model.getDefaultValue();
    const computedValue = this.getComputedValue();
    let value = '';
    let status = '';

    if (targetValue) {
      value = targetValue;

      if (config.highlightChanged) {
        status = 'updated';
      }
    } else if (
      computedValue &&
      config.showComputed &&
      computedValue != defaultValue
    ) {
      value = computedValue;

      if (config.highlightComputed) {
        status = 'computed';
      }
    } else {
      value = defaultValue;
      status = '';
    }

    return {
      value,
      status,
      targetValue,
      defaultValue,
      computedValue
    };
  },

  /**
   * Fired when the target is changed
   * */
  targetUpdated(mod, val, opts = {}) {
    //  Skip properties rendered in Stack Layers
    if (this.config.fromLayer) return;

    this.emitUpdateTarget();

    if (!this.checkVisibility()) {
      return;
    }

    const config = this.config;
    const em = config.em;
    const { model } = this;
    const property = model.get('property');
    const { status, value, ...targetData } = this._getTargetData();
    const data = {
      status,
      value,
      ...targetData
    };

    this.setStatus(status);
    model.setValue(value, 0, { fromTarget: 1, ...opts });

    if (em) {
      em.trigger('styleManager:change', this, property, value, data);
      em.trigger(`styleManager:change:${property}`, this, value, data);
      this._emitUpdate(data);
    }

    return data;
  },

  _emitUpdate(addData = {}) {
    const { em, model } = this;
    if (!em) return;
    const property = model.get('property');
    const data = { ...this._getEventData(), ...addData };
    const { id } = data;

    em.trigger('style:update', data);
    em.trigger(`style:update:${property}`, data);
    property !== id && em.trigger(`style:update:${id}`, data);
  },

  _getEventData() {
    const { model } = this;

    return {
      propertyView: this,
      targets: this.getTargets(),
      value: model.getFullValue(),
      property: model,
      id: model.get('id'),
      name: model.get('property')
    };
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
    let result;
    const { model } = this;
    const target = this.getFirstTarget();
    const customFetchValue = this.customValue;

    if (!target) {
      return result;
    }

    result = target.getStyle()[model.get('property')];

    if (!result && !opts.ignoreDefault) {
      result = model.getDefaultValue();
    }

    if (typeof customFetchValue == 'function' && !opts.ignoreCustomValue) {
      let index = model.collection.indexOf(model);
      let customValue = customFetchValue(this, index, result);

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
    const target = this.propTarget;
    const computed = target.computed || {};
    const computedDef = target.computedDefault || {};
    const avoid = this.config.avoidComputed || [];
    const property = this.model.get('property');
    const notToSkip = avoid.indexOf(property) < 0;
    const value = computed[property];
    const valueDef = computedDef[camelCase(property)];
    return (computed && notToSkip && valueDef !== value && value) || '';
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
  modelValueChanged(e, val, opt = {}) {
    const { model } = this;
    const value = model.getFullValue();

    // Avoid element update if the change comes from it
    if (!opt.fromInput) {
      this.setValue(value);
    }

    // Avoid target update if the changes comes from it
    if (!opt.fromTarget) {
      this.getTargets().forEach(target => this.__updateTarget(target, opt));

      // Update the editor and selected components about the change
      const { em } = this.config;
      if (!em) return;
      const prop = model.get('property');
      const updated = { [prop]: value };
      em.getSelectedAll().forEach(component => {
        !opt.noEmit && em.trigger('component:update', component, updated, opt);
        em.trigger('component:styleUpdate', component, prop, opt);
        em.trigger(`component:styleUpdate:${prop}`, component, value, opt);
        component.trigger(`change:style`, component, updated, opt);
        component.trigger(`change:style:${prop}`, component, value, opt);
      });
    }
  },

  __updateTarget(target, opt = {}) {
    const { model } = this;
    const value = model.getFullValue();
    const onChange = this.onChange;

    // Check if component is allowed to be styled
    if (!target || !this.isComponentStylable()) {
      return;
    }

    // Avoid target update if the changes comes from it
    if (!opt.fromTarget) {
      // The onChange is used by Composite/Stack properties, so I'd avoid sending
      // it back if the change comes from one of those
      if (onChange && !opt.fromParent) {
        onChange(target, this, opt);
      } else {
        this.updateTargetStyle(value, null, { ...opt, target });
      }
    }

    this._emitUpdate();
  },

  /**
   * Update target style
   * @param  {string} value
   * @param  {string} name
   * @param  {Object} opts
   */
  updateTargetStyle(value, name = '', opts = {}) {
    const property = name || this.model.get('property');
    const target = opts.target || this.getFirstTarget();
    const style = target.getStyle();

    if (value) {
      style[property] = value;
    } else {
      delete style[property];
    }

    // Forces to trigger the change (for UndoManager)
    if (opts.avoidStore) {
      style.__ = 1;
    } else {
      delete style.__;
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
  isTargetStylable(target) {
    const trg = target || this.getFirstTarget();
    const model = this.model;
    const id = model.get('id');
    const property = model.get('property');
    const toRequire = model.get('toRequire');
    const unstylable = trg.get('unstylable');
    const stylableReq = trg.get('stylable-require');
    const requires = model.get('requires');
    const requiresParent = model.get('requiresParent');
    const sectors = this.sector ? this.sector.collection : null;
    const selected = this.em ? this.em.getSelected() : null;
    let stylable = trg.get('stylable');

    // Stylable could also be an array indicating with which property
    // the target could be styled
    if (isArray(stylable)) {
      stylable = stylable.indexOf(property) >= 0;
    }

    // Check if the property was signed as unstylable
    if (isArray(unstylable)) {
      stylable = unstylable.indexOf(property) < 0;
    }

    // Check if the property is available only if requested
    if (toRequire) {
      stylable =
        !target ||
        (stylableReq &&
          (stylableReq.indexOf(id) >= 0 || stylableReq.indexOf(property) >= 0));
    }

    // Check if the property is available based on other property's values
    if (sectors && requires) {
      const properties = Object.keys(requires);
      sectors.each(sector => {
        sector.get('properties').each(model => {
          if (includes(properties, model.id)) {
            const values = requires[model.id];
            stylable = stylable && includes(values, model.get('value'));
          }
        });
      });
    }

    // Check if the property is available based on parent's property values
    if (requiresParent) {
      const parent = selected && selected.parent();
      const parentEl = parent && parent.getEl();
      if (parentEl) {
        const styles = window.getComputedStyle(parentEl);
        each(requiresParent, (values, property) => {
          stylable =
            stylable && styles[property] && includes(values, styles[property]);
        });
      } else {
        stylable = false;
      }
    }

    return stylable;
  },

  /**
   * Check if the selected component is stylable with this property
   * The target could be the Component as the CSS Rule
   * @return {Boolean}
   */
  isComponentStylable() {
    const em = this.em;
    const component = em && em.getSelected();

    if (!component) {
      return true;
    }

    return this.isTargetStylable(component);
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
   * Update the element input.
   * Usually the value is a result of `model.getFullValue()`
   * @param {String} value The value from the model
   * */
  setValue(value) {
    const model = this.model;
    let val = isUndefined(value) ? model.getDefaultValue() : value;
    if (this.update) return this.__update(val);
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
    this.el.style.display = this.model.get('visible') ? '' : 'none';
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

  clearCached() {
    this.clearEl = null;
    this.input = null;
    this.$input = null;
  },

  __update(value) {
    const update = this.update && this.update.bind(this);
    update &&
      update({
        ...this._getClbOpts(),
        value
      });
  },

  __change(...args) {
    const emit = this.emit && this.emit.bind(this);
    emit && emit(this._getClbOpts(), ...args);
  },

  __updateStyle(value, { complete, ...opts } = {}) {
    const final = complete !== false;

    if (isObject(value)) {
      this.getTargets().forEach(target =>
        target.addStyle(value, { avoidStore: !final })
      );
    } else {
      this.model.setValueFromInput(value, complete, opts);
    }

    final && this.elementUpdated();
  },

  _getClbOpts() {
    const { model, el } = this;
    return {
      el,
      props: model.attributes,
      setProps: (...args) => model.set(...args),
      change: this.__change,
      updateStyle: this.__updateStyle,
      targets: this.getTargets()
    };
  },

  render() {
    this.clearCached();
    const { pfx, model, el, $el } = this;
    const property = model.get('property');
    const full = model.get('full');
    const cls = model.get('className') || '';
    const className = `${pfx}property`;

    this.createdEl && this.__destroyFn(this._getClbOpts());
    $el.empty().append(this.template(model));
    $el.find('[data-sm-label]').append(this.templateLabel(model));
    const create = this.create && this.create.bind(this);
    this.createdEl = create && create(this._getClbOpts());
    $el
      .find('[data-sm-fields]')
      .append(this.createdEl || this.templateInput(model));

    el.className = `${className} ${pfx}${model.get(
      'type'
    )} ${className}__${property} ${cls}`.trim();
    el.className += full ? ` ${className}--full` : '';
    this.updateStatus();

    const onRender = this.onRender && this.onRender.bind(this);
    onRender && onRender();
    this.setValue(model.get('value'), { fromTarget: 1 });
  }
});
