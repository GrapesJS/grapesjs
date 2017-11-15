/**
 * Selectors in GrapesJS are used in CSS Composer inside Rules and in Components as classes. To get better this concept let's take
 * a look at this code:
 *
 * ```css
 * span > #send-btn.btn{
 *  ...
 * }
 * ```
 * ```html
 * <span>
 *   <button id="send-btn" class="btn"></button>
 * </span>
 * ```
 *
 * In this scenario we get:
 * span     -> selector of type `tag`
 * send-btn -> selector of type `id`
 * btn      -> selector of type `class`
 *
 * So, for example, being `btn` the same class entity it'll be easier to refactor and track things.
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var selectorManager = editor.SelectorManager;
 * ```
 *
 * @module SelectorManager
 * @param {Object} config Configurations
 * @param {Array<Object>} [config.selectors=[]] Default selectors
 * @param {Array<Object>} [config.states=[]] Default states
 * @param {String} [config.label='Classes'] Classes label
 * @param {String} [config.statesLabel='- State -'] The empty state label
 * @return {this}
 * @example
 * ...
 * {
 *  selectors: [
 *    {name:'myselector1'},
 *     ...
 *  ],
 *  states: [{
 *    name: 'hover', label: 'Hover'
 *  },{
 *    name: 'active', label: 'Click'
 *  }],
 *  statesLabel: '- Selecte State -',
 * }
 */

import { isString } from 'underscore'

module.exports = config => {
  var c = config || {},
  defaults = require('./config/config'),
  Selector = require('./model/Selector'),
  Selectors = require('./model/Selectors'),
  ClassTagsView = require('./view/ClassTagsView');
  var selectors, selectorTags;

  return {

    Selector,

    Selectors,

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'SelectorManager',

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     * @return {this}
     * @private
     */
    init(conf) {
      c = conf || {};

      for (var name in defaults) {
        if (!(name in c))
          c[name] = defaults[name];
      }

      const em = c.em;
      const ppfx = c.pStylePrefix;

      if (ppfx) {
        c.stylePrefix = ppfx + c.stylePrefix;
      }

      selectorTags = new ClassTagsView({
        collection: new Selectors([], {em,config: c}),
        config: c,
      });

      // Global selectors container
      selectors = new Selectors(c.selectors);
      selectors.on('add', (model) =>
        em.trigger('selector:add', model));

      return this;
    },

    /**
     * Add a new selector to collection if it's not already exists. Class type is a default one
     * @param {String} name Selector name
     * @param {Object} opts Selector options
     * @param {String} [opts.label=''] Label for the selector, if it's not provided the label will be the same as the name
     * @param {String} [opts.type='class'] Type of the selector. At the moment, only 'class' is available
     * @return {Model}
     * @example
     * var selector = selectorManager.add('selectorName');
     * // Same as
     * var selector = selectorManager.add('selectorName', {
     *   type: 'class',
     *   label: 'selectorName'
     * });
     * */
    add(name, opts = {}) {
      if (typeof name == 'object') {
        opts = name;
      } else {
        opts.name = name;
      }

      if (opts.label && !opts.name) {
        opts.name = Selector.escapeName(opts.label);
      }

      const cname = opts.name;
      const selector = cname ? this.get(cname, opts.type) : selectors.where(opts)[0];

      if (!selector) {
        return selectors.add(opts);
      }

      return selector;
    },

    /**
     * Add class selectors
     * @param {Array|string} classes Array or string of classes
     * @return {Array} Array of added selectors
     * @example
     * sm.addClass('class1');
     * sm.addClass('class1 class2');
     * sm.addClass(['class1', 'class2']);
     * // -> [SelectorObject, ...]
     */
    addClass(classes) {
      const added = [];

      if (isString(classes)) {
        classes = classes.trim().split(' ');
      }

      classes.forEach(name => added.push(selectors.add({name})))
      return added;
    },


    /**
     * Get the selector by its name
     * @param {String} name Selector name
     * @param {String} tyoe Selector type
     * @return {Model|null}
     * @example
     * var selector = selectorManager.get('selectorName');
     * */
    get(name, type = Selector.TYPE_CLASS) {
      return selectors.where({name, type})[0];
    },

    /**
     * Get all selectors
     * @return {Collection}
     * */
    getAll() {
      return selectors;
    },

    /**
     * Render class selectors. If an array of selectors is provided a new instance of the collection will be rendered
     * @param {Array<Object>} selectors
     * @return {HTMLElement}
     * @private
     */
    render(selectors) {
      if(selectors){
        var view = new ClassTagsView({
          collection: new Selectors(selectors),
          config: c,
        });
        return view.render().el;
      }else
        return selectorTags.render().el;
    },

  };
};
