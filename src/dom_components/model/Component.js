import {
  isUndefined,
  isArray,
  isEmpty,
  isBoolean,
  has,
  clone,
  isString,
  forEach,
  keys
} from 'underscore';
import { shallowDiff, hasDnd } from 'utils/mixins';
import Styleable from 'domain_abstract/model/Styleable';

const Backbone = require('backbone');
const Components = require('./Components');
const Selector = require('selector_manager/model/Selector');
const Selectors = require('selector_manager/model/Selectors');
const Traits = require('trait_manager/model/Traits');
const componentList = {};
let componentIndex = 0;

const escapeRegExp = str => {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
};

const Component = Backbone.Model.extend(Styleable).extend(
  {
    defaults: {
      // HTML tag of the component
      tagName: 'div',

      // Component type, eg. 'text', 'image', 'video', etc.
      type: '',

      // Name of the component. Will be used, for example, in layers and badges
      name: '',

      // True if the component is removable from the canvas
      removable: true,

      // Indicates if it's possible to drag the component inside others
      // Tip: Indicate an array of selectors where it could be dropped inside
      draggable: true,

      // Indicates if it's possible to drop other components inside
      // Tip: Indicate an array of selectors which could be dropped inside
      droppable: true,

      // Set false if don't want to see the badge (with the name) over the component
      badgable: true,

      // True if it's possible to style it
      // Tip:
      // Indicate an array of CSS properties which is possible to style, eg. ['color', 'width']
      // All other properties will be hidden from the style manager
      stylable: true,

      // Indicate an array of style properties to show up which has been marked as `toRequire`
      'stylable-require': '',

      // Indicate an array of style properties which should be hidden from the style manager
      unstylable: '',

      // Highlightable with 'dotted' style if true
      highlightable: true,

      // True if it's possible to clone the component
      copyable: true,

      // Indicates if it's possible to resize the component (at the moment implemented only on Image Components)
      // It's also possible to pass an object as options for the Resizer
      resizable: false,

      // Allow to edit the content of the component (used on Text components)
      editable: false,

      // Hide the component inside Layers
      layerable: true,

      // Allow component to be selected when clicked
      selectable: true,

      // Shows a highlight outline when hovering on the element if true
      hoverable: true,

      // This property is used by the HTML exporter as void elements do not
      // have closing tag, eg. <br/>, <hr/>, etc.
      void: false,

      // Indicates if the component is in some CSS state like ':hover', ':active', etc.
      state: '',

      // State, eg. 'selected'
      status: '',

      // Content of the component (not escaped) which will be appended before children rendering
      content: '',

      // Component icon, this string will be inserted before the name, eg. '<i class="fa fa-square-o"></i>'
      icon: '',

      // Component related style
      style: '',

      // Key-value object of the component's attributes
      attributes: '',

      // Array of classes
      classes: '',

      // Component's javascript
      script: '',

      // Traits
      traits: ['id', 'title'],

      // Indicates an array of properties which will be inhereted by
      // all NEW appended children
      //
      // If you create a model likes this
      //  removable: false,
      //  draggable: false,
      //  propagate: ['removable', 'draggable']
      // When you append some new component inside, the new added model
      // will get the exact same properties indicated in `propagate` array
      // (as the `propagate` property itself)
      //
      propagate: '',

      /**
       * Set an array of items to show up inside the toolbar (eg. move, clone, delete)
       * when the component is selected
       * toolbar: [{
       *     attributes: {class: 'fa fa-arrows'},
       *     command: 'tlb-move',
       *   },{
       *     attributes: {class: 'fa fa-clone'},
       *     command: 'tlb-clone',
       * }]
       */
      toolbar: null
    },

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
      this.config = opt.config || {};
      this.ccid = Component.createId(this);
      this.set('attributes', this.get('attributes') || {});
      this.on('remove', this.handleRemove);
      this.listenTo(this, 'change:script', this.scriptUpdated);
      this.listenTo(this, 'change:traits', this.traitsUpdated);
      this.listenTo(this, 'change:tagName', this.tagUpdated);
      this.listenTo(this, 'change:attributes', this.attrUpdated);
      this.initClasses();
      this.loadTraits();
      this.initComponents();
      this.initToolbar();
      this.set('status', '');

      // Register global updates for collection properties
      ['classes', 'traits'].forEach(name =>
        this.listenTo(this.get(name), 'add remove change', () =>
          this.emitUpdate(name)
        )
      );
      this.init();
    },

    /**
     * Triggered on model remove
     * @param {Model} removed Removed model
     * @private
     */
    handleRemove(removed) {
      const em = this.em;
      em && em.trigger('component:remove', removed);
    },

    /**
     * Check component's type
     * @param  {string}  type Component type
     * @return {Boolean}
     * @example
     * model.is('image')
     * // -> false
     */
    is(type) {
      return !!(this.get('type') == type);
    },

    /**
     * Find inner models by query string
     * ATTENTION: this method works only with alredy rendered component
     * @param  {string}  query Query string
     * @return {Array} Array of models
     * @example
     * model.find('div > .class');
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
     * Find closest model by query string
     * ATTENTION: this method works only with alredy rendered component
     * @param  {string}  query Query string
     * @return {Component}
     * @example
     * model.closest('div');
     */
    closest(query) {
      const result = this.view.$el.closest(query);
      return result.length && result.data('model');
    },

    /**
     * Once the tag is updated I have to remove the node and replace it
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
     * @return {Array|Component} New added component/s
     * @private
     */
    replaceWith(el) {
      const coll = this.collection;
      const at = coll.indexOf(this);
      coll.remove(this);
      return coll.add(el, { at });
    },

    /**
     * Emit changes for each updated attribute
     */
    attrUpdated() {
      const attrPrev = { ...this.previous('attributes') };
      const attrCurrent = { ...this.get('attributes') };
      const diff = shallowDiff(attrPrev, attrCurrent);
      keys(diff).forEach(pr => this.trigger(`change:attributes:${pr}`));
    },

    /**
     * Update attributes of the model
     * @param {Object} attrs Key value attributes
     * @example
     * model.setAttributes({id: 'test', 'data-key': 'value'});
     */
    setAttributes(attrs) {
      attrs = { ...attrs };

      // Handle classes
      const classes = attrs.class;
      classes && this.setClass(classes);
      delete attrs.class;

      // Handle style
      const style = attrs.style;
      style && this.setStyle(style);
      delete attrs.style;

      this.set('attributes', attrs);
    },

    /**
     * Add attributes to the model
     * @param {Object} attrs Key value attributes
     * @example
     * model.addAttributes({id: 'test'});
     */
    addAttributes(attrs) {
      const newAttrs = { ...this.getAttributes(), ...attrs };
      this.setAttributes(newAttrs);
    },

    getStyle() {
      const em = this.em;

      if (em && em.getConfig('avoidInlineStyle')) {
        const state = this.get('state');
        const cc = em.get('CssComposer');
        const rule = cc.getIdRule(this.getId(), { state });
        this.rule = rule;

        if (rule) {
          return rule.getStyle();
        }
      }

      return Styleable.getStyle.call(this);
    },

    setStyle(prop = {}, opts = {}) {
      const em = this.em;

      if (em && em.getConfig('avoidInlineStyle')) {
        prop = isString(prop) ? this.parseStyle(prop) : prop;
        prop = { ...prop, ...this.get('style') };
        const state = this.get('state');
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
     * Return attributes
     * @return {Object}
     */
    getAttributes() {
      const classes = [];
      const attributes = { ...this.get('attributes') };

      // Add classes
      this.get('classes').each(cls => classes.push(cls.get('name')));
      classes.length && (attributes.class = classes.join(' '));

      // If style is not empty I need an ID attached to the component
      if (!isEmpty(this.getStyle()) && !has(attributes, 'id')) {
        attributes.id = this.getId();
      }

      return attributes;
    },

    /**
     * Add classes
     * @param {Array|string} classes Array or string of classes
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
     * @param {Array|string} classes Array or string of classes
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
     * @param {Array|string} classes Array or string of classes
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

    initClasses() {
      const classes = this.normalizeClasses(this.get('classes') || []);
      this.set('classes', new Selectors(classes));
      return this;
    },

    initComponents() {
      // Have to add components after the init, otherwise the parent
      // is not visible
      const comps = new Components(null, this.opt);
      comps.parent = this;
      !this.opt.avoidChildren && comps.reset(this.get('components'));
      this.set('components', comps);
      return this;
    },

    /**
     * Initialize callback
     */
    init() {},

    /**
     * Add new component children
     * @param  {Component|string} components Component to add
     * @param {Object} [opts={}] Options, same as in `model.add()`(from backbone)
     * @return {Array} Array of appended components
     * @example
     * someModel.get('components').length // -> 0
     * const videoComponent = someModel.append('<video></video><div></div>')[0];
     * // This will add 2 components (`video` and `div`) to your `someModel`
     * someModel.get('components').length // -> 2
     * // You can pass components directly
     * otherModel.append(otherModel2);
     * otherModel.append([otherModel3, otherModel4]);
     */
    append(components, opts = {}) {
      const result = this.components().add(components, opts);
      return isArray(result) ? result : [result];
    },

    /**
     * Set new collection if `components` are provided, otherwise the
     * current collection is returned
     * @param  {Component|string} [components] Components to set
     * @return {Collection|undefined}
     * @example
     * // Get current collection
     * const collection = model.components();
     * // Set new collection
     * model.components('<span></span><div></div>');
     */
    components(components) {
      const coll = this.get('components');

      if (isUndefined(components)) {
        return coll;
      } else {
        coll.reset();
        components && this.append(components);
      }
    },

    /**
     * Get parent model
     * @return {Component}
     */
    parent() {
      const coll = this.collection;
      return coll && coll.parent;
    },

    /**
     * Script updated
     */
    scriptUpdated() {
      this.set('scriptUpdated', 1);
    },

    /**
     * Once traits are updated I have to populates model's attributes
     */
    traitsUpdated() {
      let found = 0;
      const attrs = { ...this.get('attributes') };
      const traits = this.get('traits');

      if (!(traits instanceof Traits)) {
        this.loadTraits();
        return;
      }

      traits.each(trait => {
        found = 1;
        if (!trait.get('changeProp')) {
          const name = trait.get('name');
          const value = trait.getInitValue();
          if (name && value) {
            attrs[name] = value;
          }
        }
      });

      found && this.set('attributes', attrs);
    },

    /**
     * Init toolbar
     */
    initToolbar() {
      var model = this;
      if (!model.get('toolbar')) {
        var tb = [];
        if (model.collection) {
          tb.push({
            attributes: { class: 'fa fa-arrow-up' },
            command: 'select-parent'
          });
        }
        if (model.get('draggable')) {
          tb.push({
            attributes: { class: 'fa fa-arrows', draggable: true },
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
      var trt = new Traits([], this.opt);
      trt.setTarget(this);
      traits = traits || this.get('traits');

      if (traits.length) {
        trt.add(traits);
      }

      this.set('traits', trt, opts);
      return this;
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

      return new this.constructor(
        attr,
        opts
      );
    },

    /**
     * Get the name of the component
     * @return {string}
     * */
    getName() {
      let customName = this.get('name') || this.get('custom-name');
      let tag = this.get('tagName');
      tag = tag == 'div' ? 'box' : tag;
      let name = this.get('type') || tag;
      name = name.charAt(0).toUpperCase() + name.slice(1);
      return customName || name;
    },

    /**
     * Get the icon string
     * @return {string}
     */
    getIcon() {
      let icon = this.get('icon');
      return icon ? icon + ' ' : '';
    },

    /**
     * Return HTML string of the component
     * @param {Object} opts Options
     * @return {string} HTML string
     * @private
     */
    toHTML(opts) {
      const model = this;
      const attrs = [];
      const classes = [];
      const tag = model.get('tagName');
      const sTag = model.get('void');
      const attributes = this.getAttrToHTML();

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
      model.get('components').each(comp => (code += comp.toHTML()));
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

      if (this.em.getConfig('avoidDefaults')) {
        const defaults = this.defaults;

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
     * Return model id
     * @return {string}
     */
    getId() {
      let attrs = this.get('attributes') || {};
      return attrs.id || this.ccid || this.cid;
    },

    /**
     * Get the DOM element of the model. This works only of the
     * model is alredy rendered
     * @return {HTMLElement}
     */
    getEl() {
      return this.view && this.view.el;
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
        return this.attributes[v] || '';
      });

      return scr;
    },

    emitUpdate(property) {
      const em = this.em;
      const event = 'component:update' + (property ? `:${property}` : '');
      em && em.trigger(event, this);
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
     */
    createId(model) {
      componentIndex++;
      // Testing 1000000 components with `+ 2` returns 0 collisions
      const ilen = componentIndex.toString().length + 2;
      const uid = (Math.random() + 1.1).toString(36).slice(-ilen);
      const nextId = 'i' + uid;
      componentList[nextId] = model;
      return nextId;
    },

    getList() {
      return componentList;
    }
  }
);

module.exports = Component;
