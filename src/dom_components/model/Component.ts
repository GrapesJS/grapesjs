import {
  isUndefined,
  isFunction,
  isArray,
  isEmpty,
  isBoolean,
  has,
  isString,
  forEach,
  result,
  bindAll,
  keys,
} from 'underscore';
import { shallowDiff, capitalize, isEmptyObj, isObject, toLowerCase } from '../../utils/mixins';
import StyleableModel, { StyleProps } from '../../domain_abstract/model/StyleableModel';
import { Model } from 'backbone';
import Components from './Components';
import Selector from '../../selector_manager/model/Selector';
import Selectors from '../../selector_manager/model/Selectors';
import Traits from '../../trait_manager/model/Traits';
import EditorModel from '../../editor/model/Editor';
import {
  ComponentAdd,
  ComponentDefinition,
  ComponentDefinitionDefined,
  ComponentOptions,
  ComponentProperties,
  DragMode,
  SymbolToUpOptions,
  ToHTMLOptions,
} from './types';
import Frame from '../../canvas/model/Frame';
import { DomComponentsConfig } from '../config/config';
import ComponentView from '../view/ComponentView';
import { AddOptions, ExtractMethods, ObjectAny, PrevToNewIdMap, SetOptions } from '../../common';
import CssRule, { CssRuleJSON } from '../../css_composer/model/CssRule';
import Trait from '../../trait_manager/model/Trait';
import { ToolbarButtonProps } from './ToolbarButton';
import { TraitProperties } from '../../trait_manager/types';

export interface IComponent extends ExtractMethods<Component> {}

const escapeRegExp = (str: string) => {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
};

export const avoidInline = (em: EditorModel) => !!em?.getConfig().avoidInlineStyle;

export const eventDrag = 'component:drag';
export const keySymbols = '__symbols';
export const keySymbol = '__symbol';
export const keySymbolOvrd = '__symbol_ovrd';
export const keyUpdate = 'component:update';
export const keyUpdateInside = `${keyUpdate}-inside`;

/**
 * The Component object represents a single node of our template structure, so when you update its properties the changes are
 * immediately reflected on the canvas and in the code to export (indeed, when you ask to export the code we just go through all
 * the tree of nodes).
 * An example on how to update properties:
 * ```js
 * component.set({
 *  tagName: 'span',
 *  attributes: { ... },
 *  removable: false,
 * });
 * component.get('tagName');
 * // -> 'span'
 * ```
 *
 * [Component]: component.html
 *
 * @property {String} [type=''] Component type, eg. `text`, `image`, `video`, etc.
 * @property {String} [tagName='div'] HTML tag of the component, eg. `span`. Default: `div`
 * @property {Object} [attributes={}] Key-value object of the component's attributes, eg. `{ title: 'Hello' }` Default: `{}`
 * @property {String} [name=''] Name of the component. Will be used, for example, in Layers and badges
 * @property {Boolean} [removable=true] When `true` the component is removable from the canvas, default: `true`
 * @property {Boolean|String|Function} [draggable=true] Indicates if it's possible to drag the component inside others.
 *  You can also specify a query string to indentify elements,
 *  eg. `'.some-class[title=Hello], [data-gjs-type=column]'` means you can drag the component only inside elements
 *  containing `some-class` class and `Hello` title, and `column` components. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drag is possible. Default: `true`
 * @property {Boolean|String|Function} [droppable=true] Indicates if it's possible to drop other components inside. You can use
 * a query string as with `draggable`. In the case of a function, target and destination components are passed as arguments, return a Boolean to indicate if the drop is possible. Default: `true`
 * @property {Boolean} [badgable=true] Set to false if you don't want to see the badge (with the name) over the component. Default: `true`
 * @property {Boolean|Array<String>} [stylable=true] True if it's possible to style the component.
 * You can also indicate an array of CSS properties which is possible to style, eg. `['color', 'width']`, all other properties
 * will be hidden from the style manager. Default: `true`
 * @property {Array<String>} [stylable-require=[]] Indicate an array of style properties to show up which has been marked as `toRequire`. Default: `[]`
 * @property {Array<String>} [unstylable=[]] Indicate an array of style properties which should be hidden from the style manager. Default: `[]`
 * @property {Boolean} [highlightable=true] It can be highlighted with 'dotted' borders if true. Default: `true`
 * @property {Boolean} [copyable=true] True if it's possible to clone the component. Default: `true`
 * @property {Boolean} [resizable=false] Indicates if it's possible to resize the component. It's also possible to pass an object as [options for the Resizer](https://github.com/GrapesJS/grapesjs/blob/master/src/utils/Resizer.ts). Default: `false`
 * @property {Boolean} [editable=false] Allow to edit the content of the component (used on Text components). Default: `false`
 * @property {Boolean} [layerable=true] Set to `false` if you need to hide the component inside Layers. Default: `true`
 * @property {Boolean} [selectable=true] Allow component to be selected when clicked. Default: `true`
 * @property {Boolean} [hoverable=true] Shows a highlight outline when hovering on the element if `true`. Default: `true`
 * @property {Boolean} [locked] Disable the selection of the component and its children in the canvas. You can unlock a children by setting its locked property to `false`. Default: `undefined`
 * @property {Boolean} [void=false] This property is used by the HTML exporter as void elements don't have closing tags, eg. `<br/>`, `<hr/>`, etc. Default: `false`
 * @property {Object} [style={}] Component default style, eg. `{ width: '100px', height: '100px', 'background-color': 'red' }`
 * @property {String} [styles=''] Component related styles, eg. `.my-component-class { color: red }`
 * @property {String} [content=''] Content of the component (not escaped) which will be appended before children rendering. Default: `''`
 * @property {String} [icon=''] Component's icon, this string will be inserted before the name (in Layers and badge), eg. it can be an HTML string '<i class="fa fa-square-o"></i>'. Default: `''`
 * @property {String|Function} [script=''] Component's javascript. More about it [here](/modules/Components-js.html). Default: `''`
 * @property {String|Function} [script-export=''] You can specify javascript available only in export functions (eg. when you get the HTML).
 * If this property is defined it will overwrite the `script` one (in export functions). Default: `''`
 * @property {Array<Object|String>} [traits=''] Component's traits. More about it [here](/modules/Traits.html). Default: `['id', 'title']`
 * @property {Array<String>} [propagate=[]] Indicates an array of properties which will be inhereted by all NEW appended children.
 *  For example if you create a component likes this: `{ removable: false, draggable: false, propagate: ['removable', 'draggable'] }`
 *  and append some new component inside, the new added component will get the exact same properties indicated in the `propagate` array (and the `propagate` property itself). Default: `[]`
 * @property {Array<Object>} [toolbar=null] Set an array of items to show up inside the toolbar when the component is selected (move, clone, delete).
 * Eg. `toolbar: [ { attributes: {class: 'fa fa-arrows'}, command: 'tlb-move' }, ... ]`.
 * By default, when `toolbar` property is falsy the editor will add automatically commands `core:component-exit` (select parent component, added if there is one), `tlb-move` (added if `draggable`) , `tlb-clone` (added if `copyable`), `tlb-delete` (added if `removable`).
 * @property {Collection<Component>} [components=null] Children components. Default: `null`
 * @property {Object} [delegate=null] Delegate commands to other components. Available commands `remove` | `move` | `copy` | `select`. eg. `{ remove: (cmp) => cmp.closestType('other-type') }`
 *
 * @module docsjs.Component
 */
export default class Component extends StyleableModel<ComponentProperties> {
  /**
   * @private
   * @ts-ignore */
  get defaults(): ComponentDefinitionDefined {
    return {
      tagName: 'div',
      type: '',
      name: '',
      removable: true,
      draggable: true,
      droppable: true,
      badgable: true,
      stylable: true,
      'stylable-require': '',
      'style-signature': '',
      unstylable: '',
      highlightable: true,
      copyable: true,
      resizable: false,
      editable: false,
      layerable: true,
      selectable: true,
      hoverable: true,
      void: false,
      state: '', // Indicates if the component is in some CSS state like ':hover', ':active', etc.
      status: '', // State, eg. 'selected'
      content: '',
      icon: '',
      style: '',
      styles: '', // Component related styles
      classes: '', // Array of classes
      script: '',
      'script-props': '',
      'script-export': '',
      attributes: {},
      traits: ['id', 'title'],
      propagate: '',
      dmode: '',
      toolbar: null,
      delegate: null,
      [keySymbol]: 0,
      [keySymbols]: 0,
      [keySymbolOvrd]: 0,
      _undo: true,
      _undoexc: ['status', 'open'],
    };
  }

