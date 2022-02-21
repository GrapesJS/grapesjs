import defaults from './config/config';
import TraitsView from './view/TraitsView';
import TraitView from './view/TraitView';
import TraitSelectView from './view/TraitSelectView';
import TraitCheckboxView from './view/TraitCheckboxView';
import TraitNumberView from './view/TraitNumberView';
import TraitColorView from './view/TraitColorView';
import TraitButtonView from './view/TraitButtonView';
import Module from 'common/module';

export const evAll = 'trait';
export const evPfx = `${evAll}:`;
export const evCustom = `${evPfx}custom`;

export default () => {
  const typesDef = {
    text: TraitView,
    number: TraitNumberView,
    select: TraitSelectView,
    checkbox: TraitCheckboxView,
    color: TraitColorView,
    button: TraitButtonView,
  };

  return {
    ...Module,

    TraitsView,

    events: {
      all: evAll,
      custom: evCustom,
    },

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'TraitManager',

    /**
     * Get configuration object
     * @name getConfig
     * @function
     * @return {Object}
     */

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     * @private
     */
    init(config = {}) {
      this.__initConfig(defaults, config);
      const c = this.config;
      const ppfx = c.pStylePrefix;
      this.types = { ...typesDef };
      ppfx && (c.stylePrefix = `${ppfx}${c.stylePrefix}`);
      return this;
    },

    postRender() {
      this.__appendTo();
    },

    /**
     *
     * Get Traits viewer
     * @private
     */
    getTraitsViewer() {
      return this.view;
    },

    /**
     * Add new trait type
     * @param {string} name Type name
     * @param {Object} methods Object representing the trait
     */
    addType(name, trait) {
      const baseView = this.getType('text');
      this.types[name] = baseView.extend(trait);
    },

    /**
     * Get trait type
     * @param {string} name Type name
     * @return {Object}
     */
    getType(name) {
      return this.getTypes()[name];
    },

    /**
     * Get all trait types
     * @returns {Object}
     */
    getTypes() {
      return this.types;
    },

    render() {
      let { view } = this;
      const config = this.getConfig();
      const el = view && view.el;
      view = new TraitsView({
        el,
        collection: [],
        editor: config.em,
        config,
      });
      view.itemsView = this.getTypes();
      view.updatedCollection();
      this.view = view;
      return view.el;
    },

    destroy() {
      this.__destroy();
    },
  };
};
