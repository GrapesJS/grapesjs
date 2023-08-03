import { bindAll, isUndefined, debounce } from 'underscore';
import { View } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { isObject } from '../../utils/mixins';
import Property from '../model/Property';
import { StyleProps } from '../../domain_abstract/model/StyleableModel';

const clearProp = 'data-clear-style';

export interface ICustomPropertyView {
  create?: (data: ReturnType<PropertyView['_getClbOpts']>) => any;
  destroy?: (data: ReturnType<PropertyView['_getClbOpts']>) => any;
  update?: (data: ReturnType<PropertyView['_getClbOpts']> & { value: string }) => any;
  emit?: (data: ReturnType<PropertyView['_getClbOpts']>, ...args: any) => any;
  unset?: (data: ReturnType<PropertyView['_getClbOpts']>) => any;
}

export type CustomPropertyView<T> = ICustomPropertyView & T & ThisType<T & PropertyView>;

export default class PropertyView extends View<Property> {
  em: EditorModel;
  pfx: string;
  ppfx: string;
  config: any;
  parent?: PropertyView;
  __destroyFn!: Function;
  create?: Function;
  destroy?: Function;
  update?: Function;
  emit?: Function;
  unset?: Function;
  clearEl?: HTMLElement;
  createdEl?: HTMLElement;
  input?: HTMLInputElement;
  $input?: any;

  constructor(o = {}) {
    super(o);
    bindAll(this, '__change', '__updateStyle');
    // @ts-ignore
    const config = o.config || {};
    const { em } = config;
    this.config = config;
    this.em = em;
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.__destroyFn = this.destroy ? this.destroy.bind(this) : () => {};
    const { model } = this;
    // @ts-ignore
    model.view = this;

    // Put a sligh delay on debounce in order to execute the update
    // post styleManager.__upProps trigger.
    this.onValueChange = debounce(this.onValueChange.bind(this), 10);
    this.updateStatus = debounce(this.updateStatus.bind(this), 0);

    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model, 'change:visible', this.updateVisibility);
    this.listenTo(model, 'change:name change:className change:full', this.render);
    this.listenTo(model, 'change:value', this.onValueChange);
    this.listenTo(model, 'change:parentTarget', this.updateStatus);
    this.listenTo(em, 'change:device', this.onValueChange);

