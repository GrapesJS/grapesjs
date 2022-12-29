import { isString } from 'underscore';
import { isDef } from '../../utils/mixins';
import Property from './Property';

/**
 * @typedef PropertySelect
 * @property {Array<Object>} options Array of option definitions.
 * \n
 * ```js
 * options: [
 *  { id: '100', label: 'Set 100' },
 *  { id: '200', label: 'Set 200' },
 * ]
 * ```
 */
export default class PropertySelect extends Property {
  defaults() {
    return {
      ...Property.getDefaults(),
      options: [],
      full: 0,
    };
  }

  /**
   * Get available options.
   * @returns {Array<Object>} Array of options
   */
  getOptions() {
    // support old list property
    const { options, list } = this.attributes;
    return (options && options.length ? options : list) || [];
  }

  /**
   * Get current selected option or by id.
   * @param {String} [id] Option id.
   * @returns {Object | null}
   */
  getOption(id) {
    const idSel = isDef(id) ? id : this.getValue();
    return this.getOptions().filter(o => this.getOptionId(o) === idSel)[0] || null;
  }

  /**
   * Update options.
   * @param {Array<Object>} value New array of options, eg. `[{ id: 'val-1', label: 'Value 1' }]`
   */
  setOptions(value = []) {
    this.set('options', value);
    return this;
  }

  /**
   * Add new option.
   * @param {Object} value Option object, eg. `{ id: 'val-1', label: 'Value 1' }`
   */
  addOption(value) {
    if (value) {
      const opts = this.getOptions();
      this.setOptions([...opts, value]);
    }
    return this;
  }

  /**
   * Get the option id from the option object.
   * @param {Object} option Option object
   * @returns {String} Option id
   */
  getOptionId(option) {
    return isDef(option.id) ? option.id : option.value;
  }

  /**
   * Get option label.
   * @param {String|Object} id Option id or the option object
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.locale=true] Use the locale string from i18n module
   * @returns {String} Option label
   */
  getOptionLabel(id, opts = {}) {
    const { locale = true } = opts;
    const option = (isString(id) ? this.getOption(id) : id) || {};
    const optId = this.getOptionId(option);
    const label = option.label || option.name || optId;
    const propId = opts.property || this.getId();
    return (locale && this.em?.t(`styleManager.options.${propId}.${optId}`)) || label;
  }

  initialize(...args) {
    Property.prototype.initialize.apply(this, args);
    this.listenTo(this, 'change:options', this.__onOptionChange);
  }

  __onOptionChange() {
    this.set('list', this.get('options'));
  }
}