  get classes() {
    return this.get('classes')!;
  }

  get traits() {
    return this.get('traits')!;
  }

  get content() {
    return this.get('content') ?? '';
  }

  get toolbar() {
    return this.get('toolbar') || [];
  }

  get resizable() {
    return this.get('resizable')!;
  }

  get delegate() {
    return this.get('delegate');
  }

  get locked() {
    return this.get('locked');
  }

  /**
   * Hook method, called once the model is created
   */
  init() {}

  /**
   * Hook method, called when the model has been updated (eg. updated some model's property)
   * @param {String} property Property name, if triggered after some property update
   * @param {*} value Property value, if triggered after some property update
   * @param {*} previous Property previous value, if triggered after some property update
   */
  updated(property: string, value: any, previous: any) {}

  /**
   * Hook method, called once the model has been removed
   */
  removed() {}

  em!: EditorModel;
  opt!: ComponentOptions;
  config!: DomComponentsConfig;
  ccid!: string;
  views!: ComponentView[];
  view?: ComponentView;
  frame?: Frame;
  rule?: CssRule;
  prevColl?: Components;
  __hasUm?: boolean;
  __symbReady?: boolean;
  /**
   * @private
   * @ts-ignore */
  collection!: Components;

  initialize(props = {}, opt: ComponentOptions = {}) {
    bindAll(this, '__upSymbProps', '__upSymbCls', '__upSymbComps');
    const em = opt.em;

    // Propagate properties from parent if indicated
    const parent = this.parent();
    const parentAttr = parent?.attributes;
    const propagate = this.get('propagate');
    propagate && this.set('propagate', isArray(propagate) ? propagate : [propagate]);

    if (parentAttr && parentAttr.propagate && !propagate) {
      const newAttr: Partial<ComponentProperties> = {};
      const toPropagate = parentAttr.propagate;
      toPropagate.forEach(prop => (newAttr[prop] = parent.get(prop as string)));
      newAttr.propagate = toPropagate;
      this.set({ ...newAttr, ...props });
    }

    // Check void elements
    if (opt && opt.config && opt.config.voidElements!.indexOf(this.get('tagName')!) >= 0) {
      this.set('void', true);
    }

    opt.em = em;
    this.opt = opt;
    this.em = em!;
    this.frame = opt.frame;
    this.config = opt.config || {};
    this.set('attributes', {
      ...(result(this, 'defaults').attributes || {}),
      ...(this.get('attributes') || {}),
    });
    this.ccid = Component.createId(this, opt);
    this.initClasses();
    this.initComponents();
    this.initTraits();
    this.initToolbar();
    this.initScriptProps();
    this.listenTo(this, 'change:script', this.scriptUpdated);
    this.listenTo(this, 'change:tagName', this.tagUpdated);
    this.listenTo(this, 'change:attributes', this.attrUpdated);
    this.listenTo(this, 'change:attributes:id', this._idUpdated);
    this.on('change:toolbar', this.__emitUpdateTlb);
    this.on('change', this.__onChange);
    this.on(keyUpdateInside, this.__propToParent);
    this.set('status', '');
    this.views = [];

    // Register global updates for collection properties
    ['classes', 'traits', 'components'].forEach(name => {
      const events = `add remove ${name !== 'components' ? 'change' : ''}`;
      this.listenTo(this.get(name), events.trim(), (...args) => this.emitUpdate(name, ...args));
    });

    if (!opt.temporary) {
      // Add component styles
      const cssc = em && em.Css;
      const { styles, type } = this.attributes;
      if (styles && cssc) {
        cssc.addCollection(styles, { avoidUpdateStyle: true }, { group: `cmp:${type}` });
      }

      this.__postAdd();
      this.init();
      this.__isSymbolOrInst() && this.__initSymb();
      em && em.trigger('component:create', this);
    }
  }

  __postAdd(opts: { recursive?: boolean } = {}) {
    const { em } = this;
    const um = em?.UndoManager;
    const comps = this.components();
    if (um && !this.__hasUm) {
      um.add(comps);
      um.add(this.getSelectors());
      this.__hasUm = true;
    }
    opts.recursive && comps.map(c => c.__postAdd(opts));
  }

  __postRemove() {
    const { em } = this;
    const um = em?.get('UndoManager');
    if (um) {
      um.remove(this.components());
      um.remove(this.getSelectors());
      delete this.__hasUm;
    }
  }

  __onChange(m: any, opts: any) {
    const changed = this.changedAttributes() || {};
    keys(changed).forEach(prop => this.emitUpdate(prop));
    ['status', 'open', 'toolbar', 'traits'].forEach(name => delete changed[name]);
    // Propagate component prop changes
    if (!isEmptyObj(changed)) {
      this.__changesUp(opts);
      this.__propSelfToParent({ component: this, changed, options: opts });
    }
  }

  __onStyleChange(newStyles: StyleProps) {
    const { em } = this;
    if (!em) return;

    const event = 'component:styleUpdate';
    const styleKeys = keys(newStyles);
    const pros = { style: newStyles };

    em.trigger(event, this, pros);
    styleKeys.forEach(key => em.trigger(`${event}:${key}`, this, pros));
  }

  __changesUp(opts: any) {
    const { em, frame } = this;
    [frame, em].forEach(md => md && md.changesUp(opts));
  }

  __propSelfToParent(props: any) {
    this.trigger(keyUpdate, props);
    this.__propToParent(props);
  }

  __propToParent(props: any) {
    const parent = this.parent();
    parent && parent.trigger(keyUpdateInside, props);
  }

  __emitUpdateTlb() {
    this.emitUpdate('toolbar');
  }

  /**
   * Check component's type
   * @param  {string}  type Component type
   * @return {Boolean}
   * @example
   * component.is('image')
   * // -> false
   */
  is(type: string) {
    return !!(this.get('type') == type);
  }

  /**
   * Return all the propeties
   * @returns {Object}
   */
  props() {
    return this.attributes;
  }

  /**
   * Get the index of the component in the parent collection.
   * @return {Number}
   */
  index() {
    const { collection } = this;
    return collection ? collection.indexOf(this) : 0;
  }

  /**
   * Change the drag mode of the component.
   * To get more about this feature read: https://github.com/GrapesJS/grapesjs/issues/1936
   * @param {String} value Drag mode, options: `'absolute'` | `'translate'` | `''`
   * @returns {this}
   */
  setDragMode(value?: DragMode) {
    return this.set('dmode', value);
  }

  /**
   * Get the drag mode of the component.
   * @returns {String} Drag mode value, options: `'absolute'` | `'translate'` | `''`
   */
  getDragMode(): DragMode {
    return this.get('dmode') || '';
  }

  /**
   * Find inner components by query string.
   * **ATTENTION**: this method works only with already rendered component
   * @param  {String} query Query string
   * @return {Array} Array of components
   * @example
   * component.find('div > .class');
   * // -> [Component, Component, ...]
   */
  find(query: string) {
    const result: Component[] = [];
    const $els = this.view?.$el.find(query);
    $els?.each(i => {
      const $el = $els.eq(i);
      const model = $el.data('model');
      model && result.push(model);
    });

    return result;
  }

  /**
   * Find all inner components by component type.
   * The advantage of this method over `find` is that you can use it
   * also before rendering the component
   * @param {String} type Component type
   * @returns {Array<Component>}
   * @example
   * const allImages = component.findType('image');
   * console.log(allImages[0]) // prints the first found component
   */
  findType(type: string) {
    const result: Component[] = [];
    const find = (components: Components) =>
      components.forEach(item => {
        item.is(type) && result.push(item);
        find(item.components());
      });
    find(this.components());
    return result;
  }

  /**
   * Find the closest parent component by query string.
   * **ATTENTION**: this method works only with already rendered component
   * @param  {string} query Query string
   * @return {Component}
   * @example
   * component.closest('div.some-class');
   * // -> Component
   */
  closest(query: string) {
    const result = this.view?.$el.closest(query);
    return result?.length ? (result.data('model') as Component) : undefined;
  }

