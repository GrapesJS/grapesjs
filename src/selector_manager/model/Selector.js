import Backbone from 'backbone';

const TYPE_CLASS = 1;
const TYPE_ID = 2;

const Selector = Backbone.Model.extend(
  {
    idAttribute: 'name',

    defaults: {
      name: '',

      label: '',

      // Type of the selector
      type: TYPE_CLASS,

      // If not active it's not selectable by the style manager (uncheckboxed)
      active: true,

      // Can't be seen by the style manager, therefore even by the user
      // Will be rendered only in export code
      private: false,

      // If true, can't be removed from the attacched element
      protected: false
    },

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
    },

    /**
     * Get full selector name
     * @return {string}
     */
    getFullName() {
      let init = '';

      switch (this.get('type')) {
        case TYPE_CLASS:
          init = '.';
          break;
        case TYPE_ID:
          init = '#';
          break;
      }

      return init + this.get('name');
    }
  },
  {
    // All type selectors: https://developer.mozilla.org/it/docs/Web/CSS/CSS_Selectors
    // Here I define only what I need
    TYPE_CLASS,

    TYPE_ID,

    /**
     * Escape string
     * @param {string} name
     * @return {string}
     * @private
     */
    escapeName(name) {
      return `${name}`.trim().replace(/([^a-z0-9\w-\:]+)/gi, '-');
    }
  }
);

export default Selector;
