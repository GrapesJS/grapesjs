import { isString, isUndefined } from 'underscore';
import { LocaleOptions, Model, SetOptions } from '../../common';
import Component from '../../dom_components/model/Component';
import Editor from '../../editor';
import EditorModel from '../../editor/model/Editor';
import TraitView from '../view/TraitView';
import { isDef } from '../../utils/mixins';
import Category, { CategoryProperties } from '../../abstract/ModuleCategory';
import Traits from './Traits';

/** @private */
export interface TraitProperties {
  /**
   * Trait type, defines how the trait should rendered.
   * Possible values: `text` (default), `number`, `select`, `checkbox`, `color`, `button`
   */
  type?: string;

  /**
   * The name of the trait used as a key for the attribute/property.
   * By default, the name is used as attribute name or property in case `changeProp` in enabled.
   */
  name?: string;

  /**
   * Trait id, eg. `my-trait-id`.
   * If not specified, the `name` will be used as id.
   */
  id?: string | number;

  /**
   * Trait category.
   * @default ''
   */
  category?: string | CategoryProperties;

  /**
   * The trait label to show for the rendered trait.
   */
  label?: string | false;

  /**
   * If `true` the trait value is applied on component
   */
  changeProp?: boolean;

  /**
   * Instead of relying on component props/attributes, define your own
   * logic on how to get the trait value.
   */
  getValue?: (props: { editor: Editor; trait: Trait; component: Component }) => any;

  /**
   * In conjunction with the `getValue`, define your own logic for updating the trait value.
   */
  setValue?: (props: {
    value: any;
    editor: Editor;
    trait: Trait;
    component: Component;
    partial: boolean;
    options: TraitSetValueOptions;
    emitUpdate: () => void;
  }) => void;

  /**
   * Custom true value for checkbox type.
   * @default 'true'
   */
  valueTrue?: string;

  /**
   * Custom false value for checkbox type.
   * * @default 'false'
   */
  valueFalse?: string;

  /**
   * Minimum number value for number type.
   */
  min?: number;

  /**
   * Maximum number value for number type.
   */
  max?: number;
  unit?: string;

  /**
   * Number of steps for number type.
   */
  step?: number;
  value?: any;
  target?: Component;
  default?: any;

  /**
   * Placeholder to show inside the input.
   */
  placeholder?: string;

  /**
   * Array of options for the select type.
   */
  options?: Record<string, any>[];

  /**
   * Label text to use for the button type.
   */
  text?: string;
  labelButton?: string;

  /**
   * Command to use for the button type.
   */
  command?: string | ((editor: Editor, trait: Trait) => any);

  full?: boolean;
  attributes?: Record<string, any>;
}

interface TraitSetValueOptions {
  partial?: boolean;
  [key: string]: unknown;
}

type TraitOption = {
  id: string;
  label?: string;
};

/**
 * @typedef Trait
 * @property {String} id Trait id, eg. `my-trait-id`.
 * @property {String} type Trait type, defines how the trait should rendered. Possible values: `text` (default), `number`, `select`, `checkbox`, `color`, `button`
 * @property {String} label The trait label to show for the rendered trait.
 * @property {String} name The name of the trait used as a key for the attribute/property. By default, the name is used as attribute name or property in case `changeProp` in enabled.
 * @property {String} [category=''] Trait category.
 * @property {Boolean} changeProp If `true` the trait value is applied on component
 *
 */
export default class Trait extends Model<TraitProperties> {
  target!: Component;
  em: EditorModel;
  view?: TraitView;
  el?: HTMLElement;

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
   * @returns {any}
   */
  getValue() {
    return this.getTargetValue();
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

    if (partial === false) {
      this.setTargetValue('');
      this.setTargetValue(value);
    }
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
    return (this.get('options') as TraitOption[]) || [];
  }

  /**
   * Get current selected option or by id.
   * @param {String} [id] Option id.
   * @returns {Object | null}
   */
  getOption(id?: string): TraitOption | undefined {
    const idSel = isDef(id) ? id : this.getValue();
    return this.getOptions().filter(o => this.getOptionId(o) === idSel)[0];
  }

  /**
   * Get the option id from the option object.
   * @param {Object} option Option object
   * @returns {String} Option id
   */
  getOptionId(option: TraitOption) {
    return option.id || (option as any).value;
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

  props() {
    return this.attributes;
  }

  targetUpdated() {
    const { component, em } = this;
    const value = this.getTargetValue();
    this.set({ value }, { fromTarget: 1 });
    em?.trigger('trait:update', {
      trait: this,
      component,
      value,
    });
  }

  getTargetValue() {
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
    } else if (this.get('changeProp')) {
      value = component.get(name);
    } else {
      // @ts-ignore TODO update post component update
      value = component.getAttributes()[name];
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

    if (this.get('changeProp')) {
      component.set(name, valueToSet, opts);
    } else {
      component.addAttributes({ [name]: valueToSet }, opts);
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
      value = this.get('changeProp') ? component.get(name) : attrs[name];
    }

    return value || this.get('value') || this.get('default');
  }
}