  /**
   * Find the closest parent component by its type.
   * The advantage of this method over `closest` is that you can use it
   * also before rendering the component
   * @param {String} type Component type
   * @returns {Component} Found component, otherwise `undefined`
   * @example
   * const Section = component.closestType('section');
   * console.log(Section);
   */
  closestType(type: string) {
    let parent = this.parent();

    while (parent && !parent.is(type)) {
      parent = parent.parent();
    }

    return parent;
  }

  /**
   * The method returns a Boolean value indicating whether the passed
   * component is a descendant of a given component
   * @param {Component} component Component to check
   * @returns {Boolean}
   */
  contains(component: Component) {
    let result = !1;
    if (!component) return result;
    const contains = (components: Components) => {
      !result &&
        components.forEach(item => {
          if (item === component) result = !0;
          !result && contains(item.components());
        });
    };
    contains(this.components());
    return result;
  }

  /**
   * Once the tag is updated I have to rerender the element
   * @private
   */
  tagUpdated() {
    this.trigger('rerender');
  }

  /**
   * Replace a component with another one
   * @param {String|Component} el Component or HTML string
   * @param {Object} [opts={}] Options for the append action
   * @returns {Array<Component>} New replaced components
   * @example
   * const result = component.replaceWith('<div>Some new content</div>');
   * // result -> [Component]
   */
  replaceWith<C extends Component = Component>(el: ComponentAdd, opts: AddOptions = {}): C[] {
    const coll = this.collection;
    const at = coll.indexOf(this);
    coll.remove(this);
    const result = coll.add(el, { ...opts, at });
    return isArray(result) ? result : [result];
  }

  /**
   * Emit changes for each updated attribute
   * @private
   */
  attrUpdated(m: any, v: any, opts: any = {}) {
    const attrs = this.get('attributes')!;
    // Handle classes
    const classes = attrs.class;
    classes && this.setClass(classes);
    delete attrs.class;

    // Handle style
    const style = attrs.style;
    style && this.setStyle(style);
    delete attrs.style;

    const attrPrev = { ...this.previous('attributes') };
    const diff = shallowDiff(attrPrev, this.get('attributes')!);
    keys(diff).forEach(pr => this.trigger(`change:attributes:${pr}`, this, diff[pr], opts));
  }

  /**
   * Update attributes of the component
   * @param {Object} attrs Key value attributes
   * @param {Object} options Options for the model update
   * @return {this}
   * @example
   * component.setAttributes({ id: 'test', 'data-key': 'value' });
   */
  setAttributes(attrs: ObjectAny, opts: SetOptions = {}) {
    this.set('attributes', { ...attrs }, opts);
    return this;
  }

  /**
   * Add attributes to the component
   * @param {Object} attrs Key value attributes
   * @param {Object} options Options for the model update
   * @return {this}
   * @example
   * component.addAttributes({ 'data-key': 'value' });
   */
  addAttributes(attrs: ObjectAny, opts: SetOptions = {}) {
    return this.setAttributes(
      {
        ...this.getAttributes({ noClass: true }),
        ...attrs,
      },
      opts
    );
  }

  /**
   * Remove attributes from the component
   * @param {String|Array<String>} attrs Array of attributes to remove
   * @param {Object} options Options for the model update
   * @return {this}
   * @example
   * component.removeAttributes('some-attr');
   * component.removeAttributes(['some-attr1', 'some-attr2']);
   */
  removeAttributes(attrs: string | string[] = [], opts: SetOptions = {}) {
    const attrArr = Array.isArray(attrs) ? attrs : [attrs];
    const compAttr = this.getAttributes();
    attrArr.map(i => delete compAttr[i]);
    return this.setAttributes(compAttr, opts);
  }

  /**
   * Get the style of the component
   * @return {Object}
   */
  getStyle(options: any = {}, optsAdd: any = {}) {
    const { em } = this;
    const prop = isString(options) ? options : '';
    const opts = prop ? optsAdd : options;

    if (avoidInline(em) && !opts.inline) {
      const state = em.get('state');
      const cc = em.Css;
      const rule = cc.getIdRule(this.getId(), { state, ...opts });
      this.rule = rule;

      if (rule) {
        return rule.getStyle(prop);
      }
    }

    return super.getStyle.call(this, prop);
  }

  /**
   * Set the style on the component
   * @param {Object} prop Key value style object
   * @return {Object}
   * @example
   * component.setStyle({ color: 'red' });
   */
  setStyle(prop: StyleProps = {}, opts: any = {}) {
    const { opt, em } = this;

    if (avoidInline(em) && !opt.temporary && !opts.inline) {
      const style = this.get('style') || {};
      prop = isString(prop) ? this.parseStyle(prop) : prop;
      prop = { ...prop, ...style };
      const state = em.get('state');
      const cc = em.Css;
      const propOrig = this.getStyle(opts);
      this.rule = cc.setIdRule(this.getId(), prop, { state, ...opts });
      const diff = shallowDiff(propOrig, prop);
      this.set('style', '', { silent: true });
      keys(diff).forEach(pr => this.trigger(`change:style:${pr}`));
    } else {
      prop = super.setStyle.apply(this, arguments as any);
    }

    if (!opt.temporary) {
      this.__onStyleChange(opts.addStyle || prop);
    }

    return prop;
  }

  /**
   * Return all component's attributes
   * @return {Object}
   */
  getAttributes(opts: { noClass?: boolean; noStyle?: boolean } = {}) {
    const { em } = this;
    const classes: string[] = [];
    const attributes = { ...this.get('attributes') };
    const sm = em?.Selectors;
    const id = this.getId();

    // Add classes
    if (opts.noClass) {
      delete attributes.class;
    } else {
      this.classes.forEach(cls => classes.push(isString(cls) ? cls : cls.getName()));
      classes.length && (attributes.class = classes.join(' '));
    }

    // Add style
    if (!opts.noStyle) {
      const style = this.get('style');
      if (isObject(style) && !isEmptyObj(style)) {
        attributes.style = this.styleToString({ inline: 1 });
      }
    }

    // Check if we need an ID on the component
    if (!has(attributes, 'id')) {
      let addId = false;

      // If we don't rely on inline styling we have to check
      // for the ID selector
      if (avoidInline(em) || !isEmpty(this.getStyle())) {
        addId = !!sm?.get(id, sm.Selector.TYPE_ID);
      }

      if (
        // Symbols should always have an id
        this.__getSymbol() ||
        this.__getSymbols() ||
        // Components with script should always have an id
        this.get('script-export') ||
        this.get('script')
      ) {
        addId = true;
      }

      if (addId) {
        attributes.id = id;
      }
    }

    return attributes;
  }

  /**
   * Add classes
   * @param {Array<String>|String} classes Array or string of classes
   * @return {Array} Array of added selectors
   * @example
   * model.addClass('class1');
   * model.addClass('class1 class2');
   * model.addClass(['class1', 'class2']);
   * // -> [SelectorObject, ...]
   */
  addClass(classes: string | string[]) {
    const added = this.em.Selectors.addClass(classes);
    return this.classes.add(added);
  }

  /**
   * Set classes (resets current collection)
   * @param {Array<String>|String} classes Array or string of classes
   * @return {Array} Array of added selectors
   * @example
   * model.setClass('class1');
   * model.setClass('class1 class2');
   * model.setClass(['class1', 'class2']);
   * // -> [SelectorObject, ...]
   */
  setClass(classes: string | string[]) {
    this.classes.reset();
    return this.addClass(classes);
  }

  /**
   * Remove classes
   * @param {Array<String>|String} classes Array or string of classes
   * @return {Array} Array of removed selectors
   * @example
   * model.removeClass('class1');
   * model.removeClass('class1 class2');
   * model.removeClass(['class1', 'class2']);
   * // -> [SelectorObject, ...]
   */
  removeClass(classes: string | string[]) {
    const removed: Selector[] = [];
    classes = isArray(classes) ? classes : [classes];
    const selectors = this.classes;
    const type = Selector.TYPE_CLASS;

    classes.forEach(classe => {
      const classes = classe.split(' ');
      classes.forEach(name => {
        const selector = selectors.where({ name, type })[0];
        selector && removed.push(selectors.remove(selector));
      });
    });

    return removed;
  }

