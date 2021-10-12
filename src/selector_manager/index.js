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
 * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
 *
 * ```js
 * // Listen to events
 * editor.on('selector:add', (selector) => { ... });
 *
 * // Use the API
 * const sm = editor.Selectors;
 * sm.add(...);
 * ```
 *
 * ## Available Events
 * * `selector:add` - Selector added. The [Selector] is passed as an argument to the callback.
 * * `selector:remove` - Selector removed. The [Selector] is passed as an argument to the callback.
 * * `selector:update` - Selector updated. The [Selector] and the object containing changes are passed as arguments to the callback.
 * * `selector:state` - State changed. Passes the new state value as an argument.
 * * `selector` - Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
 *
 * ## Methods
 * * [getConfig](#getconfig)
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [setState](#setstate)
 * * [getState](#getstate)
 *
 * [Selector]: selector.html
 *
 * @module SelectorManager
 */

import { isString, isElement, isObject, isArray } from 'underscore';
import { isComponent, isRule } from 'utils/mixins';
import { Model } from 'common';
import Module from 'common/module';
import defaults from './config/config';
import Selector from './model/Selector';
import Selectors from './model/Selectors';
import ClassTagsView from './view/ClassTagsView';

const isId = str => isString(str) && str[0] == '#';
const isClass = str => isString(str) && str[0] == '.';

export const evAll = 'selector';
export const evPfx = `${evAll}:`;
export const evAdd = `${evPfx}add`;
export const evUpdate = `${evPfx}update`;
export const evRemove = `${evPfx}remove`;
export const evRemoveBefore = `${evRemove}:before`;
export const evCustom = `${evPfx}custom`;

export default () => {
  return {
    ...Module,

    name: 'SelectorManager',

    Selector,

    Selectors,

    events: {
      all: evAll,
      update: evUpdate,
      add: evAdd,
      remove: evRemove,
      removeBefore: evRemoveBefore,
      custom: evCustom
    },

    /**
     * Get configuration object
     * @return {Object}
     */

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     * @return {this}
     * @private
     */
    init(conf = {}) {
      this.__initConfig(defaults, conf);
      const config = this.getConfig();
      const em = config.em;
      const ppfx = config.pStylePrefix;

      if (ppfx) {
        config.stylePrefix = ppfx + config.stylePrefix;
      }

      // Global selectors container
      this.all = new Selectors(config.selectors);
      this.model = new Model({ _undo: true });
      this.__initListen();
      em.on('change:state', (m, value) => em.trigger('selector:state', value));

      return this;
    },

    // postLoad() {
    //   this.__postLoad();
    //   const { em, model } = this;
    //   const um = em.get('UndoManager');
    //   um && um.add(model);
    //   um && um.add(this.pages);
    // },

    postRender() {
      const elTo = this.getConfig().appendTo;

      if (elTo) {
        const el = isElement(elTo) ? elTo : document.querySelector(elTo);
        if (!el) return this.__logWarn('"appendTo" element not found');
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

    addSelector(name, opts = {}, cOpts = {}) {
      let props = { ...opts };

      if (isObject(name)) {
        props = name;
      } else {
        props.name = name;
      }

      if (isId(props.name)) {
        props.name = props.name.substr(1);
        props.type = Selector.TYPE_ID;
      } else if (isClass(props.name)) {
        props.name = props.name.substr(1);
      }

      if (props.label && !props.name) {
        props.name = this.escapeName(props.label);
      }

      const cname = props.name;
      const config = this.getConfig();
      const all = this.getAll();
      const selector = cname
        ? this.get(cname, props.type)
        : all.where(props)[0];

      if (!selector) {
        return all.add(props, { ...cOpts, config });
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

      return this.getAll().where({ name, type })[0];
    },

    /**
     * Add a new selector to collection if it's not already exists. Class type is a default one
     * @param {Object} props Selector properties, eg. `{ name: 'my-class', label: 'My class' }`
     * @param {Object} [opts] Selector options
     * @return {[Selector]}
     * @example
     * const selector = selectorManager.add({ name: 'my-class', label: 'My class' });
     * console.log(selector.toString()) // `.my-class`
     * */
    add(props, opts = {}) {
      const cOpts = isString(props) ? {} : opts;
      // Keep support for arrays but avoid it in docs
      if (isArray(props)) {
        return props.map(item => this.addSelector(item, opts, cOpts));
      } else {
        return this.addSelector(props, opts, cOpts);
      }
    },

    /**
     * Add class selectors
     * @param {Array|string} classes Array or string of classes
     * @return {Array} Array of added selectors
     * @private
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

    remove(selector, opts) {
      return this.__remove(selector, opts);
    },

    /**
     * Get all selectors
     * @name getAll
     * @function
     * @return {Collection}
     * */

    /**
     * Return escaped selector name
     * @param {String} name Selector name to escape
     * @returns {String} Escaped name
     */
    escapeName(name) {
      const { escapeName } = this.getConfig();
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
      const config = this.getConfig();
      const el = selectorTags && selectorTags.el;
      this.selectorTags = new ClassTagsView({
        el,
        collection: new Selectors(selectors || [], { em, config }),
        config
      });

      return this.selectorTags.render().el;
    },

    destroy() {
      const { selectorTags } = this;
      const all = this.getAll();
      all.stopListening();
      all.reset();
      selectorTags && selectorTags.remove();
      this.em = {};
      this.selectorTags = {};
    }
  };
};
