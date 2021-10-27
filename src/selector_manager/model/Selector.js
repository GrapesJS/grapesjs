import { Model } from 'common';
import { result, forEach, keys } from 'underscore';

const TYPE_CLASS = 1;
const TYPE_ID = 2;

/**
 * @typedef Selector
 * @property {String} name Selector name, eg. `my-class`
 * @property {String} label Selector label, eg. `My Class`
 * @property {Number} [type=1] Type of the selector. 1 (class) | 2 (id)
 * @property {Boolean} [active=true] If not active, it's not selectable by the Style Manager.
 * @property {Boolean} [private=false] If true, it can't be seen by the Style Manager, but it will be rendered in the canvas and in export code.
 * @property {Boolean} [protected=false] If true, it can't be removed from the attacched component.
 */
export default class Selector extends Model {
  defaults() {
    return {
      name: '',
      label: '',
      type: TYPE_CLASS,
      active: true,
      private: false,
      protected: false,
      _undo: true
    };
  }

  initialize(props, opts = {}) {
    const { config = {} } = opts;
    const name = this.get('name');
    const label = this.get('label');

    if (!name) {
      this.set('name', label);
    } else if (!label) {
      this.set('label', name);
    }

    const namePreEsc = this.get('name');
    const { escapeName } = config;
    const nameEsc = escapeName
      ? escapeName(namePreEsc)
      : Selector.escapeName(namePreEsc);
    this.set('name', nameEsc);
    this.em = config.em;
  }

  isId() {
    return this.get('type') === TYPE_ID;
  }

  isClass() {
    return this.get('type') === TYPE_CLASS;
  }

  getFullName(opts = {}) {
    const { escape } = opts;
    const name = this.get('name');
    let pfx = '';

    switch (this.get('type')) {
      case TYPE_CLASS:
        pfx = '.';
        break;
      case TYPE_ID:
        pfx = '#';
        break;
    }

    return pfx + (escape ? escape(name) : name);
  }

  /**
   * Get selector as a string.
   * @returns {String}
   * @example
   * // Given such selector: { name: 'my-selector', type: 2 }
   * console.log(selector.toString());
   * // -> `#my-selector`
   */
  toString() {
    return this.getFullName();
  }

  /**
   * Get selector label.
   * @returns {String}
   * @example
   * // Given such selector: { name: 'my-selector', label: 'My selector' }
   * console.log(selector.getLabel());
   * // -> `My selector`
   */
  getLabel() {
    return this.get('label');
  }

  /**
   * Update selector label.
   * @param {String} label New label
   * @example
   * // Given such selector: { name: 'my-selector', label: 'My selector' }
   * selector.setLabel('New Label')
   * console.log(selector.getLabel());
   * // -> `New Label`
   */
  setLabel(label) {
    return this.set('label', label);
  }

  /**
   * Get selector active state.
   * @returns {Boolean}
   */
  getActive() {
    return this.get('active');
  }

  /**
   * Update selector active state.
   * @param {Boolean} value New active state
   */
  setActive(value) {
    return this.set('active', value);
  }

  toJSON(opts = {}) {
    const { em } = this;
    let obj = Model.prototype.toJSON.call(this, [opts]);
    const defaults = result(this, 'defaults');

    if (em && em.getConfig('avoidDefaults')) {
      forEach(defaults, (value, key) => {
        if (obj[key] === value) {
          delete obj[key];
        }
      });

      if (obj.label === obj.name) {
        delete obj.label;
      }

      const objLen = keys(obj).length;

      if (objLen === 1 && obj.name) {
        obj = obj.name;
      }

      if (objLen === 2 && obj.name && obj.type) {
        obj = this.getFullName();
      }
    }

    return obj;
  }
}

Selector.prototype.idAttribute = 'name';

// Type selectors: https://developer.mozilla.org/it/docs/Web/CSS/CSS_Selectors
Selector.TYPE_CLASS = TYPE_CLASS;
Selector.TYPE_ID = TYPE_ID;

/**
 * Escape string
 * @param {string} name
 * @return {string}
 * @private
 */
Selector.escapeName = name => {
  return `${name}`.trim().replace(/([^a-z0-9\w-\:]+)/gi, '-');
};
