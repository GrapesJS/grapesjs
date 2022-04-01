import { debounce } from 'underscore';
import { Model, Module } from '../common';
import defaults from './config/config';
import TraitsView from './view/TraitsView';
import TraitView from './view/TraitView';
import TraitSelectView from './view/TraitSelectView';
import TraitCheckboxView from './view/TraitCheckboxView';
import TraitNumberView from './view/TraitNumberView';
import TraitColorView from './view/TraitColorView';
import TraitButtonView from './view/TraitButtonView';

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
      const model = new Model();
      this.model = model;
      const { em } = this;
      const ppfx = c.pStylePrefix;
      this.types = { ...typesDef };
      ppfx && (c.stylePrefix = `${ppfx}${c.stylePrefix}`);

      const upAll = debounce(() => this.__upSel());
      model.listenTo(em, 'component:toggled', upAll);

      const update = debounce(() => this.__onUp());
      model.listenTo(em, 'trait:update', update);

      return this;
    },

    __upSel() {
      this.select(this.em.getSelected());
    },

    __onUp() {
      this.select(this.getSelected());
    },

    select(component) {
      const traits = component ? component.getTraits() : [];
      this.model.set({ component, traits });
      this.__trgCustom();
    },

    getSelected() {
      return this.model.get('component') || null;
    },

    getCurrent() {
      return this.model.get('traits') || [];
    },

    __trgCustom(opts = {}) {
      this.__ctn = this.__ctn || opts.container;
      this.em.trigger(this.events.custom, { container: this.__ctn });
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
      view = new TraitsView(
        {
          el,
          collection: [],
          editor: config.em,
          config,
        },
        this.getTypes()
      );
      this.view = view;
      return view.el;
    },

    destroy() {
      this.__destroy();
    },
  };
};
