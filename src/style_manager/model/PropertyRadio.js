import Property from './Property';

export default class PropertyRadio extends Property {
  defaults() {
    return {
      ...Property.prototype.defaults,
      options: [], // Array of options, eg. [{ id: '100', label: 'Set 100' }]
      full: 1
    };
  }

  /**
   * Get available options.
   * @returns {Array<Object>} Array of options
   */
  getOptions() {
    // support old list property
    const { options, list } = this.attributes;
    return options && options.length ? options : list;
  }

  /**
   * Update options.
   * @param {Array<Object>} value Array of options, eg. `[{ id: 'val-1', label: 'Value 1' }]`
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
   * Get option label.
   * @param {String} id Option id
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.locale=true] Use the locale string from i18n module
   * @returns {String} Option label
   */
  getOptionLabel(id, opts = {}) {
    const { locale = true } = opts;
    const options = this.getOptions();
    const option = options.filter(o => o.id === id || o.value === id)[0] || {};
    const label = option.label || option.name || id;
    const propId = this.getId();
    return (
      (locale && this.em?.t(`styleManager.options.${propId}.${id}`)) || label
    );
  }

  initialize(...args) {
    Property.prototype.initialize.apply(this, args);
    this.listenTo(this, 'change:options', this.__onOptionChange);
  }

  __onOptionChange() {
    this.set('list', this.get('options'));
  }
}