  /**
   * Returns component's classes as an array of strings
   * @return {Array}
   */
  getClasses() {
    const attr = this.getAttributes();
    const classStr = attr.class;
    return classStr ? classStr.split(' ') : [];
  }

  __logSymbol(type: string, toUp: Component[], opts: any = {}) {
    const symbol = this.__getSymbol();
    const symbols = this.__getSymbols();
    if (!symbol && !symbols) return;
    this.em.log(type, { model: this, toUp, context: 'symbols', opts });
  }

  __initSymb() {
    if (this.__symbReady) return;
    this.on('change', this.__upSymbProps);
    this.__symbReady = true;
  }

  __isSymbol() {
    return isArray(this.get(keySymbols));
  }

  __isSymbolOrInst() {
    return !!(this.__isSymbol() || this.get(keySymbol));
  }

  __isSymbolTop() {
    const parent = this.parent();
    const symb = this.__isSymbolOrInst();
    return symb && (!parent || (parent && !parent.__isSymbol() && !parent.__getSymbol()));
  }

  __isSymbolNested() {
    if (!this.__isSymbolOrInst() || this.__isSymbolTop()) return false;
    const symbTopSelf = (this.__isSymbol() ? this : this.__getSymbol())!.__getSymbTop();
    const symbTop = this.__getSymbTop();
    const symbTopMain = symbTop.__isSymbol() ? symbTop : symbTop.__getSymbol();
    return symbTopMain !== symbTopSelf;
  }

  __getAllById() {
    const { em } = this;
    return em ? em.Components.allById() : {};
  }

  __getSymbol(): Component | undefined {
    let symb = this.get(keySymbol);
    if (symb && isString(symb)) {
      const ref = this.__getAllById()[symb];
      if (ref) {
        symb = ref;
        this.set(keySymbol, ref);
      } else {
        symb = 0;
      }
    }
    return symb;
  }

  __getSymbols(): Component[] | undefined {
    let symbs = this.get(keySymbols);
    if (symbs && isArray(symbs)) {
      symbs.forEach((symb, idx) => {
        if (symb && isString(symb)) {
          symbs[idx] = this.__getAllById()[symb];
        }
      });
      symbs = symbs.filter(symb => symb && !isString(symb));
    }
    return symbs;
  }

  __isSymbOvrd(prop = '') {
    const ovrd = this.get(keySymbolOvrd);
    const [prp] = prop.split(':');
    const props = prop !== prp ? [prop, prp] : [prop];
    return ovrd === true || (isArray(ovrd) && props.some(p => ovrd.indexOf(p) >= 0));
  }

  __getSymbToUp(opts: SymbolToUpOptions = {}) {
    let result: Component[] = [];
    const { changed } = opts;

    if (
      opts.fromInstance ||
      opts.noPropagate ||
      opts.fromUndo ||
      // Avoid updating others if the current component has override
      (changed && this.__isSymbOvrd(changed))
    ) {
      return result;
    }

    const symbols = this.__getSymbols() || [];
    const symbol = this.__getSymbol();
    const all = symbol ? [symbol, ...(symbol.__getSymbols() || [])] : symbols;
    result = all
      .filter(s => s !== this)
      // Avoid updating those with override
      .filter(s => !(changed && s.__isSymbOvrd(changed)));

    return result;
  }

  __getSymbTop(opts?: any) {
    let result: Component = this;
    let parent = this.parent(opts);

    while (parent && (parent.__isSymbol() || parent.__getSymbol())) {
      result = parent;
      parent = parent.parent(opts);
    }

    return result;
  }

  __upSymbProps(m: any, opts: SymbolToUpOptions = {}) {
    const changed = this.changedAttributes() || {};
    const attrs = changed.attributes || {};
    delete changed.status;
    delete changed.open;
    delete changed[keySymbols];
    delete changed[keySymbol];
    delete changed[keySymbolOvrd];
    delete changed.attributes;
    delete attrs.id;
    if (!isEmptyObj(attrs)) changed.attributes = attrs;
    if (!isEmptyObj(changed)) {
      const toUp = this.__getSymbToUp(opts);
      // Avoid propagating overrides to other symbols
      keys(changed).map(prop => {
        if (this.__isSymbOvrd(prop)) delete changed[prop];
      });

      this.__logSymbol('props', toUp, { opts, changed });
      toUp.forEach(child => {
        const propsChanged = { ...changed };
        // Avoid updating those with override
        keys(propsChanged).map(prop => {
          if (child.__isSymbOvrd(prop)) delete propsChanged[prop];
        });
        child.set(propsChanged, { fromInstance: this, ...opts });
      });
    }
  }

  __upSymbCls(m: any, c: any, opts = {}) {
    const toUp = this.__getSymbToUp(opts);
    this.__logSymbol('classes', toUp, { opts });
    toUp.forEach(child => {
      // @ts-ignore This will propagate the change up to __upSymbProps
      child.set('classes', this.get('classes'), { fromInstance: this });
    });
    this.__changesUp(opts);
  }

  __upSymbComps(m: Component, c: Components, o: any) {
    const optUp = o || c || {};
    const { fromInstance, fromUndo } = optUp;
    const toUpOpts = { fromInstance, fromUndo };
    const isTemp = m.opt.temporary;

    // Reset
    if (!o) {
      const toUp = this.__getSymbToUp({
        ...toUpOpts,
        changed: 'components:reset',
      });
      // @ts-ignore
      const cmps = m.models as Component[];
      this.__logSymbol('reset', toUp, { components: cmps });
      toUp.forEach(symb => {
        const newMods = cmps.map(mod => mod.clone({ symbol: true }));
        // @ts-ignore
        symb.components().reset(newMods, { fromInstance: this, ...c });
      });
      // Add
    } else if (o.add) {
      let addedInstances: Component[] = [];
      const isMainSymb = !!this.__getSymbols();
      const toUp = this.__getSymbToUp({
        ...toUpOpts,
        changed: 'components:add',
      });
      if (toUp.length) {
        const addSymb = m.__getSymbol();
        addedInstances = (addSymb ? addSymb.__getSymbols() : m.__getSymbols()) || [];
        addedInstances = [...addedInstances];
        addedInstances.push(addSymb ? addSymb : m);
      }
      !isTemp &&
        this.__logSymbol('add', toUp, {
          opts: o,
          addedInstances: addedInstances.map(c => c.cid),
          added: m.cid,
        });
      // Here, before appending a new symbol, I have to ensure there are no previously
      // created symbols (eg. used mainly when drag components around)
      toUp.forEach(symb => {
        const symbTop = symb.__getSymbTop();
        const symbPrev = addedInstances.filter(addedInst => {
          const addedTop = addedInst.__getSymbTop({ prev: 1 });
          return symbTop && addedTop && addedTop === symbTop;
        })[0];
        const toAppend = symbPrev || m.clone({ symbol: true, symbolInv: isMainSymb });
        symb.append(toAppend, { fromInstance: this, ...o });
      });
      // Remove
    } else {
      // Remove instance reference from the symbol
      const symb = m.__getSymbol();
      symb &&
        !o.temporary &&
        symb.set(
          keySymbols,
          symb.__getSymbols()!.filter(i => i !== m)
        );

      // Propagate remove only if the component is an inner symbol
      if (!m.__isSymbolTop()) {
        const changed = 'components:remove';
        const { index } = o;
        const parent = m.parent();
        const opts = { fromInstance: m, ...o };
        const isSymbNested = m.__isSymbolNested();
        let toUpFn = (symb: Component) => {
          const symbPrnt = symb.parent();
          symbPrnt && !symbPrnt.__isSymbOvrd(changed) && symb.remove(opts);
        };
        // Check if the parent allows the removing
        let toUp = !parent?.__isSymbOvrd(changed) ? m.__getSymbToUp(toUpOpts) : [];

        if (isSymbNested) {
          toUp = parent?.__getSymbToUp({ ...toUpOpts, changed })!;
          toUpFn = symb => {
            const toRemove = symb.components().at(index);
            toRemove && toRemove.remove({ fromInstance: parent, ...opts });
          };
        }

        !isTemp &&
          this.__logSymbol('remove', toUp, {
            opts: o,
            removed: m.cid,
            isSymbNested,
          });
        toUp.forEach(toUpFn);
      }
    }

    this.__changesUp(optUp);
  }

