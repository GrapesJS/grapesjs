/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [getCategories](#getcategories)
 * * [render](#render)
 *
 * Block manager helps managing various, draggable, piece of contents that could be easily reused inside templates.
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var blockManager = editor.BlockManager;
 * ```
 *
 * @module BlockManager
 * @param {Object} config Configurations
 * @param {Array<Object>} [config.blocks=[]] Default blocks
 * @example
 * ...
 * {
 *     blocks: [
 *      {id:'h1-block' label: 'Heading', content:'<h1>...</h1>'},
 *      ...
 *    ],
 * }
 * ...
 */
module.exports = () => {
  var c = {},
  defaults = require('./config/config'),
  Blocks = require('./model/Blocks'),
  BlockCategories = require('./model/Categories'),
  BlocksView = require('./view/BlocksView');
  var blocks, view;
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
        for (var name in defaults) {
          if (!(name in c))
            c[name] = defaults[name];
        }
        blocks = new Blocks(c.blocks);
        categories = new BlockCategories(),
        view = new BlocksView({
          collection: blocks,
          categories,
        }, c);
        return this;
      },

      /**
       * Add new block to the collection.
       * @param {string} id Block id
       * @param {Object} opts Options
       * @param {string} opts.label Name of the block
       * @param {string} opts.content HTML content
       * @param {string|Object} opts.category Group the block inside a catgegory.
       *                                      You should pass objects with id property, eg:
       *                                      {id: 'some-uid', label: 'My category'}
       *                                      The string will be converted in:
       *                                      'someid' => {id: 'someid', label: 'someid'}
       * @param {Object} [opts.attributes={}] Block attributes
       * @return {Block} Added block
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
       * @example
       * var block = blockManager.get('h1-block');
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
       * var blocks = blockManager.getAll();
       * console.log(JSON.stringify(blocks));
       * // [{label: 'Heading', content: '<h1>Put your ...'}, ...]
       */
      getAll() {
        return blocks;
      },

      /**
       * Get all available categories.
       * Is possible to add categories only with blocks via 'add()' method
       * @return {Array|Collection}
       */
      getCategories() {
        return categories;
      },

      /**
       * Render blocks
       * @return {HTMLElement}
       */
      render() {
        return view.render().el;
      },

      /**
       * Remove block by id
       * @param {string} id Block id
       * @return {Block} Removed block
       */
      remove(id) {
        return blocks.remove(id);
      },

  };

};
