var Backbone = require('backbone');

const Selector = Backbone.Model.extend({

  idAttribute: 'name',

  defaults: {
    name: '',
    label: '',

    // Type of the selector
    type: 'class',

    // If not active it's not selectable by the style manager (uncheckboxed)
    active: true,

    // Can't be seen by the style manager, therefore even by the user
    // Will be rendered only in export code
    private: false,

    // If true, can't be removed by the user, from the attacched element
    protected: false,
  },

  initialize() {
    const name = this.get('name');
    const label = this.get('label');

    if (!name) {
      this.set('name', label);
    } else if (!label) {
      this.set('label', name);
    }

    this.set('name', Selector.escapeName(this.get('name')));
  },

  /**
   * Get full selector name
   * @return {string}
   */
  getFullName() {
    let init = '';

    switch (this.get('type')) {
      case 'class':
        init = '.';
        break;
      case 'id':
        init = '#';
        break;
    }

    return init + this.get('name');
  }

}, {
  /**
   * Escape string
   * @param {string} name
   * @return {string}
   * @private
   */
  escapeName(name) {
    return `${name}`.trim().replace(/([^a-z0-9\w-]+)/gi, '-');
  },
});

module.exports = Selector;