  initClasses(m?: any, c?: any, opts: any = {}) {
    const event = 'change:classes';
    const { class: attrCls, ...restAttr } = this.get('attributes') || {};
    const toListen = [this, event, this.initClasses];
    const cls = this.get('classes') || attrCls || [];
    const clsArr = isString(cls) ? cls.split(' ') : cls;
    this.stopListening(...toListen);
    const classes = this.normalizeClasses(clsArr);
    const selectors = new Selectors([]);
    this.set('classes', selectors, opts);
    selectors.add(classes);
    selectors.on('add remove reset', this.__upSymbCls);
    // Clear attributes from classes
    attrCls && classes.length && this.set('attributes', restAttr);
    // @ts-ignore
    this.listenTo(...toListen);
    return this;
  }

  initComponents() {
    const event = 'change:components';
    const toListen = [this, event, this.initComponents];
    this.stopListening(...toListen);
    // Have to add components after the init, otherwise the parent
    // is not visible
    const comps = new Components([], this.opt);
    comps.parent = this;
    const components = this.get('components');
    const addChild = !this.opt.avoidChildren;
    this.set('components', comps);
    addChild && components && comps.add(isFunction(components) ? components(this) : components, this.opt as any);
    comps.on('add remove reset', this.__upSymbComps);
    // @ts-ignore
    this.listenTo(...toListen);
    return this;
  }

  initTraits(changed?: any) {
    const { em } = this;
    const event = 'change:traits';
    this.off(event, this.initTraits);
    this.__loadTraits();
    const attrs = { ...this.get('attributes') };
    const traits = this.traits;
    traits.each(trait => {
      if (!trait.changeProp) {
        const name = trait.getName();
        const value = trait.getInitValue();
        if (name && value) attrs[name] = value;
      }
    });
    traits.length && this.set('attributes', attrs);
    this.on(event, this.initTraits);
    changed && em && em.trigger('component:toggled');
    return this;
  }

  initScriptProps() {
    if (this.opt.temporary) return;
    const prop = 'script-props';
    const toListen: any = [`change:${prop}`, this.initScriptProps];
    this.off(...toListen);
    const prevProps = this.previous(prop) || [];
    const newProps = this.get(prop) || [];
    const prevPropsEv = prevProps.map(e => `change:${e}`).join(' ');
    const newPropsEv = newProps.map(e => `change:${e}`).join(' ');
    prevPropsEv && this.off(prevPropsEv, this.__scriptPropsChange);
    newPropsEv && this.on(newPropsEv, this.__scriptPropsChange);
    // @ts-ignore
    this.on(...toListen);
  }

  __scriptPropsChange(m: any, v: any, opts: any = {}) {
    if (opts.avoidStore) return;
    this.trigger('rerender');
  }

  /**
   * Add new component children
   * @param  {Component|String} components Component to add
   * @param {Object} [opts={}] Options for the append action
   * @return {Array} Array of appended components
   * @example
   * someComponent.get('components').length // -> 0
   * const videoComponent = someComponent.append('<video></video><div></div>')[0];
   * // This will add 2 components (`video` and `div`) to your `someComponent`
   * someComponent.get('components').length // -> 2
   * // You can pass components directly
   * otherComponent.append(otherComponent2);
   * otherComponent.append([otherComponent3, otherComponent4]);
   * // append at specific index (eg. at the beginning)
   * someComponent.append(otherComponent, { at: 0 });
   */
  append(components: ComponentAdd, opts: AddOptions = {}): Component[] {
    const compArr = isArray(components) ? [...components] : [components];
    const toAppend = compArr.map(comp => {
      if (isString(comp)) {
        return comp;
      } else {
        // I have to remove components from the old container before adding them to a new one
        comp.collection && (comp as Component).collection.remove(comp, { temporary: true } as any);
        return comp;
      }
    });
    const result = this.components().add(toAppend, opts);
    return isArray(result) ? result : [result];
  }

  /**
   * Set new collection if `components` are provided, otherwise the
   * current collection is returned
   * @param  {Component|Component[]|String} [components] Component Definitions or HTML string
   * @param {Object} [opts={}] Options, same as in `Component.append()`
   * @returns {Collection|Array<[Component]>}
   * @example
   * // Set new collection
   * component.components('<span></span><div></div>');
   * // Get current collection
   * const collection = component.components();
   * console.log(collection.length);
   * // -> 2
   */
  components<T extends ComponentAdd | undefined>(
    components?: T,
    opts: any = {}
  ): undefined extends T ? Components : Component[] {
    const coll = this.get('components')!;

    if (isUndefined(components)) {
      return coll as any;
    } else {
      coll.reset(undefined, opts);
      return components ? this.append(components, opts) : ([] as any);
    }
  }

  /**
   * If exists, returns the child component at specific index.
   * @param {Number} index Index of the component to return
   * @returns {[Component]|null}
   * @example
   * // Return first child
   * component.getChildAt(0);
   * // Return second child
   * component.getChildAt(1);
   */
  getChildAt(index: number) {
    return this.components().at(index || 0) || undefined;
  }

  /**
   * If exists, returns the last child component.
   * @returns {[Component]|null}
   * @example
   * const lastChild = component.getLastChild();
   */
  getLastChild() {
    const children = this.components();
    return children.at(children.length - 1) || null;
  }

  /**
   * Remove all inner components
   * * @return {this}
   */
  empty(opts = {}) {
    this.components().reset(undefined, opts);
    return this;
  }

  /**
   * Get the parent component, if exists
   * @return {Component|null}
   * @example
   * component.parent();
   * // -> Component
   */
  parent(opts: any = {}): Component | undefined {
    const coll = this.collection || (opts.prev && this.prevColl);
    return coll ? coll.parent : undefined;
  }

  /**
   * Return all parents of the component.
   * @returns {Array<Component>}
   */
  parents(): Component[] {
    const parent = this.parent();
    return parent ? [parent].concat(parent.parents()) : [];
  }

  /**
   * Script updated
   * @private
   */
  scriptUpdated() {
    this.set('scriptUpdated', 1);
  }

  /**
   * Init toolbar
   * @private
   */
  initToolbar() {
    const { em } = this;
    const model = this;
    const ppfx = (em && em.getConfig().stylePrefix) || '';

    if (!model.get('toolbar') && em) {
      const tb: ToolbarButtonProps[] = [];
      model.collection &&
        tb.push({
          label: em.getIcon('arrowUp'),
          command: (ed: any) => ed.runCommand('core:component-exit', { force: 1 }),
        });
      model.get('draggable') &&
        tb.push({
          attributes: { class: `${ppfx}no-touch-actions`, draggable: true },
          label: em.getIcon('move'),
          command: 'tlb-move',
        });
      model.get('copyable') &&
        tb.push({
          label: em.getIcon('copy'),
          command: 'tlb-clone',
        });
      model.get('removable') &&
        tb.push({
          label: em.getIcon('delete'),
          command: 'tlb-delete',
        });
      model.set('toolbar', tb);
    }
  }

  __loadTraits(tr?: Traits | TraitProperties[], opts = {}) {
    let traitsI = tr || this.traits;

    if (!(traitsI instanceof Traits)) {
      traitsI = (isFunction(traitsI) ? traitsI(this) : traitsI) as TraitProperties[];
      const traits = new Traits([], this.opt as any);
      traits.setTarget(this);

      if (traitsI.length) {
        traitsI.forEach(tr => tr.attributes && delete tr.attributes.value);
        traits.add(traitsI);
      }

      this.set({ traits }, opts);
    }

    return this;
  }

  /**
   * Get traits.
   * @returns {Array<Trait>}
   * @example
   * const traits = component.getTraits();
   * console.log(traits);
   * // [Trait, Trait, Trait, ...]
   */
  getTraits(): Trait[] {
    this.__loadTraits();
    return [...this.traits.models];
  }

  /**
   * Replace current collection of traits with a new one.
   * @param {Array<Object>} traits Array of trait definitions
   * @returns {Array<Trait>}
   * @example
   * const traits = component.setTraits([{ type: 'checkbox', name: 'disabled'}, ...]);
   * console.log(traits);
   * // [Trait, ...]
   */
  setTraits(traits: TraitProperties[]) {
    const tr = isArray(traits) ? traits : [traits];
    // @ts-ignore
    this.set({ traits: tr });
    return this.getTraits();
  }

