import { defaults, isElement } from 'underscore';

const defaultOpts = require('./config/config');
const Traits = require('./model/Traits');
const TraitsView = require('./view/TraitsView');
const TraitCategories = require('./model/Categories');

module.exports = () => {
  let c = {};
  let TraitsViewer;
  let traits, traitsVisible, traitsView;
  let categories = [];

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
      categories = new TraitCategories();
      TraitsViewer = new TraitsView({
        collection: [],
        editor: c.em,
        config: c,
        categories
      });

      // Global blocks collection
      traits = new Traits([]);
      traitsVisible = new Traits([]);
      categories = new TraitCategories();
      traitsView = new TraitsView(
        {
          collection: traitsVisible,
          editor: c.em,
          config: c,
          categories
        },
        c
      );

      // Setup the sync between the global and public collections
      traits.listenTo(traits, 'add', model => {
        traitsVisible.add(model);
        em && em.trigger('trait:add', model);
      });

      traits.listenTo(traits, 'remove', model => {
        traitsVisible.remove(model);
        em && em.trigger('trait:remove', model);
      });

      traits.listenTo(traits, 'reset', coll => {
        traitsVisible.reset(coll.models);
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
     * Return all blocks
     * @return {Collection}
     * @example
     * const blocks = blockManager.getAll();
     * console.log(JSON.stringify(blocks));
     * // [{label: 'Heading', content: '<h1>Put your ...'}, ...]
     */
    getAll() {
      return traits;
    },

    /**
     * Return the visible collection, which containes blocks actually rendered
     * @return {Collection}
     */
    getAllVisible() {
      return traitsVisible;
    },

    /**
     * Remove a block by id
     * @param {string} id Block id
     * @return {Block} Removed block
     */
    remove(id) {
      return traits.remove(id);
    },

    /**
     * Return the Blocks container element
     * @return {HTMLElement}
     */
    getContainer() {
      return traitsView.el;
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

    /**
     * Get all available categories.
     * It's possible to add categories only within blocks via 'add()' method
     * @return {Array|Collection}
     */
    getCategories() {
      return categories;
    },

    render(traits, opts = {}) {
      const toRender = traits || this.getAll().models;

      if (opts.external) {
        return new TraitsView(
          {
            collection: new Traits(toRender),
            editor: c.em,
            config: c,
            categories
          },
          {
            ...c,
            ...opts
          }
        ).render().el;
      }

      if (!TraitsViewer.rendered) {
        TraitsViewer.render();
        TraitsViewer.rendered = 1;
      }

      TraitsViewer.updateConfig(opts);
      if (TraitsViewer.collection.length)
        TraitsViewer.collection.reset(toRender);
      return this.getContainer();
    }
  };
};
