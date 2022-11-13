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
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/selector_manager/config/config.ts)
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
 * * `selector:state` - States changed. An object containing all the available data about the triggered event is passed as an argument to the callback.
 * * `selector` - Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
 *
 * ## Methods
 * * [getConfig](#getconfig)
 * * [add](#add)
 * * [get](#get)
 * * [remove](#remove)
 * * [getAll](#getall)
 * * [setState](#setstate)
 * * [getState](#getstate)
 * * [getStates](#getstates)
 * * [setStates](#setstates)
 * * [getSelected](#getselected)
 * * [addSelected](#addselected)
 * * [removeSelected](#removeselected)
 * * [getSelectedTargets](#getselectedtargets)
 * * [setComponentFirst](#setcomponentfirst)
 * * [getComponentFirst](#getcomponentfirst)
 *
 * [Selector]: selector.html
 * [State]: state.html
 * [Component]: component.html
 * [CssRule]: css_rule.html
 *
 * @module Selectors
 */

import { isString, debounce, isObject, isArray, bindAll } from 'underscore';
import { isComponent, isRule } from '../utils/mixins';
import Module from '../abstract/moduleLegacy';
import { Model, Collection } from '../common';
import defaults from './config/config';
import Selector from './model/Selector';
import Selectors from './model/Selectors';
import State from './model/State';
import ClassTagsView from './view/ClassTagsView';
import EditorModel from '../editor/model/Editor';
import Component from '../dom_components/model/Component';

const isId = (str: string) => isString(str) && str[0] == '#';
const isClass = (str: string) => isString(str) && str[0] == '.';

export const evAll = 'selector';
export const evPfx = `${evAll}:`;
export const evAdd = `${evPfx}add`;
export const evUpdate = `${evPfx}update`;
export const evRemove = `${evPfx}remove`;
export const evRemoveBefore = `${evRemove}:before`;
export const evCustom = `${evPfx}custom`;
export const evState = `${evPfx}state`;

export default class SelectorManager extends Module {
  name = 'SelectorManager';

  Selector = Selector;

  Selectors = Selectors;

  model!: Model;
  states!: Collection<State>;
  selectorTags?: ClassTagsView;
  selected!: Selectors;
  all!: Selectors;
  em!: EditorModel;

  events = {
    all: evAll,
    update: evUpdate,
    add: evAdd,
    remove: evRemove,
    removeBefore: evRemoveBefore,
    state: evState,
    custom: evCustom,
  };

  /**
   * Get configuration object
   * @name getConfig
   * @function
   * @return {Object}
   */

  init(conf = {}) {
    //super();
    this.__initConfig(defaults, conf);
    bindAll(this, '__updateSelectedByComponents');
    const config = this.getConfig();
    const em = this.em;
    const ppfx = config.pStylePrefix;

    if (ppfx) {
      config.stylePrefix = ppfx + config.stylePrefix;
    }

    // Global selectors container
    this.all = new Selectors(config.selectors);
    this.selected = new Selectors([], { em, config });
    this.states = new Collection<State>(
      config.states.map((state: any) => new State(state)),
      { model: State }
    );
    this.model = new Model({ cFirst: config.componentFirst, _undo: true });
    this.__initListen({
      collections: [this.states, this.selected],
      propagate: [{ entity: this.states, event: this.events.state }],
    });
    em.on('change:state', (m, value) => em.trigger(evState, value));
    this.model.on('change:cFirst', (m, value) => em.trigger('selector:type', value));
    em.on('component:toggled component:update:classes', this.__updateSelectedByComponents);
    const listenTo =
      'component:toggled component:update:classes change:device styleManager:update selector:state selector:type style:target';
    this.model.listenTo(em, listenTo, () => this.__update());

    return this;
  }

  __update = debounce(() => {
    this.__trgCustom();
  }, 0);

  __trgCustom(opts?: any) {
    this.em.trigger(this.events.custom, this.__customData(opts));
  }

  __customData(opts: any = {}) {
    const { container } = opts;
    return {
      states: this.getStates(),
      selected: this.getSelected(),
      container,
    };
  }

  // postLoad() {
  //   this.__postLoad();
  //   const { em, model } = this;
  //   const um = em.get('UndoManager');
  //   um && um.add(model);
  //   um && um.add(this.pages);
  // },

  postRender() {
    this.__appendTo();
    this.__trgCustom();
  }

  select(value: any, opts = {}) {
    const targets = Array.isArray(value) ? value : [value];
    const toSelect: any[] = this.em.get('StyleManager').select(targets, opts);
    this.selected.reset(this.__getCommonSelectors(toSelect));
    const selTags = this.selectorTags;
    const res = toSelect
      .filter(i => i)
      .map(sel => (isComponent(sel) ? sel : isRule(sel) && !sel.get('selectorsAdd') ? sel : sel.getSelectorsString()));
    selTags && selTags.componentChanged({ targets: res });
    return this;
  }

  addSelector(name: string | { name?: string; label?: string } | Selector, opts = {}, cOpts = {}): Selector {
    let props: any = { ...opts };

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
    const em = this.em;
    const selector = cname ? this.get(cname, props.type) : all.where(props)[0];

    if (!selector) {
      const selModel = props instanceof Selector ? props : new Selector(props, { ...cOpts, config, em });
      return all.add(selModel, cOpts);
    }

    return selector;
  }

  getSelector(name: string, type = Selector.TYPE_CLASS) {
    if (isId(name)) {
      name = name.substr(1);
      type = Selector.TYPE_ID;
    } else if (isClass(name)) {
      name = name.substr(1);
    }

    return this.getAll().where({ name, type })[0];
  }

  /**
   * Add a new selector to the collection if it does not already exist.
   * You can pass selectors properties or string identifiers.
   * @param {Object|String} props Selector properties or string identifiers, eg. `{ name: 'my-class', label: 'My class' }`, `.my-cls`
   * @param {Object} [opts] Selector options
   * @return {[Selector]}
   * @example
   * const selector = selectorManager.add({ name: 'my-class', label: 'My class' });
   * console.log(selector.toString()) // `.my-class`
   * // Same as
   * const selector = selectorManager.add('.my-class');
   * console.log(selector.toString()) // `.my-class`
   * */
  add(props: string | { name?: string; label?: string }, opts = {}) {
    const cOpts = isString(props) ? {} : opts;
    // Keep support for arrays but avoid it in docs
    if (isArray(props)) {
      return props.map(item => this.addSelector(item, opts, cOpts));
    } else {
      return this.addSelector(props, opts, cOpts);
    }
  }

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
  addClass(classes: string | string[]) {
    const added: any = [];

    if (isString(classes)) {
      classes = classes.trim().split(' ');
    }

    classes.forEach(name => added.push(this.addSelector(name)));
    return added;
  }

  /**
   * Get the selector by its name/type
   * @param {String} name Selector name or string identifier
   * @returns {[Selector]|null}
   * @example
   * const selector = selectorManager.get('.my-class');
   * // Get Id
   * const selectorId = selectorManager.get('#my-id');
   * */
  get(name: string | string[], type?: number) {
    // Keep support for arrays but avoid it in docs
    if (isArray(name)) {
      const result: Selector[] = [];
      const selectors = name.map(item => this.getSelector(item)).filter(item => item);
      selectors.forEach(item => result.indexOf(item) < 0 && result.push(item));
      return result;
    } else {
      return this.getSelector(name, type) || null;
    }
  }

  /**
   * Remove Selector.
   * @param {String|[Selector]} selector Selector instance or Selector string identifier
   * @returns {[Selector]} Removed Selector
   * @example
   * const removed = selectorManager.remove('.myclass');
   * // or by passing the Selector
   * selectorManager.remove(selectorManager.get('.myclass'));
   */
  remove(selector: string | Selector, opts?: any) {
    return this.__remove(selector, opts);
  }

  /**
   * Change the selector state
   * @param {String} value State value
   * @returns {this}
   * @example
   * selectorManager.setState('hover');
   */
  setState(value: string) {
    this.em.setState(value);
    return this;
  }

  /**
   * Get the current selector state value
   * @returns {String}
   */
  getState() {
    return this.em.getState();
  }

  /**
   * Get states
   * @returns {Array<[State]>}
   */
  getStates() {
    return [...this.states.models];
  }

  /**
   * Set a new collection of states
   * @param {Array<Object>} states Array of new states
   * @returns {Array<[State]>}
   * @example
   * const states = selectorManager.setStates([
   *   { name: 'hover', label: 'Hover' },
   *   { name: 'nth-of-type(2n)', label: 'Even/Odd' }
   * ]);
   */
  setStates(states: State[], opts?: any) {
    return this.states.reset(
      states.map(state => new State(state)),
      opts
    );
  }

  /**
   * Get commonly selected selectors, based on all selected components.
   * @returns {Array<[Selector]>}
   * @example
   * const selected = selectorManager.getSelected();
   * console.log(selected.map(s => s.toString()))
   */
  getSelected() {
    return this.__getCommon();
  }

  /**
   * Get selected selectors.
   * @returns {Array<[Selector]>}
   * @example
   * const selected = selectorManager.getSelectedAll();
   * console.log(selected.map(s => s.toString()))
   */
  getSelectedAll() {
    return [...this.selected.models];
  }

  /**
   * Add new selector to all selected components.
   * @param {Object|String} props Selector properties or string identifiers, eg. `{ name: 'my-class', label: 'My class' }`, `.my-cls`
   * @example
   * selectorManager.addSelected('.new-class');
   */
  addSelected(props: string | { name?: string; label?: string }) {
    const added = this.add(props);
    // TODO: target should be the one from StyleManager
    this.em.getSelectedAll().forEach(target => {
      target.getSelectors().add(added);
    });
    // TODO: update selected collection
  }

  /**
   * Remove a common selector from all selected components.
   * @param {String|[Selector]} selector Selector instance or Selector string identifier
   * @example
   * selectorManager.removeSelected('.myclass');
   */
  removeSelected(selector: any) {
    this.em.getSelectedAll().forEach(trg => {
      !selector.get('protected') && trg && trg.getSelectors().remove(selector);
    });
  }

  /**
   * Get the array of currently selected targets.
   * @returns {Array<[Component]|[CssRule]>}
   * @example
   * const targetsToStyle = selectorManager.getSelectedTargets();
   * console.log(targetsToStyle.map(target => target.getSelectorsString()))
   */
  getSelectedTargets() {
    return this.em.get('StyleManager').getSelectedAll();
  }

  /**
   * Update component-first option.
   * If the component-first is enabled, all the style changes will be applied on selected components (ID rules) instead
   * of selectors (which would change styles on all components with those classes).
   * @param {Boolean} value
   */
  setComponentFirst(value: boolean) {
    this.getConfig().componentFirst = value;
    this.model.set({ cFirst: value });
  }

  /**
   * Get the value of component-first option.
   * @return {Boolean}
   */
  getComponentFirst() {
    return this.getConfig().componentFirst;
  }

  /**
   * Get all selectors
   * @name getAll
   * @function
   * @return {Collection<[Selector]>}
   * */

  /**
   * Return escaped selector name
   * @param {String} name Selector name to escape
   * @returns {String} Escaped name
   * @private
   */
  escapeName(name: string) {
    const { escapeName } = this.getConfig();
    return escapeName ? escapeName(name) : Selector.escapeName(name);
  }

  /**
   * Render class selectors. If an array of selectors is provided a new instance of the collection will be rendered
   * @param {Array<Object>} selectors
   * @return {HTMLElement}
   * @private
   */
  render(selectors: any[]) {
    const { selectorTags } = this;
    const config = this.getConfig();
    const el = selectorTags?.el;
    this.selected.reset(selectors);
    this.selectorTags = new ClassTagsView({
      el,
      collection: this.selected,
      //@ts-ignore
      module: this,
      config,
    });

    return this.selectorTags.render().el;
  }

  destroy() {
    const { selectorTags, model } = this;
    model.stopListening();
    this.__update.cancel();
    this.__destroy();
    selectorTags?.remove();
    this.selectorTags = undefined;
  }

  /**
   * Get common selectors from the current selection.
   * @return {Array<Selector>}
   * @private
   */
  __getCommon() {
    return this.__getCommonSelectors(this.em.getSelectedAll());
  }

  __getCommonSelectors(components: Component[], opts = {}) {
    const selectors = components.map(cmp => cmp.getSelectors && cmp.getSelectors().getValid(opts)).filter(Boolean);
    return this.__common(...selectors);
  }

  __common(...args: any): Selector[] {
    if (!args.length) return [];
    if (args.length === 1) return args[0];
    if (args.length === 2) return args[0].filter((item: any) => args[1].indexOf(item) >= 0);

    return (
      args
        .slice(1)
        //@ts-ignore
        .reduce((acc, item) => this.__common(acc, item), args[0])
    );
  }

  __updateSelectedByComponents() {
    this.selected.reset(this.__getCommon());
  }
}