  /**
   * Get the trait by id/name.
   * @param  {String} id The `id` or `name` of the trait
   * @return {Trait|null} Trait getModelToStyle
   * @example
   * const traitTitle = component.getTrait('title');
   * traitTitle && traitTitle.set('label', 'New label');
   */
  getTrait(id: string) {
    return (
      this.getTraits().filter(trait => {
        return trait.get('id') === id || trait.get('name') === id;
      })[0] || null
    );
  }

  /**
   * Update a trait.
   * @param  {String} id The `id` or `name` of the trait
   * @param  {Object} props Object with the props to update
   * @return {this}
   * @example
   * component.updateTrait('title', {
   *  type: 'select',
   *  options: [ 'Option 1', 'Option 2' ],
   * });
   */
  updateTrait(id: string, props: Partial<TraitProperties>) {
    const trait = this.getTrait(id);
    trait && trait.set(props);
    this.em?.trigger('component:toggled');
    return this;
  }

  /**
   * Get the trait position index by id/name. Useful in case you want to
   * replace some trait, at runtime, with something else.
   * @param  {String} id The `id` or `name` of the trait
   * @return {Number} Index position of the current trait
   * @example
   * const traitTitle = component.getTraitIndex('title');
   * console.log(traitTitle); // 1
   */
  getTraitIndex(id: string) {
    const trait = this.getTrait(id);
    return trait ? this.traits.indexOf(trait) : -1;
  }

  /**
   * Remove trait/s by id/s.
   * @param  {String|Array<String>} id The `id`/`name` of the trait (or an array)
   * @return {Array<Trait>} Array of removed traits
   * @example
   * component.removeTrait('title');
   * component.removeTrait(['title', 'id']);
   */
  removeTrait(id: string | string[]) {
    const ids = isArray(id) ? id : [id];
    const toRemove = ids.map(id => this.getTrait(id));
    const { traits } = this;
    const removed = toRemove.length ? traits.remove(toRemove) : [];
    this.em?.trigger('component:toggled');
    return isArray(removed) ? removed : [removed];
  }

  /**
   * Add new trait/s.
   * @param  {String|Object|Array<String|Object>} trait Trait to add (or an array of traits)
   * @param  {Options} opts Options for the add
   * @return {Array<Trait>} Array of added traits
   * @example
   * component.addTrait('title', { at: 1 }); // Add title trait (`at` option is the position index)
   * component.addTrait({
   *  type: 'checkbox',
   *  name: 'disabled',
   * });
   * component.addTrait(['title', {...}, ...]);
   */
  addTrait(trait: Parameters<Traits['add']>[0], opts: AddOptions = {}) {
    this.__loadTraits();
    const added = this.traits.add(trait, opts);
    this.em?.trigger('component:toggled');
    return isArray(added) ? added : [added];
  }

  /**
   * Normalize input classes from array to array of objects
   * @param {Array} arr
   * @return {Array}
   * @private
   */
  normalizeClasses(arr: string[]): Selector[] {
    const res: Selector[] = [];
    const { em } = this;
    const clm = em?.Selectors;
    if (!clm) return [];
    // @ts-ignore
    if (arr.models) return [...arr.models];
    arr.forEach(val => res.push(clm.add(val) as Selector));
    return res;
  }

  /**
   * Override original clone method
   * @private
   */
  clone(opt: { symbol?: boolean; symbolInv?: boolean } = {}) {
    const em = this.em;
    const attr = { ...this.attributes };
    const opts = { ...this.opt };
    const id = this.getId();
    const cssc = em?.Css;
    attr.attributes = { ...attr.attributes };
    delete attr.attributes.id;
    // @ts-ignore
    attr.components = [];
    // @ts-ignore
    attr.classes = [];
    // @ts-ignore
    attr.traits = [];

    if (this.__isSymbolTop()) {
      opt.symbol = true;
    }

    this.get('components')!.each((md, i) => {
      // @ts-ignore
      attr.components[i] = md.clone({ ...opt, _inner: 1 });
    });
    this.get('traits')!.each((md, i) => {
      // @ts-ignore
      attr.traits[i] = md.clone();
    });
    this.get('classes')!.each((md, i) => {
      // @ts-ignore
      attr.classes[i] = md.get('name');
    });

    attr.status = '';
    // @ts-ignore
    opts.collection = null;
    // @ts-ignore
    const cloned = new this.constructor(attr, opts);

    // Clone component specific rules
    const newId = `#${cloned.getId()}`;
    const rulesToClone = cssc ? cssc.getRules(`#${id}`) : [];
    rulesToClone.forEach(rule => {
      const newRule = rule.clone();
      // @ts-ignore
      newRule.set('selectors', [newId]);
      cssc.getAll().add(newRule);
    });

    // Symbols
    // If I clone an inner symbol, I have to reset it
    cloned.set(keySymbols, 0);
    const symbol = this.__getSymbol();
    const symbols = this.__getSymbols();

    if (!opt.symbol && (symbol || symbols)) {
      cloned.set(keySymbol, 0);
      cloned.set(keySymbols, 0);
    } else if (symbol) {
      // Contains already a reference to a symbol
      symbol.set(keySymbols, [...symbol.__getSymbols()!, cloned]);
      cloned.__initSymb();
    } else if (opt.symbol) {
      // Request to create a symbol
      if (this.__isSymbol()) {
        // Already a symbol, cloned should be an instance
        this.set(keySymbols, [...symbols!, cloned]);
        cloned.set(keySymbol, this);
        cloned.__initSymb();
      } else if (opt.symbolInv) {
        // Inverted, cloned is the instance, the origin is the main symbol
        this.set(keySymbols, [cloned]);
        cloned.set(keySymbol, this);
        [this, cloned].map(i => i.__initSymb());
      } else {
        // Cloned becomes the main symbol
        cloned.set(keySymbols, [this]);
        [this, cloned].map(i => i.__initSymb());
        this.set(keySymbol, cloned);
      }
    }

    const event = 'component:clone';
    em && em.trigger(event, cloned);
    this.trigger(event, cloned);

    return cloned;
  }

  /**
   * Get the name of the component.
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.noCustom] Avoid custom name assigned to the component.
   * @returns {String}
   * */
  getName(opts: { noCustom?: boolean } = {}) {
    const { em } = this;
    const { type, tagName, name } = this.attributes;
    const defName = type || tagName;
    const nameTag = !type ? tagName : '';
    const i18nPfx = 'domComponents.names.';
    const i18nName = name && em?.t(`${i18nPfx}${name}`);
    const i18nNameTag = nameTag && em?.t(`${i18nPfx}${nameTag}`);
    const i18nDefName = em && (em.t(`${i18nPfx}${type}`) || em.t(`${i18nPfx}${tagName}`));
    const customName = this.get('custom-name');

    return (
      (!opts.noCustom ? customName : '') || // Used in Layers (when the user changes the name)
      i18nName || // Use local component `name` key (eg. `domComponents.names.myComponentName`)
      name || // Use component `name` key
      i18nNameTag || // Use local component `tagName` key (eg. `domComponents.names.div`)
      capitalize(nameTag) || // Use component `tagName` key
      i18nDefName || // Use local component `type` key (eg. `domComponents.names.image`)
      capitalize(defName) // Use component `type` key
    );
  }

  /**
   * Get the icon string
   * @return {String}
   */
  getIcon() {
    let icon = this.get('icon');
    return icon ? icon + ' ' : '';
  }

