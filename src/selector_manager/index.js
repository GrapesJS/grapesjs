/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 *
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
module.exports = config => {
  var c = config || {},
  defaults = require('./config/config'),
  Selectors = require('./model/Selectors'),
  ClassTagsView = require('./view/ClassTagsView');
  var selectors, selectorTags;

  return {

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

      var ppfx = c.pStylePrefix;
      if(ppfx)
        c.stylePrefix = ppfx + c.stylePrefix;

      selectors = new Selectors(c.selectors, {
        em: c.em,
        config: c,
      });
      selectorTags = new ClassTagsView({
        collection: selectors,
        config: c,
      });
      return this;
    },

    /**
     * Add the new selector to collection if it's not already exists. Class type is a default one
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
    add(name, opts) {
      var obj = opts || {};
      obj.name = name.name || name;
      return selectors.add(obj);
    },

    /**
     * Get the selector by its name
     * @param {String} name Selector name
     * @return {Model|null}
     * @example
     * var selector = selectorManager.get('selectorName');
     * */
    get(name) {
      return selectors.where({name})[0];
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
