import { defaults, isElement } from 'underscore';
import defaultOpts from './config/config';
import TraitsView from './view/TraitsView';

export default () => {
  let c = {};
  let TraitsViewer;

  return {
    TraitsView,

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'TraitManager',

    /**
     * Get configuration object
     * @return {Object}
     * @private
     */
    getConfig() {
      return c;
    },

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     */
    init(config = {}) {
      c = config;
      defaults(c, defaultOpts);
      const ppfx = c.pStylePrefix;
      ppfx && (c.stylePrefix = `${ppfx}${c.stylePrefix}`);
      TraitsViewer = new TraitsView({
        collection: [],
        editor: c.em,
        config: c
      });
      return this;
    },

    postRender() {
      const elTo = this.getConfig().appendTo;

      if (elTo) {
        const el = isElement(elTo) ? elTo : document.querySelector(elTo);
        el.appendChild(this.render());
      }
    },

    /**
     *
     * Get Traits viewer
     * @private
     */
    getTraitsViewer() {
      return TraitsViewer;
    },

    /**
     * Add new trait type
     * @param {string} name Type name
     * @param {Object} methods Object representing the trait
     */
    addType(name, trait) {
      var itemView = TraitsViewer.itemView;
      TraitsViewer.itemsView[name] = itemView.extend(trait);
    },

    /**
     * Get trait type
     * @param {string} name Type name
     * @return {Object}
     */
    getType(name) {
      return TraitsViewer.itemsView[name];
    },

    render() {
      return TraitsViewer.render().el;
    },

    destroy() {
      TraitsViewer.remove();
      [c, TraitsViewer].forEach(i => (i = {}));
    }
  };
};
