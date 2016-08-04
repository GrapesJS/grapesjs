/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
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
 * blockManager: {
 *    blocks: [
 *      {id:'h1-block' label: 'Heading', content:'<h1>...</h1>'},
 *      ...
 *    ],
 * }
 * ...
 */
define(function(require) {

  return function(config) {
    var c = config || {},
      defaults = require('./config/config'),
      Blocks = require('./model/Blocks'),
      BlocksView = require('./view/BlocksView');

    for (var name in defaults) {
      if (!(name in c))
        c[name] = defaults[name];
    }

    var blocks = new Blocks(c.blocks);
    var view = new BlocksView({ collection: blocks }, c);

    return {

        /**
         * Add new block to the collection.
         * @param {string} id Block id
         * @param {Object} opts Options
         * @param {string} opts.label Name of the block
         * @param {string} opts.content HTML content
         * @param {Object} [opts.attributes={}] Block attributes
         * @return {Block} Added block
         * @example
         * blockManager.add('h1-block', {
         *   label: 'Heading',
         *   content: '<h1>Put your title here</h1>',
         *   attributes: {
         *     title: 'Insert h1 block'
         *   }
         * });
         */
        add: function(id, opts){
          var obj = opts || {};
          obj.id = id;
          return blocks.add(obj);
        },

        /**
         * Return block by id
         * @param  {string} id Block id
         * @example
         * var block = blockManager.get('h1-block');
         * console.log(JSON.stringify(block));
         * // {label: 'Heading', content: '<h1>Put your ...', ...}
         */
        get: function(id){
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
        getAll: function(){
          return blocks;
        },

        /**
         * Render blocks
         * @return {HTMLElement}
         */
        render: function(){
          return view.render().el;
        },

    };

  };

});