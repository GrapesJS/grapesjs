import { defaults, isElement } from 'underscore';
import defaultOpts from './config/config';
import TraitsView from './view/TraitsView';
import TraitView from './view/TraitView';
import TraitSelectView from './view/TraitSelectView';
import TraitCheckboxView from './view/TraitCheckboxView';
import TraitNumberView from './view/TraitNumberView';
import TraitColorView from './view/TraitColorView';
import TraitButtonView from './view/TraitButtonView';

export default () => {
  let c = {};
  let types = {};
  let TraitsViewer;
  const typesDef = {
    text: TraitView,
    number: TraitNumberView,
    select: TraitSelectView,
    checkbox: TraitCheckboxView,
    color: TraitColorView,
    button: TraitButtonView
  };

  return {
    TraitsView,

    types,

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
      types = { ...typesDef };
      ppfx && (c.stylePrefix = `${ppfx}${c.stylePrefix}`);
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
      const baseView = types.text;
      types[name] = baseView.extend(trait);
    },

    /**
     * Get trait type
     * @param {string} name Type name
     * @return {Object}
     */
    getType(name) {
      return types[name];
    },

    render() {
      TraitsViewer && TraitsViewer.remove();
      TraitsViewer = new TraitsView({
        collection: [],
        editor: c.em,
        config: c
      });
      TraitsViewer.itemsView = types;
      return TraitsViewer.render().el;
    },

    destroy() {
      TraitsViewer && TraitsViewer.remove();
      [c, types, TraitsViewer].forEach(i => (i = {}));
    }
  };
};
