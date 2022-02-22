import { Model } from 'common';
import { isUndefined } from 'underscore';

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
   * Get trait id.
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
   * Get trait name.
   * @returns {String}
   */
  getName() {
    return this.get('name');
  }

  /**
   * Get trait label.
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.locale=true] Use the locale string from i18n module
   * @returns {String}
   */
  getLabel(opts = {}) {
    const { locale = true } = opts;
    const id = this.getId();
    const name = this.get('label') || this.getName();
    return (locale && this.em?.t(`traitManager.traits.labels.${id}`)) || name;
  }

  setValue(value, opts = {}) {
    const valueOpts = {};
    if (opts.partial) {
      valueOpts.avoidStore = true;
    }
    this.setTargetValue(value, valueOpts);
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

  getValue() {
    return this.getTargetValue();
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
  type: 'text', // text, number, range, select
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
