/**
 * Selectors in GrapesJS are used in CSS Composer inside Rules and in Components as classes. To illustrate this concept let's take
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
 * * span     -> selector of type `tag`
 * * send-btn -> selector of type `id`
 * * btn      -> selector of type `class`
 *
 * So, for example, being `btn` the same class entity it'll be easier to refactor and track things.
 *
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/selector_manager/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  selectorManager: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const selectorManager = editor.SelectorManager;
 * ```
 *
 * * [getConfig](#getconfig)
 * * [add](#add)
 * * [addClass](#addclass)
 * * [get](#get)
 * * [getAll](#getall)
 * * [setState](#setstate)
 * * [getState](#getstate)
 *
 * @module SelectorManager
 */

import { isString, isElement, isObject, isArray } from 'underscore';
import { isComponent, isRule } from 'utils/mixins';
import defaults from './config/config';
import Selector from './model/Selector';
import Selectors from './model/Selectors';
import ClassTagsView from './view/ClassTagsView';

const isId = str => isString(str) && str[0] == '#';
const isClass = str => isString(str) && str[0] == '.';

export default config => {
  var c = config || {};
  var selectors;

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
     * Get configuration object
     * @return {Object}
     */
    getConfig() {
      return c;
    },

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     * @return {this}
     * @private
     */
    init(conf = {}) {
      c = {
        ...defaults,
        ...conf
      };
      const em = c.em;
      const ppfx = c.pStylePrefix;
      this.em = em;

      if (ppfx) {
        c.stylePrefix = ppfx + c.stylePrefix;
      }

      // Global selectors container
      selectors = new Selectors(c.selectors);
      selectors.on('add', model => em.trigger('selector:add', model));
      selectors.on('remove', model => em.trigger('selector:remove', model));
      selectors.on('change', model =>
        em.trigger(
          'selector:update',
          model,
          model.previousAttributes(),
          model.changedAttributes()
        )
      );
      em.on('change:state', (m, value) => em.trigger('selector:state', value));

      return this;
    },

    postRender() {
      const elTo = this.getConfig().appendTo;

      if (elTo) {
        const el = isElement(elTo) ? elTo : document.querySelector(elTo);
        el.appendChild(this.render([]));
      }
    },

    select(value, opts = {}) {
      const targets = Array.isArray(value) ? value : [value];
      const toSelect = this.em.get('StyleManager').setTarget(targets, opts);
      const selTags = this.selectorTags;
      const res = toSelect
        .filter(i => i)
        .map(sel =>
          isComponent(sel)
            ? sel
            : isRule(sel) && !sel.get('selectorsAdd')
            ? sel
            : sel.getSelectorsString()
        );
      selTags && selTags.componentChanged({ targets: res });
      return this;
    },

    /**
     * Change the selector state
     * @param {String} value State value
     * @returns {this}
     * @example
     * selectorManager.setState('hover');
     */
    setState(value) {
      this.em.setState(value);
      return this;
    },

    /**
     * Get the current selector state
     * @returns {String}
     */
    getState() {
      return this.em.getState();
    },

    addSelector(name, opt = {}) {
      let opts = { ...opt };

      if (isObject(name)) {
        opts = name;
      } else {
        opts.name = name;
      }

      if (isId(opts.name)) {
        opts.name = opts.name.substr(1);
        opts.type = Selector.TYPE_ID;
      } else if (isClass(opts.name)) {
        opts.name = opts.name.substr(1);
      }

      if (opts.label && !opts.name) {
        opts.name = this.escapeName(opts.label);
      }

      const cname = opts.name;
      const selector = cname
        ? this.get(cname, opts.type)
        : selectors.where(opts)[0];

      if (!selector) {
        return selectors.add(opts, { config: c });
      }

      return selector;
    },

    getSelector(name, type = Selector.TYPE_CLASS) {
      if (isId(name)) {
        name = name.substr(1);
        type = Selector.TYPE_ID;
      } else if (isClass(name)) {
        name = name.substr(1);
      }

      return selectors.where({ name, type })[0];
    },

    /**
     * Add a new selector to collection if it's not already exists. Class type is a default one
     * @param {String|Array} name Selector/s name
     * @param {Object} opts Selector options
     * @param {String} [opts.label=''] Label for the selector, if it's not provided the label will be the same as the name
     * @param {String} [opts.type=1] Type of the selector. At the moment, only 'class' (1) is available
     * @return {Model|Array}
     * @example
     * const selector = selectorManager.add('selectorName');
     * // Same as
     * const selector = selectorManager.add('selectorName', {
     *   type: 1,
     *   label: 'selectorName'
     * });
     * // Multiple selectors
     * const selectors = selectorManager.add(['.class1', '.class2', '#id1']);
     * */
    add(name, opts = {}) {
      if (isArray(name)) {
        return name.map(item => this.addSelector(item, opts));
      } else {
        return this.addSelector(name, opts);
      }
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

      classes.forEach(name => added.push(this.addSelector(name)));
      return added;
    },

    /**
     * Get the selector by its name
     * @param {String|Array} name Selector name
     * @param {String} type Selector type
     * @return {Model|Array}
     * @example
     * const selector = selectorManager.get('selectorName');
     * // or get an array
     * const selectors = selectorManager.get(['class1', 'class2']);
     * */
    get(name, type) {
      if (isArray(name)) {
        const result = [];
        const selectors = name
          .map(item => this.getSelector(item))
          .filter(item => item);
        selectors.forEach(
          item => result.indexOf(item) < 0 && result.push(item)
        );
        return result;
      } else {
        return this.getSelector(name, type);
      }
    },

    /**
     * Get all selectors
     * @return {Collection}
     * */
    getAll() {
      return selectors;
    },

    /**
     * Return escaped selector name
     * @param {String} name Selector name to escape
     * @returns {String} Escaped name
     */
    escapeName(name) {
      const { escapeName } = c;
      return escapeName ? escapeName(name) : Selector.escapeName(name);
    },

    /**
     * Render class selectors. If an array of selectors is provided a new instance of the collection will be rendered
     * @param {Array<Object>} selectors
     * @return {HTMLElement}
     * @private
     */
    render(selectors) {
      const { em, selectorTags } = this;
      selectorTags && selectorTags.remove();
      this.selectorTags = new ClassTagsView({
        collection: new Selectors(selectors || [], { em, config: c }),
        config: c
      });

      return this.selectorTags.render().el;
    },

    destroy() {
      const { selectorTags } = this;
      selectors.reset();
      selectors.stopListening();
      selectorTags && selectorTags.remove();
      [c, selectors].forEach(i => (i = {}));
      this.em = {};
      this.selectorTags = {};
    }
  };
};