    // @ts-ignore
    const init = this.init && this.init.bind(this);
    init && init();
  }

  events() {
    return {
      change: 'inputValueChanged',
      [`click [${clearProp}]`]: 'clear',
    };
  }

  template(model: any) {
    const { pfx, ppfx } = this;
    return `
      <div class="${pfx}label" data-sm-label></div>
      <div class="${ppfx}fields" data-sm-fields></div>
    `;
  }

  templateLabel(model: Property) {
    const { pfx, em } = this;
    const { parent } = model;
    const { icon = '', info = '' } = model.attributes;
    const icons = em?.getConfig().icons;
    const iconClose = icons?.close || '';

    return `
      <span class="${pfx}icon ${icon}" title="${info}">
        ${model.getLabel()}
      </span>
      ${!parent ? `<div class="${pfx}clear" style="display: none" ${clearProp}>${iconClose}</div>` : ''}
    `;
  }

  templateInput(model: Property) {
    return `
      <div class="${this.ppfx}field">
        <input placeholder="${model.getDefaultValue()}"/>
      </div>
    `;
  }

  remove() {
    View.prototype.remove.apply(this, arguments as any);
    // @ts-ignore
    ['em', 'input', '$input', 'view'].forEach(i => (this[i] = null));
    this.__destroyFn(this._getClbOpts());
    return this;
  }

  /**
   * Triggers when the status changes. The status indicates if the value of
   * the proprerty is changed or inherited
   * @private
   */
  updateStatus() {
    const { model, pfx, ppfx, config } = this;
    const updatedCls = `${ppfx}four-color`;
    const computedCls = `${ppfx}color-warn`;
    const labelEl = this.$el.children(`.${pfx}label`);
    const clearStyleEl = this.getClearEl();
    const clearStyle = clearStyleEl ? clearStyleEl.style : ({} as CSSStyleDeclaration);
    labelEl.removeClass(`${updatedCls} ${computedCls}`);
    clearStyle.display = 'none';

    if (model.hasValue({ noParent: true }) && config.highlightChanged) {
      labelEl.addClass(updatedCls);
      config.clearProperties && (clearStyle.display = '');
    } else if (model.hasValue() && config.highlightComputed) {
      labelEl.addClass(computedCls);
    }

    this.parent?.updateStatus();
  }

  /**
   * Clear the property from the target
   */
  clear(ev: Event) {
    ev && ev.stopPropagation();
    this.model.clear();
  }

  /**
   * Get clear element
   * @return {HTMLElement}
   */
  getClearEl() {
    if (!this.clearEl) {
      this.clearEl = this.el.querySelector(`[${clearProp}]`)!;
    }

    return this.clearEl;
  }

  /**
   * Triggers when the value of element input/s is changed, so have to update
   * the value of the model which will propogate those changes to the target
   */
  inputValueChanged(ev: any) {
    ev && ev.stopPropagation();
    // Skip the default update in case a custom emit method is defined
    if (this.emit) return;
    this.model.upValue(ev.target.value);
  }

  onValueChange(m: any, val: any, opt: any = {}) {
    this.setValue(this.model.getFullValue(undefined, { skipImportant: true }));
    this.updateStatus();
  }

  /**
   * Update the element input.
   * Usually the value is a result of `model.getFullValue()`
   * @param {String} value The value from the model
   * */
  setValue(value: string) {
    const { model } = this;
    const result = isUndefined(value) || value === '' ? model.getDefaultValue() : value;
    if (this.update) return this.__update(result);
    this.__setValueInput(result);
  }

  __setValueInput(value: string) {
    const input = this.getInputEl();
    input && (input.value = value);
  }

  getInputEl() {
    if (!this.input) {
      this.input = this.el.querySelector('input')!;
    }

    return this.input;
  }

  updateVisibility() {
    this.el.style.display = this.model.isVisible() ? '' : 'none';
  }

  clearCached() {
    delete this.clearEl;
    delete this.input;
    delete this.$input;
  }

  __unset() {
    const unset = this.unset && this.unset.bind(this);
    unset && unset(this._getClbOpts());
  }

  __update(value: string) {
    const update = this.update && this.update.bind(this);
    update &&
      update({
        ...this._getClbOpts(),
        value,
      });
  }

  __change(...args: any) {
    const emit = this.emit && this.emit.bind(this);
    emit && emit(this._getClbOpts(), ...args);
  }

  __updateStyle(value: string | StyleProps, { complete, partial, ...opts }: any = {}) {
    const { model } = this;
    const final = complete !== false && partial !== true;

    if (isObject(value)) {
      model.__upTargetsStyle(value as StyleProps, { avoidStore: !final });
    } else {
      model.upValue(value, { partial: !final });
    }
  }

  _getClbOpts() {
    const { model, el, createdEl } = this;
    return {
      el,
      createdEl,
      property: model,
      props: model.attributes,
      change: this.__change,
      updateStyle: this.__updateStyle,
    };
  }

  render() {
    this.clearCached();
    const { pfx, model, el, $el } = this;
    const name = model.getName();
    const type = model.getType();
    const cls = model.get('className') || '';
    const className = `${pfx}property`;
    // Support old integer classname
    const clsType = type === 'number' ? `${pfx}${type} ${pfx}integer` : `${pfx}${type}`;

    this.createdEl && this.__destroyFn(this._getClbOpts());
    $el.empty().append(this.template(model));
    $el.find('[data-sm-label]').append(this.templateLabel(model));
    const create = this.create && this.create.bind(this);
    this.createdEl = create && create(this._getClbOpts());
    $el.find('[data-sm-fields]').append(this.createdEl || this.templateInput(model));

    el.className = `${className} ${clsType} ${className}__${name} ${cls}`.trim();
    el.className += model.isFull() ? ` ${className}--full` : '';

    const onRender = this.onRender && this.onRender.bind(this);
    onRender && onRender();
    this.setValue(model.getValue());
    return this;
  }

  onRender() {}
}