  /**
   * Return HTML string of the component
   * @param {Object} [opts={}] Options
   * @param {String} [opts.tag] Custom tagName
   * @param {Object|Function} [opts.attributes=null] You can pass an object of custom attributes to replace with the current ones or you can even pass a function to generate attributes dynamically.
   * @param {Boolean} [opts.withProps] Include component properties as `data-gjs-*` attributes. This allows you to have re-importable HTML.
   * @param {Boolean} [opts.altQuoteAttr] In case the attribute value contains a `"` char, instead of escaping it (`attr="value &quot;"`), the attribute will be quoted using single quotes (`attr='value "'`).
   * @return {String} HTML string
   * @example
   * // Simple HTML return
   * component.set({ tagName: 'span' });
   * component.setAttributes({ title: 'Hello' });
   * component.toHTML();
   * // -> <span title="Hello"></span>
   *
   * // Custom attributes
   * component.toHTML({ attributes: { 'data-test': 'Hello' } });
   * // -> <span data-test="Hello"></span>
   *
   * // Custom dynamic attributes
   * component.toHTML({
   *  attributes(component, attributes) {
   *    if (component.get('tagName') == 'span') {
   *      attributes.title = 'Custom attribute';
   *    }
   *    return attributes;
   *  },
   * });
   * // -> <span title="Custom attribute"></span>
   */
  toHTML(opts: ToHTMLOptions = {}): string {
    const model = this;
    const attrs = [];
    const customTag = opts.tag;
    const tag = customTag || model.get('tagName');
    const sTag = model.get('void');
    const customAttr = opts.attributes;
    let attributes = this.getAttrToHTML();
    delete opts.tag;

    // Get custom attributes if requested
    if (customAttr) {
      if (isFunction(customAttr)) {
        attributes = customAttr(model, attributes) || {};
      } else if (isObject(customAttr)) {
        attributes = customAttr;
      }
    }

    if (opts.withProps) {
      const props = this.toJSON();

      forEach(props, (value, key) => {
        const skipProps = ['classes', 'attributes', 'components'];
        if (key[0] !== '_' && skipProps.indexOf(key) < 0) {
          attributes[`data-gjs-${key}`] = isArray(value) || isObject(value) ? JSON.stringify(value) : value;
        }
      });
    }

    for (let attr in attributes) {
      const val = attributes[attr];

      if (!isUndefined(val) && val !== null) {
        if (isBoolean(val)) {
          val && attrs.push(attr);
        } else {
          let valueRes = '';
          if (opts.altQuoteAttr && isString(val) && val.indexOf('"') >= 0) {
            valueRes = `'${val.replace(/'/g, '&apos;')}'`;
          } else {
            const value = isString(val) ? val.replace(/"/g, '&quot;') : val;
            valueRes = `"${value}"`;
          }

          attrs.push(`${attr}=${valueRes}`);
        }
      }
    }

    const attrString = attrs.length ? ` ${attrs.join(' ')}` : '';
    const inner = model.getInnerHTML(opts);
    let code = `<${tag}${attrString}${sTag ? '/' : ''}>${inner}`;
    !sTag && (code += `</${tag}>`);

    return code;
  }

  /**
   * Get inner HTML of the component
   * @param {Object} [opts={}] Same options of `toHTML`
   * @returns {String} HTML string
   */
  getInnerHTML(opts?: ToHTMLOptions) {
    return this.__innerHTML(opts);
  }

  __innerHTML(opts: ToHTMLOptions = {}) {
    const cmps = this.components();
    return !cmps.length ? this.content : cmps.map(c => c.toHTML(opts)).join('');
  }

  /**
   * Returns object of attributes for HTML
   * @return {Object}
   * @private
   */
  getAttrToHTML() {
    const attrs = this.getAttributes();

    if (avoidInline(this.em)) {
      delete attrs.style;
    }

    return attrs;
  }

  /**
   * Return a shallow copy of the model's attributes for JSON
   * stringification.
   * @return {Object}
   * @private
   */
  toJSON(opts: ObjectAny = {}): ComponentDefinition {
    const obj = Model.prototype.toJSON.call(this, opts);
    obj.attributes = this.getAttributes();
    delete obj.attributes.class;
    delete obj.toolbar;
    delete obj.traits;
    delete obj.status;
    delete obj.open; // used in Layers
    delete obj._undoexc;
    delete obj.delegate;

    if (!opts.fromUndo) {
      const symbol = obj[keySymbol];
      const symbols = obj[keySymbols];
      if (symbols && isArray(symbols)) {
        obj[keySymbols] = symbols.filter(i => i).map(i => (i.getId ? i.getId() : i));
      }
      if (symbol && !isString(symbol)) {
        obj[keySymbol] = symbol.getId();
      }
    }

    if (this.em.getConfig().avoidDefaults) {
      this.getChangedProps(obj);
    }

    return obj;
  }

  /**
   * Return an object containing only changed props
   */
  getChangedProps(res: Partial<ComponentDefinition>): Partial<ComponentDefinition> {
    const obj: any = res || Model.prototype.toJSON.apply(this);
    const defaults = result(this, 'defaults');

    forEach(defaults, (value, key) => {
      if (['type'].indexOf(key) === -1 && obj[key] === value) {
        delete obj[key];
      }
    });

    if (isEmpty(obj.type)) {
      delete obj.type;
    }

    forEach(['attributes', 'style'], prop => {
      if (isEmpty(defaults[prop]) && isEmpty(obj[prop])) {
        delete obj[prop];
      }
    });

    forEach(['classes', 'components'], prop => {
      if (!obj[prop] || (isEmpty(defaults[prop]) && !obj[prop].length)) {
        delete obj[prop];
      }
    });

    return obj;
  }

  /**
   * Return the component id
   * @return {String}
   */
  getId(): string {
    let attrs = this.get('attributes') || {};
    return attrs.id || this.ccid || this.cid;
  }

  /**
   * Set new id on the component
   * @param {String} id
   * @return {this}
   */
  setId(id: string, opts?: SetOptions & { idUpdate?: boolean }) {
    const attrs = { ...this.get('attributes') };
    attrs.id = id;
    this.set('attributes', attrs, opts);
    return this;
  }

  /**
   * Get the DOM element of the component.
   * This works only if the component is already rendered
   * @param {Frame} frame Specific frame from which taking the element
   * @return {HTMLElement}
   */
  getEl(frame?: Frame) {
    const view = this.getView(frame);
    return view && view.el;
  }

  /**
   * Get the View of the component.
   * This works only if the component is already rendered
   * @param {Frame} frame Get View of a specific frame
   * @return {ComponentView}
   */
  getView(frame?: Frame) {
    let { view, views, em } = this;
    const frm = frame || em?.getCurrentFrameModel();

    if (frm) {
      view = views.filter(view => view.frameView === frm.view)[0];
    }

    return view;
  }

  getCurrentView() {
    const frameView = this.em.getCurrentFrame();
    const frame = frameView?.model;
    return this.getView(frame);
  }

  __getScriptProps() {
    const modelProps = this.props();
    const scrProps = this.get('script-props') || [];
    return scrProps.reduce((acc, prop) => {
      acc[prop] = modelProps[prop];
      return acc;
    }, {} as Partial<ComponentProperties>);
  }

  /**
   * Return script in string format, cleans 'function() {..' from scripts
   * if it's a function
   * @param {string|Function} script
   * @return {string}
   * @private
   */
  getScriptString(script?: string | Function) {
    let scr = script || this.get('script') || '';

    if (!scr) {
      return scr;
    }

    if (this.get('script-props')) {
      scr = scr.toString().trim();
    } else {
      // Deprecated
      // Need to convert script functions to strings
      if (isFunction(scr)) {
        let scrStr = scr.toString().trim();
        scrStr = scrStr.slice(scrStr.indexOf('{') + 1, scrStr.lastIndexOf('}'));
        scr = scrStr.trim();
      }

      const config = this.em.getConfig();
      const tagVarStart = escapeRegExp(config.tagVarStart || '{[ ');
      const tagVarEnd = escapeRegExp(config.tagVarEnd || ' ]}');
      const reg = new RegExp(`${tagVarStart}([\\w\\d-]*)${tagVarEnd}`, 'g');
      scr = scr.replace(reg, (match, v) => {
        // If at least one match is found I have to track this change for a
        // better optimization inside JS generator
        this.scriptUpdated();
        const result = this.attributes[v] || '';
        return isArray(result) || typeof result == 'object' ? JSON.stringify(result) : result;
      });
    }
    return scr;
  }

  emitUpdate(property?: string, ...args: any[]) {
    const { em } = this;
    const event = keyUpdate + (property ? `:${property}` : '');
    const item = property && this.get(property);
    // @ts-ignore
    property && this.updated(property, item, property && this.previous(property), ...args);
    this.trigger(event, ...args);
    em && em.trigger(event, this, ...args);
    ['components', 'classes'].indexOf(property!) >= 0 &&
      this.__propSelfToParent({
        component: this,
        changed: { [property!]: item },
        options: args[2] || args[1] || {},
      });
  }

  /**
   * Execute callback function on itself and all inner components
   * @param  {Function} clb Callback function, the model is passed as an argument
   * @return {this}
   * @example
   * component.onAll(component => {
   *  // do something with component
   * })
   */
  onAll(clb: (cmp: Component) => void) {
    if (isFunction(clb)) {
      clb(this);
      this.components().forEach(model => model.onAll(clb));
    }
    return this;
  }

  /**
   * Execute a callback function on all inner child components.
   * @param  {Function} clb Callback function, the child component is passed as an argument
   * @example
   * component.forEachChild(child => {
   *  console.log(child)
   * })
   */
  forEachChild(clb: (child: Component) => void) {
    if (isFunction(clb)) {
      this.components().forEach(child => {
        clb(child);
        child.forEachChild(clb);
      });
    }
  }

  /**
   * Remove the component
   * @return {this}
   */
  remove(opts: any = {}) {
    const { em } = this;
    const coll = this.collection;
    const remove = () => {
      coll && coll.remove(this, { ...opts, action: 'remove-component' });
      // Component without parent
      if (!coll) {
        this.components('', opts);
        this.components().removeChildren(this, undefined, opts);
      }
    };
    const rmOpts = { ...opts };
    [this, em].map(i => i.trigger('component:remove:before', this, remove, rmOpts));
    !rmOpts.abort && remove();
    return this;
  }

  /**
   * Move the component to another destination component
   * @param {Component} component Destination component (so the current one will be appended as a child)
   * @param {Object} opts Options for the append action
   * @returns {this}
   * @example
   * // Move the selected component on top of the wrapper
   * const dest = editor.getWrapper();
   * editor.getSelected().move(dest, { at: 0 });
   */
  move(component: Component, opts: AddOptions = {}) {
    if (component) {
      const { at } = opts;
      const index = this.index();
      const sameParent = component === this.parent();
      const sameIndex = index === at || index === at! - 1;

      if (!sameParent || !sameIndex) {
        if (sameParent && at && at > index) {
          opts.at = at - 1;
        }
        this.remove({ temporary: 1 });
        component.append(this, opts);
        this.emitUpdate();
      }
    }
    return this;
  }

  /**
   * Check if the component is an instance of some component type.
   * @param {String} type Component type
   * @returns {Boolean}
   * @example
   * // Add a new component type by extending an existing one
   * editor.Components.addType('text-ext', { extend: 'text' });
   * // Append a new component somewhere
   * const newTextExt = editor.getSelected().append({ type: 'text-ext' })[0];
   * newTextExt.isInstanceOf('text-ext'); // true
   * newTextExt.isInstanceOf('text'); // true
   */
  isInstanceOf(type: string) {
    const cmp = this.em?.Components.getType(type)?.model;

    if (!cmp) return false;

    return this instanceof cmp;
  }

  /**
   * Check if the component is a child of some other component (or component type)
   * @param {[Component]|String} component Component parent to check. In case a string is passed,
   *  the check will be performed on the component type.
   * @returns {Boolean}
   * @example
   * const newTextComponent = editor.getSelected().append({
   *  type: 'text',
   *  components: 'My text <b>here</b>',
   * })[0];
   * const innerComponent = newTextComponent.find('b')[0];
   * innerComponent.isChildOf(newTextComponent); // true
   * innerComponent.isChildOf('text'); // true
   */
  isChildOf(component: string | Component) {
    const byType = isString(component);
    let parent = this.parent();

    while (parent) {
      if (byType) {
        if (parent.isInstanceOf(component)) {
          return true;
        }
      } else {
        if (parent === component) {
          return true;
        }
      }

      parent = parent.parent();
    }

    return false;
  }

  /**
   * Reset id of the component and any of its style rule
   * @param {Object} [opts={}] Options
   * @return {this}
   * @private
   */
  resetId(opts = {}) {
    const { em } = this;
    const oldId = this.getId();
    if (!oldId) return this;
    const newId = Component.createId(this);
    this.setId(newId);
    const rule = em?.Css.getIdRule(oldId);
    const selector = rule?.get('selectors')!.at(0);
    selector?.set('name', newId);
    return this;
  }

  _getStyleRule({ id }: { id?: string } = {}) {
    const { em } = this;
    const idS = id || this.getId();
    return em?.Css.getIdRule(idS);
  }

  _getStyleSelector(opts?: { id?: string }) {
    const rule = this._getStyleRule(opts);
    return rule?.get('selectors')!.at(0);
  }

  _idUpdated(m: any, v: any, opts: { idUpdate?: boolean } = {}) {
    if (opts.idUpdate) return;

    const { ccid } = this;
    const { id } = this.get('attributes') || {};
    const idPrev = (this.previous('attributes') || {}).id || ccid;
    const list = Component.getList(this);

    // If the ID already exists I need to rollback to the old one
    if (list[id] || (!id && idPrev)) {
      return this.setId(idPrev, { idUpdate: true });
    }

    // Remove the old ID reference and add the new one
    delete list[idPrev];
    list[id] = this;
    this.ccid = id;

    // Update the style selector name
    const selector = this._getStyleSelector({ id: idPrev });
    selector && selector.set({ name: id, label: id });
  }

  static getDefaults() {
    return result(this.prototype, 'defaults');
  }

  static isComponent(el: HTMLElement): ComponentDefinitionDefined | boolean | undefined {
    return { tagName: toLowerCase(el.tagName) };
  }

  static ensureInList(model: Component) {
    const list = Component.getList(model);
    const id = model.getId();
    const current = list[id];

    if (!current) {
      // Insert in list
      list[id] = model;
    } else if (current !== model) {
      // Create new ID
      const nextId = Component.getIncrementId(id, list);
      model.setId(nextId);
      list[nextId] = model;
    }

    model.components().forEach(i => Component.ensureInList(i));
  }

  static createId(model: Component, opts: any = {}) {
    const list = Component.getList(model);
    const { idMap = {} } = opts;
    let { id } = model.get('attributes')!;
    let nextId;

    if (id) {
      nextId = Component.getIncrementId(id, list, opts);
      model.setId(nextId);
      if (id !== nextId) idMap[id] = nextId;
    } else {
      nextId = Component.getNewId(list);
    }

    list[nextId] = model;
    return nextId;
  }

  static getNewId(list: ObjectAny) {
    const count = Object.keys(list).length;
    // Testing 1000000 components with `+ 2` returns 0 collisions
    const ilen = count.toString().length + 2;
    const uid = (Math.random() + 1.1).toString(36).slice(-ilen);
    let newId = `i${uid}`;

    while (list[newId]) {
      newId = Component.getNewId(list);
    }

    return newId;
  }

  static getIncrementId(id: string, list: ObjectAny, opts: { keepIds?: string[] } = {}) {
    const { keepIds = [] } = opts;
    let counter = 1;
    let newId = id;

    if (keepIds.indexOf(id) < 0) {
      while (list[newId]) {
        counter++;
        newId = `${id}-${counter}`;
      }
    }

    return newId;
  }

  static getList(model: Component) {
    const { opt = {} } = model;
    // @ts-ignore
    const { domc, em } = opt;
    const dm = domc || em?.Components;
    return dm ? dm.componentsById : {};
  }

  static checkId(
    components: ComponentDefinitionDefined | ComponentDefinitionDefined[],
    styles: CssRuleJSON[] = [],
    list: ObjectAny = {},
    opts: { keepIds?: string[]; idMap?: PrevToNewIdMap } = {}
  ) {
    const comps = isArray(components) ? components : [components];
    const { keepIds = [], idMap = {} } = opts;
    comps.forEach(comp => {
      comp.attributes;
      const { attributes = {}, components } = comp;
      const { id } = attributes;

      // Check if we have collisions with current components
      if (id && list[id] && keepIds.indexOf(id) < 0) {
        const newId = Component.getIncrementId(id, list);
        idMap[id] = newId;
        attributes.id = newId;
        // Update passed styles
        isArray(styles) &&
          styles.forEach(style => {
            const { selectors } = style;
            selectors.forEach((sel, idx) => {
              if (sel === `#${id}`) selectors[idx] = `#${newId}`;
            });
          });
      }

      components && Component.checkId(components, styles, list, opts);
    });
  }
}
