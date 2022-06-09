import { isUndefined } from 'underscore';
import { Model } from '../../common';

/**
 * @typedef Trait
 * @property {String} id Trait id, eg. `my-trait-id`.
 * @property {String} type Trait type, defines how the trait should rendered. Possible values: `text` (default), `number`, `select`, `checkbox`, `color`, `button`
 * @property {String} label The trait label to show for the rendered trait.
 * @property {String} name The name of the trait used as a key for the attribute/property. By default, the name is used as attribute name or property in case `changeProp` in enabled.
 * @property {Boolean} changeProp If `true` the trait value is applied on component
 *
 */
export default class Trait extends Model {
  initialize() {
    const { target, name, changeProp } = this.attributes;
    !this.get('id') && this.set('id', name);

    if (target) {
      this.target = target;
      this.unset('target');
      const targetEvent = changeProp ? `change:${name}` : `change:attributes:${name}`;
      this.listenTo(target, targetEvent, this.targetUpdated);
    }
  }

  /**
   * Get the trait id.
   * @returns {String}
   */
  getId() {
    return this.get('id');
  }

  /**
   * Get the trait type.
   * @returns {String}
   */
  getType() {
    return this.get('type');
  }

  /**
   * Get the trait name.
   * @returns {String}
   */
  getName() {
    return this.get('name');
  }

  /**
   * Get the trait label.
   * @param {Object} [opts={}] Options.
   * @param {Boolean} [opts.locale=true] Use the locale string from i18n module.
   * @returns {String}
   */
  getLabel(opts = {}) {
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
  setValue(value, opts = {}) {
    const valueOpts = {};

    if (opts.partial) {
      valueOpts.avoidStore = true;
    }

    this.setTargetValue(value, valueOpts);

    if (opts.partial === false) {
      this.setTargetValue('');
      this.setTargetValue(value);
    }
  }

  props() {
    return this.attributes;
  }

  targetUpdated() {
    const value = this.getTargetValue();
    this.set({ value }, { fromTarget: 1 });
    this.em?.trigger('trait:update', {
      trait: this,
      component: this.target,
    });
  }

  getTargetValue() {
    const name = this.get('name');
    const target = this.target;
    let value;

    if (this.get('changeProp')) {
      value = target.get(name);
    } else {
      value = target.getAttributes()[name];
    }

    return !isUndefined(value) ? value : '';
  }

  setTargetValue(value, opts = {}) {
    const target = this.target;
    const name = this.get('name');
    if (isUndefined(value)) return;
    let valueToSet = value;

    if (value === 'false') {
      valueToSet = false;
    } else if (value === 'true') {
      valueToSet = true;
    }

    if (this.get('changeProp')) {
      target.set(name, valueToSet, opts);
    } else {
      const attrs = { ...target.get('attributes') };
      attrs[name] = valueToSet;
      target.set('attributes', attrs, opts);
    }
  }

  setValueFromInput(value, final = 1, opts = {}) {
    const toSet = { value };
    this.set(toSet, { ...opts, avoidStore: 1 });

    // Have to trigger the change
    if (final) {
      this.set('value', '', opts);
      this.set(toSet, opts);
    }
  }

  getInitValue() {
    const target = this.target;
    const name = this.get('name');
    let value;

    if (target) {
      const attrs = target.get('attributes');
      value = this.get('changeProp') ? target.get(name) : attrs[name];
    }

    return value || this.get('value') || this.get('default');
  }
}

Trait.prototype.defaults = {
  type: 'text',
  label: '',
  name: '',
  min: '',
  max: '',
  unit: '',
  step: 1,
  value: '',
  target: '',
  default: '',
  placeholder: '',
  changeProp: 0,
  options: [],
};
