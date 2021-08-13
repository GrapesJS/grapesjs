/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/block_manager/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  blockManager: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const blockManager = editor.BlockManager;
 * ```
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [getAllVisible](#getallvisible)
 * * [remove](#remove)
 * * [getConfig](#getconfig)
 * * [getCategories](#getcategories)
 * * [getContainer](#getcontainer)
 * * [render](#render)
 *
 * [Block]: block.html
 *
 * @module BlockManager
 */
import { isElement } from 'underscore';
import defaults from './config/config';
import Blocks from './model/Blocks';
import BlockCategories from './model/Categories';
import BlocksView from './view/BlocksView';

export default () => {
  var c = {};
  var blocks, blocksVisible, blocksView;
  var categories = [];

  return {
    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'BlockManager',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     * @return {this}
     * @private
     */
    init(config) {
      c = config || {};
      const em = c.em;

      for (let name in defaults) {
        if (!(name in c)) {
          c[name] = defaults[name];
        }
      }

      // Global blocks collection
      blocks = new Blocks([]);
      blocksVisible = new Blocks([]);
      categories = new BlockCategories();

      // Setup the sync between the global and public collections
      blocks.listenTo(blocks, 'add', model => {
        blocksVisible.add(model);
        em && em.trigger('block:add', model);
      });

      blocks.listenTo(blocks, 'remove', model => {
        blocksVisible.remove(model);
        em && em.trigger('block:remove', model);
      });

      blocks.listenTo(blocks, 'reset', coll => {
        blocksVisible.reset(coll.models);
      });

      return this;
    },

    /**
     * Get configuration object
     * @return {Object}
     */
    getConfig() {
      return c;
    },

    /**
     * Load default blocks if the collection is empty
     */
    onLoad() {
      const blocks = this.getAll();
      !blocks.length && blocks.reset(c.blocks);
    },

    /**
     * Executed once the main editor instance is rendered
     * @private
     */
    postRender() {
      const collection = blocksVisible;
      blocksView = new BlocksView({ collection, categories }, c);
      const elTo = this.getConfig().appendTo;

      if (elTo) {
        const el = isElement(elTo) ? elTo : document.querySelector(elTo);
        el.appendChild(this.render(blocksVisible.models));
      }
    },

    /**
     * Add new block to the collection.
     * @param {string} id Block id
     * @param {Object} opts Options
     * @param {string} opts.label Name of the block
     * @param {string} opts.content HTML content
     * @param {string|Object} opts.category Group the block inside a category.
     *                                      You should pass objects with id property, eg:
     *                                      {id: 'some-uid', label: 'My category'}
     *                                      The string will be converted in:
     *                                      'someid' => {id: 'someid', label: 'someid'}
     * @param {Object} [opts.attributes={}] Block attributes
     * @returns {[Block]} Added block
     * @example
     * blockManager.add('h1-block', {
     *   label: 'Heading',
     *   content: '<h1>Put your title here</h1>',
     *   category: 'Basic',
     *   attributes: {
     *     title: 'Insert h1 block'
     *   }
     * });
     */
    add(id, opts) {
      var obj = opts || {};
      obj.id = id;
      return blocks.add(obj);
    },

    /**
     * Return the block by id
     * @param  {string} id Block id
     * @returns {[Block]}
     * @example
     * const block = blockManager.get('h1-block');
     * console.log(JSON.stringify(block));
     * // {label: 'Heading', content: '<h1>Put your ...', ...}
     */
    get(id) {
      return blocks.get(id);
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
      return blocks;
    },

    /**
     * Return the visible collection, which containes blocks actually rendered
     * @return {Collection}
     */
    getAllVisible() {
      return blocksVisible;
    },

    /**
     * Remove a block by id
     * @param {string} id Block id
     * @returns {[Block]} Removed block
     * @example
     * // Id of the block which need to be removed
     * const id = 'button';
     * blockManager.remove(id);
     */
    remove(id) {
      return blocks.remove(id);
    },

    /**
     * Get all available categories.
     * It's possible to add categories only within blocks via 'add()' method
     * @return {Array|Collection}
     */
    getCategories() {
      return categories;
    },

    /**
     * Return the Blocks container element
     * @return {HTMLElement}
     */
    getContainer() {
      return blocksView.el;
    },

    /**
     * Render blocks
     * @param  {Array} blocks Blocks to render, without the argument will render all global blocks
     * @param  {Object} [opts={}] Options
     * @param  {Boolean} [opts.external] Render blocks in a new container (HTMLElement will be returned)
     * @param  {Boolean} [opts.ignoreCategories] Render blocks without categories
     * @return {HTMLElement} Rendered element
     * @example
     * // Render all blocks (inside the global collection)
     * blockManager.render();
     *
     * // Render new set of blocks
     * const blocks = blockManager.getAll();
     * const filtered = blocks.filter(block => block.get('category') == 'sections')
     *
     * blockManager.render(filtered);
     * // Or a new set from an array
     * blockManager.render([
     *  {label: 'Label text', content: '<div>Content</div>'}
     * ]);
     *
     * // Back to blocks from the global collection
     * blockManager.render();
     *
     * // You can also render your blocks outside of the main block container
     * const newBlocksEl = blockManager.render(filtered, { external: true });
     * document.getElementById('some-id').appendChild(newBlocksEl);
     */
    render(blocks, opts = {}) {
      const toRender = blocks || this.getAll().models;

      if (opts.external) {
        const collection = new Blocks(toRender);
        return new BlocksView(
          { collection, categories },
          { ...c, ...opts }
        ).render().el;
      }

      if (blocksView) {
        blocksView.updateConfig(opts);
        blocksView.collection.reset(toRender);

        if (!blocksView.rendered) {
          blocksView.render();
          blocksView.rendered = 1;
        }
      }

      return this.getContainer();
    },

    destroy() {
      blocks.reset();
      blocks.stopListening();
      blocksVisible.reset();
      categories.reset();
      blocksView && blocksView.remove();
      [blocks, blocksVisible, categories, blocksView].forEach(i => (i = null));
      c = {};
    }
  };
};
