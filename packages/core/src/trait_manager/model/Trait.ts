import { isString, isUndefined } from 'underscore';
import Category from '../../abstract/ModuleCategory';
import { LocaleOptions, Model, SetOptions } from '../../common';
import Component from '../../dom_components/model/Component';
import EditorModel from '../../editor/model/Editor';
import { isDef } from '../../utils/mixins';
import TraitsEvents, { TraitGetValueOptions, TraitOption, TraitProperties, TraitSetValueOptions } from '../types';
import TraitView from '../view/TraitView';
import Traits from './Traits';
import TraitDataVariable from '../../data_sources/model/TraitDataVariable';
import { DataVariableType } from '../../data_sources/model/DataVariable';
import DynamicVariableListenerManager from '../../data_sources/model/DataVariableListenerManager';

/**
 * @property {String} id Trait id, eg. `my-trait-id`.
 * @property {String} type Trait type, defines how the trait should be rendered. Possible values: `text` (default), `number`, `select`, `checkbox`, `color`, `button`
 * @property {String} label The trait label to show for the rendered trait.
 * @property {String} name The name of the trait used as a key for the attribute/property. By default, the name is used as attribute name or property in case `changeProp` in enabled.
 * @property {String} default Default value to use in case the value is not defined on the component.
 * @property {String} placeholder Placeholder to show inside the default input (if the UI type allows it).
 * @property {String} [category=''] Trait category.
 * @property {Boolean} changeProp If `true`, the trait value is applied on the component property, otherwise, on component attributes.
 *
 * @module docsjs.Trait
 *
 */
export default class Trait extends Model<TraitProperties> {
  target!: Component;
  em: EditorModel;
  view?: TraitView;
  el?: HTMLElement;
  dynamicVariable?: TraitDataVariable;
  dynamicVariableListener?: DynamicVariableListenerManager;

  defaults() {
    return {
      type: 'text',
      label: '',
      name: '',
      unit: '',
      step: 1,
      value: '',
      default: '',
      placeholder: '',
      category: '',
      changeProp: false,
      options: [],
    };
  }

  constructor(prop: TraitProperties, em: EditorModel) {
    super(prop);
    const { target, name } = this.attributes;
    !this.get('id') && this.set('id', name);
    if (target) {
      this.setTarget(target);
    }
    this.em = em;

    if (this.attributes.value && typeof this.attributes.value === 'object') {
      const dataType = this.attributes.value.type;
      switch (dataType) {
        case DataVariableType:
          this.dynamicVariable = new TraitDataVariable(this.attributes.value, { em: this.em, trait: this });
          break;
        default:
          throw new Error(`Invalid data variable type. Expected '${DataVariableType}', but found '${dataType}'.`);
      }

      const dv = this.dynamicVariable.getDataValue();
      this.set({ value: dv });
      this.dynamicVariableListener = new DynamicVariableListenerManager({
        model: this,
        em: this.em,
        dataVariable: this.dynamicVariable,
        updateValueFromDataVariable: this.updateValueFromDataVariable.bind(this),
      });
    }
  }

  get parent() {
    return this.collection as unknown as Traits;
  }

  get category(): Category | undefined {
    const cat = this.get('category');
    return cat instanceof Category ? cat : undefined;
  }

  get component() {
    return this.target;
  }

  get changeProp() {
    return !!this.get('changeProp');
  }

  setTarget(component: Component) {
    if (component) {
      const { name, changeProp, value: initValue, getValue } = this.attributes;
      this.target = component;
      this.unset('target');
      const targetEvent = changeProp ? `change:${name}` : `change:attributes:${name}`;
      this.listenTo(component, targetEvent, this.targetUpdated);
      const value =
        initValue ||
        // Avoid the risk of loops in case the trait has a custom getValue
        (!getValue ? this.getValue() : undefined);
      !isUndefined(value) && this.set({ value }, { silent: true });
    }
  }

  updateValueFromDataVariable(value: string) {
    this.setValue(value);
    this.trigger('change:value');
  }

  /**
   * Get the trait id.
   * @returns {String}
   */
  getId() {
    return this.get('id')!;
  }

  /**
   * Get the trait type.
   * @returns {String}
   */
  getType() {
    return this.get('type')!;
  }

  /**
   * Get the trait name.
   * @returns {String}
   */
  getName() {
    return this.get('name')!;
  }

  /**
   * Get the trait label.
   * @param {Object} [opts={}] Options.
   * @param {Boolean} [opts.locale=true] Use the locale string from i18n module.
   * @returns {String}
   */
  getLabel(opts: { locale?: boolean } = {}) {
    const { locale = true } = opts;
    const id = this.getId();
    const name = this.get('label') || this.getName();
    return (locale && this.em?.t(`traitManager.traits.labels.${id}`)) || name;
  }

  /**
   * Get the trait value.
   * The value is taken from component attributes by default or from properties if the trait has the `changeProp` enabled.
   * @param {Object} [opts={}] Options.
   * @param {Boolean} [opts.useType=false] Get the value based on type (eg. the checkbox will always return a boolean).
   * @returns {any}
   */
  getValue(opts?: TraitGetValueOptions) {
    if (this.dynamicVariable) {
      const dValue = this.dynamicVariable.getDataValue();

      return dValue;
    }

    return this.getTargetValue(opts);
  }

