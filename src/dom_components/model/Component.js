import {
  isUndefined,
  isFunction,
  isObject,
  isArray,
  isEmpty,
  isBoolean,
  has,
  isString,
  forEach,
  result,
  keys
} from 'underscore';
import { shallowDiff, capitalize } from 'utils/mixins';
import Styleable from 'domain_abstract/model/Styleable';
import Backbone from 'backbone';
import Components from './Components';
import Selector from 'selector_manager/model/Selector';
import Selectors from 'selector_manager/model/Selectors';
import Traits from 'trait_manager/model/Traits';

const componentList = {};
let componentIndex = 0;

const escapeRegExp = str => {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
};

const avoidInline = em => em && em.getConfig('avoidInlineStyle');

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
 * @typedef Component
 * @property {String} [type=''] Component type, eg. `text`, `image`, `video`, etc.
 * @property {String} [tagName='div'] HTML tag of the component, eg. `span`. Default: `div`
 * @property {Object} [attributes={}] Key-value object of the component's attributes, eg. `{ title: 'Hello' }` Default: `{}`
 * @property {String} [name=''] Name of the component. Will be used, for example, in Layers and badges
 * @property {Boolean} [removable=true] When `true` the component is removable from the canvas, default: `true`
 * @property {Boolean|String} [draggable=true] Indicates if it's possible to drag the component inside others.
 *  You can also specify a query string to indentify elements,
 *  eg. `'.some-class[title=Hello], [data-gjs-type=column]'` means you can drag the component only inside elements
 *  containing `some-class` class and `Hello` title, and `column` components. Default: `true`
 * @property {Boolean|String} [droppable=true] Indicates if it's possible to drop other components inside. You can use
 * a query string as with `draggable`. Default: `true`
 * @property {Boolean} [badgable=true] Set to false if you don't want to see the badge (with the name) over the component. Default: `true`
 * @property {Boolean|Array<String>} [stylable=true] True if it's possible to style the component.
 * You can also indicate an array of CSS properties which is possible to style, eg. `['color', 'width']`, all other properties
 * will be hidden from the style manager. Default: `true`
 * @property {Array<String>} [stylable-require=[]] Indicate an array of style properties to show up which has been marked as `toRequire`. Default: `[]`
 * @property {Array<String>} [unstylable=[]] Indicate an array of style properties which should be hidden from the style manager. Default: `[]`
 * @property {Array<String>} [style-signature=''] This option comes handy when you need to remove or export strictly component-specific rules. Be default, if this option is not empty, the editor will remove rules when there are no components, of that type, in the canvas. Eg. '['.navbar', '[navbar-']'. Default: `''`
 * @property {Boolean} [highlightable=true] It can be highlighted with 'dotted' borders if true. Default: `true`
 * @property {Boolean} [copyable=true] True if it's possible to clone the component. Default: `true`
 * @property {Boolean} [resizable=false] Indicates if it's possible to resize the component. It's also possible to pass an object as [options for the Resizer](https://github.com/artf/grapesjs/blob/master/src/utils/Resizer.js). Default: `false`
 * @property {Boolean} [editable=false] Allow to edit the content of the component (used on Text components). Default: `false`
 * @property {Boolean} [layerable=true] Set to `false` if you need to hide the component inside Layers. Default: `true`
 * @property {Boolean} [selectable=true] Allow component to be selected when clicked. Default: `true`
 * @property {Boolean} [hoverable=true] Shows a highlight outline when hovering on the element if `true`. Default: `true`
 * @property {Boolean} [void=false] This property is used by the HTML exporter as void elements don't have closing tags, eg. `<br/>`, `<hr/>`, etc. Default: `false`
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
 * By default, when `toolbar` property is falsy the editor will add automatically commands like `move`, `delete`, etc. based on its properties.
 * @property {Collection<Component>} [components=null] Children components. Default: `null`
 */
const Component = Backbone.Model.extend(Styleable).extend(
  {
    defaults: {
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
      style: '', // Component related style
      classes: '', // Array of classes
      script: '',
      'script-export': '',
      attributes: '',
      traits: ['id', 'title'],
      propagate: '',
      dmode: '',
      toolbar: null
    },

    /**
     * Hook method, called once the model is created
     */
    init() {},

    /**
     * Hook method, called when the model has been updated (eg. updated some model's property)
     * @param {String} property Property name, if triggered after some property update
     * @param {*} value Property value, if triggered after some property update
     * @param {*} previous Property previous value, if triggered after some property update
     */
    updated(property, value, previous) {},

    /**
     * Hook method, called once the model has been removed
     */
    removed() {},

    initialize(props = {}, opt = {}) {
      const em = opt.em;

      // Propagate properties from parent if indicated
      const parent = this.parent();
      const parentAttr = parent && parent.attributes;

      if (parentAttr && parentAttr.propagate) {
        let newAttr = {};
        const toPropagate = parentAttr.propagate;
        toPropagate.forEach(prop => (newAttr[prop] = parent.get(prop)));
        newAttr.propagate = toPropagate;
        newAttr = { ...newAttr, ...props };
        this.set(newAttr);
      }

      const propagate = this.get('propagate');
      propagate &&
        this.set('propagate', isArray(propagate) ? propagate : [propagate]);

      // Check void elements
      if (
        opt &&
        opt.config &&
        opt.config.voidElements.indexOf(this.get('tagName')) >= 0
      ) {
        this.set('void', true);
      }

      opt.em = em;
      this.opt = opt;
      this.em = em;
      this.frame = opt.frame;
      this.config = opt.config || {};
      this.set('attributes', {
        ...(this.defaults.attributes || {}),
        ...(this.get('attributes') || {})
      });
      this.ccid = Component.createId(this);
      this.initClasses();
      this.initTraits();
      this.initComponents();
      this.initToolbar();
      this.listenTo(this, 'change:script', this.scriptUpdated);
      this.listenTo(this, 'change:tagName', this.tagUpdated);
      this.listenTo(this, 'change:attributes', this.attrUpdated);
      this.listenTo(this, 'change:attributes:id', this._idUpdated);
      this.set('status', '');
      this.views = [];

      // Register global updates for collection properties
      ['classes', 'traits', 'components'].forEach(name => {
        const events = `add remove ${name !== 'components' ? 'change' : ''}`;
        this.listenTo(this.get(name), events.trim(), (...args) =>
          this.emitUpdate(name, ...args)
        );
      });

      if (!opt.temporary) {
        this.init();
        em && em.trigger('component:create', this);
      }
    },

    /**
     * Check component's type
     * @param  {string}  type Component type
     * @return {Boolean}
     * @example
     * component.is('image')
     * // -> false
     */
    is(type) {
      return !!(this.get('type') == type);
    },

    /**
     * Return all the propeties
     * @returns {Object}
     */
    props() {
      return this.attributes;
    },

    /**
     * Get the index of the component in the parent collection.
     * @return {Number}
     */
    index() {
      const { collection } = this;
      return collection && collection.indexOf(this);
    },

    /**
     * Change the drag mode of the component.
     * To get more about this feature read: https://github.com/artf/grapesjs/issues/1936
     * @param {String} value Drag mode, options: 'absolute' | 'translate'
     * @returns {this}
     */
    setDragMode(value) {
      return this.set('dmode', value);
    },

    /**
     * Find inner components by query string.
     * **ATTENTION**: this method works only with already rendered component
     * @param  {String} query Query string
     * @return {Array} Array of components
     * @example
     * component.find('div > .class');
     * // -> [Component, Component, ...]
     */
    find(query) {
      const result = [];

      this.view.$el.find(query).each((el, i, $els) => {
        const $el = $els.eq(i);
        const model = $el.data('model');
        model && result.push(model);
      });

      return result;
    },

    /**
     * Find all inner components by component id.
     * The advantage of this method over `find` is that you can use it
     * also before rendering the component
     * @param {String} id Component id
     * @returns {Array<Component>}
     * @example
     * const allImages = component.findType('image');
     * console.log(allImages[0]) // prints the first found component
     */
    findType(id) {
      const result = [];
      const find = components =>
        components.forEach(item => {
          item.is(id) && result.push(item);
          find(item.components());
        });
      find(this.components());
      return result;
    },

    /**
     * Find the closest parent component by query string.
     * **ATTENTION**: this method works only with already rendered component
     * @param  {string} query Query string
     * @return {Component}
     * @example
     * component.closest('div.some-class');
     * // -> Component
     */
    closest(query) {
      const result = this.view.$el.closest(query);
      return result.length && result.data('model');
    },

    /**
     * Once the tag is updated I have to remove the node and replace it
     * @private
     */
    tagUpdated() {
      const coll = this.collection;
      const at = coll.indexOf(this);
      coll.remove(this);
      coll.add(this, { at });
    },

    /**
     * Replace a component with another one
     * @param {String|Component} el Component or HTML string
     * @return {Component|Array<Component>} New added component/s
     * @example
     * component.replaceWith('<div>Some new content</div>');
     * // -> Component
     */
    replaceWith(el) {
      const coll = this.collection;
      const at = coll.indexOf(this);
      coll.remove(this);
      return coll.add(el, { at });
    },

    /**
     * Emit changes for each updated attribute
     * @private
     */
    attrUpdated(m, v, opts = {}) {
      const attrs = this.get('attributes');

      // Handle classes
      const classes = attrs.class;
      classes && this.setClass(classes);
      delete attrs.class;

      // Handle style
      const style = attrs.style;
      style && this.setStyle(style);
      delete attrs.style;

      const attrPrev = { ...this.previous('attributes') };
      const diff = shallowDiff(attrPrev, this.get('attributes'));
      keys(diff).forEach(pr =>
        this.trigger(`change:attributes:${pr}`, this, diff[pr], opts)
      );
    },

    /**
     * Update attributes of the component
     * @param {Object} attrs Key value attributes
     * @return {this}
     * @example
     * component.setAttributes({ id: 'test', 'data-key': 'value' });
     */
    setAttributes(attrs, opts = {}) {
      this.set('attributes', { ...attrs }, opts);
      return this;
    },

    /**
     * Add attributes to the component
     * @param {Object} attrs Key value attributes
     * @return {this}
     * @example
     * component.addAttributes({ 'data-key': 'value' });
     */
    addAttributes(attrs) {
      const newAttrs = { ...this.getAttributes(), ...attrs };
      this.setAttributes(newAttrs);

      return this;
    },

    /**
     * Get the style of the component
     * @return {Object}
     */
    getStyle() {
      const em = this.em;

      if (em && em.getConfig('avoidInlineStyle')) {
        const state = em.get('state');
        const cc = em.get('CssComposer');
        const rule = cc.getIdRule(this.getId(), { state });
        this.rule = rule;

        if (rule) {
          return rule.getStyle();
        }
      }

      return Styleable.getStyle.call(this);
    },

    /**
     * Set the style on the component
     * @param {Object} prop Key value style object
     * @return {Object}
     * @example
     * component.setStyle({ color: 'red' });
     */
    setStyle(prop = {}, opts = {}) {
      const em = this.em;
      const { opt } = this;

      if (em && em.getConfig('avoidInlineStyle') && !opt.temporary) {
        const style = this.get('style') || {};
        prop = isString(prop) ? this.parseStyle(prop) : prop;
        prop = { ...prop, ...style };
        const state = em.get('state');
        const cc = em.get('CssComposer');
        const propOrig = this.getStyle();
        this.rule = cc.setIdRule(this.getId(), prop, { ...opts, state });
        const diff = shallowDiff(propOrig, prop);
        this.set('style', {}, { silent: 1 });
        keys(diff).forEach(pr => this.trigger(`change:style:${pr}`));
      } else {
        prop = Styleable.setStyle.apply(this, arguments);
      }

      return prop;
    },

    /**
     * Return all component's attributes
     * @return {Object}
     */
    getAttributes() {
      const { em } = this;
      const classes = [];
      const attributes = { ...this.get('attributes') };
      const sm = em && em.get('SelectorManager');
      const id = this.getId();

      // Add classes
      this.get('classes').forEach(cls =>
        classes.push(isString(cls) ? cls : cls.get('name'))
      );
      classes.length && (attributes.class = classes.join(' '));

      // Check if we need an ID on the component
      if (!has(attributes, 'id')) {
        let hasStyle;

        // If we don't rely on inline styling we have to check
        // for the ID selector
        if (avoidInline(em)) {
          hasStyle = sm && sm.get(id, sm.Selector.TYPE_ID);
        } else if (!isEmpty(this.getStyle())) {
          hasStyle = 1;
        }

        if (hasStyle) {
          attributes.id = this.getId();
        }
      }

      return attributes;
    },

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
    addClass(classes) {
      const added = this.em.get('SelectorManager').addClass(classes);
      return this.get('classes').add(added);
    },

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
    setClass(classes) {
      this.get('classes').reset();
      return this.addClass(classes);
    },

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
    removeClass(classes) {
      const removed = [];
      classes = isArray(classes) ? classes : [classes];
      const selectors = this.get('classes');
      const type = Selector.TYPE_CLASS;

      classes.forEach(classe => {
        const classes = classe.split(' ');
        classes.forEach(name => {
          const selector = selectors.where({ name, type })[0];
          selector && removed.push(selectors.remove(selector));
        });
      });

      return removed;
    },

    /**
     * Returns component's classes as an array of strings
     * @return {Array}
     */
    getClasses() {
      const attr = this.getAttributes();
      const classStr = attr.class;
      return classStr ? classStr.split(' ') : [];
    },

    initClasses() {
      const event = 'change:classes';
      const toListen = [this, event, this.initClasses];
      const cls = this.get('classes') || [];
      const clsArr = isString(cls) ? cls.split(' ') : cls;
      this.stopListening(...toListen);
      const classes = this.normalizeClasses(clsArr);
      const selectors = new Selectors([]);
      this.set('classes', selectors);
      selectors.add(classes);
      this.listenTo(...toListen);
      return this;
    },

    initComponents() {
      const event = 'change:components';
      const toListen = [this, event, this.initComponents];
      this.stopListening(...toListen);
      // Have to add components after the init, otherwise the parent
      // is not visible
      const comps = new Components(null, this.opt);
      comps.parent = this;
      const components = this.get('components');
      const addChild = !this.opt.avoidChildren;
      this.set('components', comps);
      addChild &&
        comps.add(isFunction(components) ? components(this) : components);
      this.listenTo(...toListen);
      return this;
    },

    initTraits(changed) {
      const { em } = this;
      const event = 'change:traits';
      const toListen = [this, event, this.initTraits];
      this.stopListening(...toListen);
      this.loadTraits();
      const attrs = { ...this.get('attributes') };
      const traits = this.get('traits');
      traits.each(trait => {
        if (!trait.get('changeProp')) {
          const name = trait.get('name');
          const value = trait.getInitValue();
          if (name && value) attrs[name] = value;
        }
      });
      traits.length && this.set('attributes', attrs);
      this.listenTo(...toListen);
      changed && em && em.trigger('component:toggled');
      return this;
    },

    /**
     * Add new component children
     * @param  {Component|String} components Component to add
     * @param {Object} [opts={}] Options, same as in `model.add()`(from backbone)
     * @return {Array} Array of appended components
     * @example
     * someComponent.get('components').length // -> 0
     * const videoComponent = someComponent.append('<video></video><div></div>')[0];
     * // This will add 2 components (`video` and `div`) to your `someComponent`
     * someComponent.get('components').length // -> 2
     * // You can pass components directly
     * otherComponent.append(otherComponent2);
     * otherComponent.append([otherComponent3, otherComponent4]);
     */
    append(components, opts = {}) {
      const result = this.components().add(components, opts);
      return isArray(result) ? result : [result];
    },

    /**
     * Set new collection if `components` are provided, otherwise the
     * current collection is returned
     * @param  {Component|String} [components] Components to set
     * @return {Collection|Array<Component>}
     * @example
     * // Set new collection
     * component.components('<span></span><div></div>');
     * // Get current collection
     * const collection = component.components();
     * console.log(collection.length);
     * // -> 2
     */
    components(components) {
      const coll = this.get('components');

      if (isUndefined(components)) {
        return coll;
      } else {
        coll.reset();
        return components && this.append(components);
      }
    },

    /**
     * Get the parent component, if exists
     * @return {Component}
     * @example
     * component.parent();
     * // -> Component
     */
    parent() {
      const coll = this.collection;
      return coll && coll.parent;
    },

    /**
     * Script updated
     * @private
     */
    scriptUpdated() {
      this.set('scriptUpdated', 1);
    },

    /**
     * Init toolbar
     * @private
     */
    initToolbar() {
      const { em } = this;
      const model = this;
      const ppfx = (em && em.getConfig('stylePrefix')) || '';

      if (!model.get('toolbar')) {
        var tb = [];
        if (model.collection) {
          tb.push({
            attributes: { class: 'fa fa-arrow-up' },
            command: ed => ed.runCommand('core:component-exit', { force: 1 })
          });
        }
        if (model.get('draggable')) {
          tb.push({
            attributes: {
              class: `fa fa-arrows ${ppfx}no-touch-actions`,
              draggable: true
            },
            //events: hasDnd(this.em) ? { dragstart: 'execCommand' } : '',
            command: 'tlb-move'
          });
        }
        if (model.get('copyable')) {
          tb.push({
            attributes: { class: 'fa fa-clone' },
            command: 'tlb-clone'
          });
        }
        if (model.get('removable')) {
          tb.push({
            attributes: { class: 'fa fa-trash-o' },
            command: 'tlb-delete'
          });
        }
        model.set('toolbar', tb);
      }
    },

    /**
     * Load traits
     * @param  {Array} traits
     * @private
     */
    loadTraits(traits, opts = {}) {
      traits = traits || this.get('traits');
      traits = isFunction(traits) ? traits(this) : traits;

      if (!(traits instanceof Traits)) {
        const trt = new Traits([], this.opt);
        trt.setTarget(this);

        if (traits.length) {
          traits.forEach(tr => tr.attributes && delete tr.attributes.value);
          trt.add(traits);
        }

        this.set('traits', trt, opts);
      }

      return this;
    },

    /**
     * Get the trait by id/name
     * @param  {String} id The `id` or `name` of the trait
     * @return {Trait} Trait model
     * @example
     * const traitTitle = component.getTrait('title');
     * traitTitle && traitTitle.set('label', 'New label');
     */
    getTrait(id) {
      return this.get('traits').filter(trait => {
        return trait.get('id') === id || trait.get('name') === id;
      })[0];
    },

    /**
     * Update a trait
     * @param  {String} id The `id` or `name` of the trait
     * @param  {Object} props Object with the props to update
     * @return {this}
     * @example
     * component.updateTrait('title', {
     *  type: 'select',
     *  options: [ 'Option 1', 'Option 2' ],
     * });
     */
    updateTrait(id, props) {
      const { em } = this;
      const trait = this.getTrait(id);
      trait && trait.set(props);
      em && em.trigger('component:toggled');
      return this;
    },

    /**
     * Get the trait position index by id/name. Useful in case you want to
     * replace some trait, at runtime, with something else.
     * @param  {String} id The `id` or `name` of the trait
     * @return {Number} Index position of the current trait
     * @example
     * const traitTitle = component.getTraitIndex('title');
     * console.log(traitTitle); // 1
     */
    getTraitIndex(id) {
      const trait = this.getTrait(id);
      return trait ? this.get('traits').indexOf(trait) : trait;
    },

    /**
     * Remove trait/s by id/s.
     * @param  {String|Array<String>} id The `id`/`name` of the trait (or an array)
     * @return {Array} Array of removed traits
     * @example
     * component.removeTrait('title');
     * component.removeTrait(['title', 'id']);
     */
    removeTrait(id) {
      const { em } = this;
      const ids = isArray(id) ? id : [id];
      const toRemove = ids.map(id => this.getTrait(id));
      const removed = this.get('traits').remove(toRemove);
      em && em.trigger('component:toggled');
      return removed;
    },

    /**
     * Add trait/s by id/s.
     * @param  {String|Object|Array<String|Object>} trait Trait to add (or an array of traits)
     * @param  {Options} opts Options for the add
     * @return {Array} Array of added traits
     * @example
     * component.addTrait('title', { at: 1 }); // Add title trait (`at` option is the position index)
     * component.addTrait({
     *  type: 'checkbox',
     *  name: 'disabled',
     * });
     * component.addTrait(['title', {...}, ...]);
     */
    addTrait(trait, opts = {}) {
      const { em } = this;
      const added = this.get('traits').add(trait, opts);
      em && em.trigger('component:toggled');
      return added;
    },

    /**
     * Normalize input classes from array to array of objects
     * @param {Array} arr
     * @return {Array}
     * @private
     */
    normalizeClasses(arr) {
      var res = [];
      const em = this.em;

      if (!em) return;

      var clm = em.get('SelectorManager');
      if (!clm) return;

      arr.forEach(val => {
        var name = '';

        if (typeof val === 'string') name = val;
        else name = val.name;

        var model = clm.add(name);
        res.push(model);
      });
      return res;
    },

    /**
     * Override original clone method
     * @private
     */
    clone() {
      const em = this.em;
      const style = this.getStyle();
      const attr = { ...this.attributes };
      const opts = { ...this.opt };
      attr.attributes = { ...attr.attributes };
      delete attr.attributes.id;
      attr.components = [];
      attr.classes = [];
      attr.traits = [];

      this.get('components').each((md, i) => {
        attr.components[i] = md.clone();
      });
      this.get('traits').each((md, i) => {
        attr.traits[i] = md.clone();
      });
      this.get('classes').each((md, i) => {
        attr.classes[i] = md.get('name');
      });

      attr.status = '';
      attr.view = '';
      opts.collection = null;

      if (em && em.getConfig('avoidInlineStyle') && !isEmpty(style)) {
        attr.style = style;
      }

      const cloned = new this.constructor(attr, opts);
      const event = 'component:clone';
      em && em.trigger(event, cloned);
      this.trigger(event, cloned);

      return cloned;
    },

    /**
     * Get the name of the component
     * @return {String}
     * */
    getName() {
      const { em } = this;
      const { type, tagName } = this.attributes;
      const cName = this.get('name');
      const isDiv = tagName == 'div';
      const tag = isDiv ? 'box' : tagName;
      const defName = type || tag;
      const nameTag = !type && tagName && !isDiv && tagName;
      const i18nPfx = 'domComponents.names.';
      const i18nName = cName && em && em.t(`${i18nPfx}${cName}`);
      const i18nNameTag = nameTag && em && em.t(`${i18nPfx}${nameTag}`);
      const i18nDefName =
        em && (em.t(`${i18nPfx}${type}`) || em.t(`${i18nPfx}${tagName}`));
      return (
        this.get('custom-name') || // Used in Layers (when the user changes the name)
        i18nName ||
        cName || // Component name (check if there is a i18n string for it)
        i18nNameTag ||
        capitalize(nameTag) || // Try name by tag if there is no valid type
        i18nDefName ||
        capitalize(defName) // Use the default name
      );
    },

    /**
     * Get the icon string
     * @return {String}
     */
    getIcon() {
      let icon = this.get('icon');
      return icon ? icon + ' ' : '';
    },

    /**
     * Return HTML string of the component
     * @param {Object} [opts={}] Options
     * @param {String} [opts.tag] Custom tagName
     * @param {Object|Function} [opts.attributes=null] You can pass an object of custom attributes to replace
     * with the current one or you can even pass a function to generate attributes dynamically
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
    toHTML(opts = {}) {
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

      for (let attr in attributes) {
        const val = attributes[attr];
        const value = isString(val) ? val.replace(/"/g, '&quot;') : val;

        if (!isUndefined(value)) {
          if (isBoolean(value)) {
            value && attrs.push(attr);
          } else {
            attrs.push(`${attr}="${value}"`);
          }
        }
      }

      let attrString = attrs.length ? ` ${attrs.join(' ')}` : '';
      let code = `<${tag}${attrString}${sTag ? '/' : ''}>${model.get(
        'content'
      )}`;
      model.get('components').each(comp => (code += comp.toHTML(opts)));
      !sTag && (code += `</${tag}>`);

      return code;
    },

    /**
     * Returns object of attributes for HTML
     * @return {Object}
     * @private
     */
    getAttrToHTML() {
      var attr = this.getAttributes();
      delete attr.style;
      return attr;
    },

    /**
     * Return a shallow copy of the model's attributes for JSON
     * stringification.
     * @return {Object}
     * @private
     */
    toJSON(...args) {
      const obj = Backbone.Model.prototype.toJSON.apply(this, args);
      obj.attributes = this.getAttributes();
      delete obj.attributes.class;
      delete obj.toolbar;
      delete obj.traits;

      if (this.em.getConfig('avoidDefaults')) {
        const defaults = result(this, 'defaults');

        forEach(defaults, (value, key) => {
          if (['type', 'content'].indexOf(key) === -1 && obj[key] === value) {
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
          if (isEmpty(defaults[prop]) && !obj[prop].length) {
            delete obj[prop];
          }
        });
      }

      return obj;
    },

    /**
     * Return the component id
     * @return {String}
     */
    getId() {
      let attrs = this.get('attributes') || {};
      return attrs.id || this.ccid || this.cid;
    },

    /**
     * Set new id on the component
     * @param {String} id
     * @return {this}
     */
    setId(id, opts) {
      const attrs = { ...this.get('attributes') };
      attrs.id = id;
      this.set('attributes', attrs, opts);
      return this;
    },

    /**
     * Get the DOM element of the component.
     * This works only if the component is already rendered
     * @param {Frame} frame Specific frame from which taking the element
     * @return {HTMLElement}
     */
    getEl(frame) {
      const view = this.getView(frame);
      return view && view.el;
    },

    /**
     * Get the View of the component.
     * This works only if the component is already rendered
     * @param {Frame} frame Get View of a specific frame
     * @return {ComponentView}
     */
    getView(frame) {
      let { view, views } = this;

      if (frame) {
        view = views.filter(view => view._getFrame() === frame.view)[0];
      }

      return view;
    },

    getCurrentView() {
      const frame = (this.em.get('currentFrame') || {}).model;
      return this.getView(frame);
    },

    /**
     * Return script in string format, cleans 'function() {..' from scripts
     * if it's a function
     * @param {string|Function} script
     * @return {string}
     * @private
     */
    getScriptString(script) {
      var scr = script || this.get('script');

      if (!scr) {
        return scr;
      }

      // Need to convert script functions to strings
      if (typeof scr == 'function') {
        var scrStr = scr.toString().trim();
        scrStr = scrStr
          .replace(/^function[\s\w]*\(\)\s?\{/, '')
          .replace(/\}$/, '');
        scr = scrStr.trim();
      }

      var config = this.em.getConfig();
      var tagVarStart = escapeRegExp(config.tagVarStart || '{[ ');
      var tagVarEnd = escapeRegExp(config.tagVarEnd || ' ]}');
      var reg = new RegExp(`${tagVarStart}([\\w\\d-]*)${tagVarEnd}`, 'g');
      scr = scr.replace(reg, (match, v) => {
        // If at least one match is found I have to track this change for a
        // better optimization inside JS generator
        this.scriptUpdated();
        const result = this.attributes[v] || '';
        return isArray(result) || typeof result == 'object'
          ? JSON.stringify(result)
          : result;
      });

      return scr;
    },

    emitUpdate(property, ...args) {
      const em = this.em;
      const event = 'component:update' + (property ? `:${property}` : '');
      property &&
        this.updated(
          property,
          property && this.get(property),
          property && this.previous(property),
          ...args
        );
      this.trigger(event, ...args);
      em && em.trigger(event, this, ...args);
    },

    /**
     * Execute callback function on itself and all inner components
     * @param  {Function} clb Callback function, the model is passed as an argument
     * @return {this}
     * @example
     * component.onAll(component => {
     *  // do something with component
     * })
     */
    onAll(clb) {
      if (isFunction(clb)) {
        clb(this);
        this.components().forEach(model => model.onAll(clb));
      }
      return this;
    },

    /**
     * Remove the component
     * @return {this}
     */
    remove() {
      const coll = this.collection;
      return coll && coll.remove(this);
    },

    /**
     * Reset id of the component and any of its style rule
     * @param {Object} [opts={}] Options
     * @return {this}
     * @private
     */
    resetId(opts = {}) {
      const { em } = this;
      const oldId = this.getId();
      if (!oldId) return;
      const newId = Component.createId(this);
      this.setId(newId);
      const rule = em && em.get('CssComposer').getIdRule(oldId);
      const selector = rule && rule.get('selectors').at(0);
      selector && selector.set('name', newId);
      return this;
    },

    _getStyleRule({ id } = {}) {
      const { em } = this;
      const idS = id || this.getId();
      return em && em.get('CssComposer').getIdRule(idS);
    },

    _getStyleSelector(opts) {
      const rule = this._getStyleRule(opts);
      return rule && rule.get('selectors').at(0);
    },

    _idUpdated(m, v, opts = {}) {
      if (opts.idUpdate) return;

      const { ccid } = this;
      const { id } = this.get('attributes') || {};
      const idPrev = (this.previous('attributes') || {}).id || ccid;
      const list = Component.getList(this);

      // If the ID already exists I need to rollback to the old one
      if (list[id]) {
        return this.setId(idPrev, { idUpdate: 1 });
      }

      // Remove the old ID reference and add the new one
      delete list[idPrev];
      list[id] = this;
      this.ccid = id;

      // Update the style selector name
      const selector = this._getStyleSelector({ id: idPrev });
      selector && selector.set({ name: id, label: id });
    }
  },
  {
    /**
     * Detect if the passed element is a valid component.
     * In case the element is valid an object abstracted
     * from the element will be returned
     * @param {HTMLElement}
     * @return {Object}
     * @private
     */
    isComponent(el) {
      return { tagName: el.tagName ? el.tagName.toLowerCase() : '' };
    },

    /**
     * Relying simply on the number of components becomes a problem when you
     * store and load them back, you might hit collisions with new components
     * @param  {Model} model
     * @return {string}
     * @private
     */
    createId(model) {
      const list = Component.getList(model);
      let { id } = model.get('attributes');
      let nextId;

      if (id) {
        nextId = Component.getIncrementId(id, list);
        model.setId(nextId);
      } else {
        nextId = Component.getNewId(list);
      }

      list[nextId] = model;
      return nextId;
    },

    getNewId(list) {
      const count = Object.keys(list).length;
      // Testing 1000000 components with `+ 2` returns 0 collisions
      const ilen = count.toString().length + 2;
      const uid = (Math.random() + 1.1).toString(36).slice(-ilen);
      let newId = `i${uid}`;

      while (list[newId]) {
        newId = Component.getNewId(list);
      }

      return newId;
    },

    getIncrementId(id, list) {
      let counter = 1;
      let newId = id;

      while (list[newId]) {
        counter++;
        newId = `${id}-${counter}`;
      }

      return newId;
    },

    /**
     * The list of components is taken from the Components module.
     * Initially, the list, was set statically on the Component object but it was
     * not ok, as it was shared between multiple editor instances
     */
    getList(model) {
      const domc = model.opt && model.opt.domc;
      return domc ? domc.componentsById : {};
    },

    /**
     * This method checks, for each parsed component and style object
     * (are not Components/CSSRules yet), for duplicated id and fixes them
     * This method is used in Components.js just after the parsing
     */
    checkId(components, styles = [], list = {}) {
      const comps = isArray(components) ? components : [components];
      comps.forEach(comp => {
        const { attributes = {}, components } = comp;
        const { id } = attributes;

        // Check if we have collisions with current components
        if (id && list[id]) {
          const newId = Component.getIncrementId(id, list);
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

        components && Component.checkId(components, styles, list);
      });
    }
  }
);

export default Component;