  /**
   * Update the trait value.
   * The value is applied on component attributes by default or on properties if the trait has the `changeProp` enabled.
   * @param {any} value Value of the trait.
   * @param {Object} [opts={}] Options.
   * @param {Boolean} [opts.partial] If `true` the update won't be considered complete (not stored in UndoManager).
   */
  setValue(value: any, opts: TraitSetValueOptions = {}) {
    const { component, em } = this;
    const { partial } = opts;
    const valueOpts: { avoidStore?: boolean } = {};
    const { setValue } = this.attributes;

    if (setValue) {
      setValue({
        value,
        component,
        editor: em?.getEditor()!,
        trait: this,
        partial: !!partial,
        options: opts,
        emitUpdate: () => this.targetUpdated(),
      });
      return;
    }

    if (partial) {
      valueOpts.avoidStore = true;
    }

    this.setTargetValue(value, valueOpts);
  }

  /**
   * Get default value.
   */
  getDefault() {
    return this.get('default');
  }

  /**
   * Get trait options.
   */
  getOptions(): TraitOption[] {
    return this.get('options') || [];
  }

  /**
   * Get current selected option or by id.
   * @param {String} [id] Option id.
   * @returns {Object | null}
   */
  getOption(id?: string): TraitOption | undefined {
    const idSel = isDef(id) ? id : this.getValue();
    return this.getOptions().filter((o) => this.getOptionId(o) === idSel)[0];
  }

  /**
   * Get the option id from the option object.
   * @param {Object} option Option object
   * @returns {String} Option id
   */
  getOptionId(option: TraitOption): string {
    return option.id || (option.value as string);
  }

  /**
   * Get option label.
   * @param {String|Object} id Option id or the option object
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.locale=true] Use the locale string from i18n module
   * @returns {String} Option label
   */
  getOptionLabel(id: string | TraitOption, opts: LocaleOptions = {}): string {
    const { locale = true } = opts;
    const option = (isString(id) ? this.getOption(id) : id)!;
    const optId = this.getOptionId(option);
    const label = option.label || (option as any).name || optId;
    const propName = this.getName();
    return (locale && this.em?.t(`traitManager.traits.options.${propName}.${optId}`)) || label;
  }

  /**
   * Get category label.
   * @param {Object} [opts={}] Options.
   * @param {Boolean} [opts.locale=true] Use the locale string from i18n module.
   * @returns {String}
   */
  getCategoryLabel(opts: LocaleOptions = {}): string {
    const { em, category } = this;
    const { locale = true } = opts;
    const catId = category?.getId();
    const catLabel = category?.getLabel();
    return (locale && em?.t(`traitManager.categories.${catId}`)) || catLabel || '';
  }

  /**
   * Run the trait command (used on the button trait type).
   */
  runCommand() {
    const { em } = this;
    const { command } = this.attributes;

    if (command && em) {
      if (isString(command)) {
        return em.Commands.run(command);
      } else {
        return command(em.Editor, this);
      }
    }
  }

  props() {
    return this.attributes;
  }

  targetUpdated() {
    const { component, em } = this;
    const value = this.getTargetValue({ useType: true });
    this.set({ value }, { fromTarget: 1 });
    const props = { trait: this, component, value };
    component.trigger(TraitsEvents.value, props);
    em?.trigger(TraitsEvents.value, props);
    // This should be triggered for any trait prop change
    em?.trigger('trait:update', props);
  }

  getTargetValue(opts: TraitGetValueOptions = {}) {
    const { component, em } = this;
    const name = this.getName();
    const getValue = this.get('getValue');
    let value;

    if (getValue) {
      value = getValue({
        editor: em?.getEditor()!,
        trait: this,
        component,
      });
    } else if (this.changeProp) {
      value = component.get(name);
    } else {
      value = component.getAttributes()[name];
    }

    if (opts.useType) {
      const type = this.getType();
      if (type === 'checkbox') {
        const { valueTrue, valueFalse } = this.attributes;

        if (!isUndefined(valueTrue) && valueTrue === value) {
          value = true;
        } else if (!isUndefined(valueFalse) && valueFalse === value) {
          value = false;
        }
      }
    }

    return !isUndefined(value) ? value : '';
  }

  setTargetValue(value: any, opts: SetOptions = {}) {
    const { component, attributes } = this;
    const name = this.getName();
    if (isUndefined(value)) return;
    let valueToSet = value;

    if (value === 'false') {
      valueToSet = false;
    } else if (value === 'true') {
      valueToSet = true;
    }

    if (this.getType() === 'checkbox') {
      const { valueTrue, valueFalse } = attributes;

      if (valueToSet && !isUndefined(valueTrue)) {
        valueToSet = valueTrue;
      }

      if (!valueToSet && !isUndefined(valueFalse)) {
        valueToSet = valueFalse;
      }
    }

    const props = { [name]: valueToSet };
    // This is required for the UndoManager to properly detect changes
    props.__p = opts.avoidStore ? null : undefined;

    if (this.changeProp) {
      component.set(props, opts);
    } else {
      component.addAttributes(props, opts);
    }
  }

  setValueFromInput(value: any, final = true, opts: SetOptions = {}) {
    const toSet = { value };
    this.set(toSet, { ...opts, avoidStore: 1 });

    // Have to trigger the change
    if (final) {
      this.set('value', '', opts);
      this.set(toSet, opts);
    }
  }

  getInitValue() {
    const { component } = this;
    const name = this.getName();
    let value;

    if (component) {
      const attrs = component.get('attributes')!;
      value = this.changeProp ? component.get(name) : attrs[name];
    }

    return value || this.get('value') || this.get('default');
  }
}
