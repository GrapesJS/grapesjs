/**
 * With this module is possible to manage components inside the canvas. You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/dom_components/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  domComponents: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const domComponents = editor.DomComponents;
 * ```
 *
 * * [getWrapper](#getwrapper)
 * * [getComponents](#getcomponents)
 * * [addComponent](#addcomponent)
 * * [clear](#clear)
 * * [load](#load)
 * * [store](#store)
 * * [addType](#addtype)
 * * [getType](#gettype)
 * * [getTypes](#gettypes)
 * * [render](#render)
 *
 * @module DomComponents
 */
import Backbone from 'backbone';
import { isEmpty, isObject, isArray, result } from 'underscore';
import defaults from './config/config';
import Component from './model/Component';
import Components from './model/Components';
import ComponentView from './view/ComponentView';
import ComponentsView from './view/ComponentsView';
import ComponentTableCell from './model/ComponentTableCell';
import ComponentTableCellView from './view/ComponentTableCellView';
import ComponentTableRow from './model/ComponentTableRow';
import ComponentTableRowView from './view/ComponentTableRowView';
import ComponentTable from './model/ComponentTable';
import ComponentTableView from './view/ComponentTableView';
import ComponentTableHead from './model/ComponentTableHead';
import ComponentTableHeadView from './view/ComponentTableHeadView';
import ComponentTableBody from './model/ComponentTableBody';
import ComponentTableBodyView from './view/ComponentTableBodyView';
import ComponentTableFoot from './model/ComponentTableFoot';
import ComponentTableFootView from './view/ComponentTableFootView';
import ComponentMap from './model/ComponentMap';
import ComponentMapView from './view/ComponentMapView';
import ComponentLink from './model/ComponentLink';
import ComponentLinkView from './view/ComponentLinkView';
import ComponentLabel from './model/ComponentLabel';
import ComponentLabelView from './view/ComponentLabelView';
import ComponentVideo from './model/ComponentVideo';
import ComponentVideoView from './view/ComponentVideoView';
import ComponentImage from './model/ComponentImage';
import ComponentImageView from './view/ComponentImageView';
import ComponentScript from './model/ComponentScript';
import ComponentScriptView from './view/ComponentScriptView';
import ComponentSvg from './model/ComponentSvg';
import ComponentSvgIn from './model/ComponentSvgIn';
import ComponentSvgView from './view/ComponentSvgView';
import ComponentComment from './model/ComponentComment';
import ComponentCommentView from './view/ComponentCommentView';
import ComponentTextNode from './model/ComponentTextNode';
import ComponentTextNodeView from './view/ComponentTextNodeView';
import ComponentText from './model/ComponentText';
import ComponentTextView from './view/ComponentTextView';
import ComponentWrapper from './model/ComponentWrapper';
import ComponentFrame from './model/ComponentFrame';
import ComponentFrameView from './view/ComponentFrameView';

export default () => {
  var c = {};
  let em;
  const componentsById = {};

  var component, componentView;
  var componentTypes = [
    {
      id: 'cell',
      model: ComponentTableCell,
      view: ComponentTableCellView
    },
    {
      id: 'row',
      model: ComponentTableRow,
      view: ComponentTableRowView
    },
    {
      id: 'table',
      model: ComponentTable,
      view: ComponentTableView
    },
    {
      id: 'thead',
      model: ComponentTableHead,
      view: ComponentTableHeadView
    },
    {
      id: 'tbody',
      model: ComponentTableBody,
      view: ComponentTableBodyView
    },
    {
      id: 'tfoot',
      model: ComponentTableFoot,
      view: ComponentTableFootView
    },
    {
      id: 'map',
      model: ComponentMap,
      view: ComponentMapView
    },
    {
      id: 'link',
      model: ComponentLink,
      view: ComponentLinkView
    },
    {
      id: 'label',
      model: ComponentLabel,
      view: ComponentLabelView
    },
    {
      id: 'video',
      model: ComponentVideo,
      view: ComponentVideoView
    },
    {
      id: 'image',
      model: ComponentImage,
      view: ComponentImageView
    },
    {
      id: 'script',
      model: ComponentScript,
      view: ComponentScriptView
    },
    {
      id: 'svg-in',
      model: ComponentSvgIn,
      view: ComponentSvgView
    },
    {
      id: 'svg',
      model: ComponentSvg,
      view: ComponentSvgView
    },
    {
      id: 'iframe',
      model: ComponentFrame,
      view: ComponentFrameView
    },
    {
      id: 'comment',
      model: ComponentComment,
      view: ComponentCommentView
    },
    {
      id: 'textnode',
      model: ComponentTextNode,
      view: ComponentTextNodeView
    },
    {
      id: 'text',
      model: ComponentText,
      view: ComponentTextView
    },
    {
      id: 'wrapper',
      model: ComponentWrapper,
      view: ComponentView
    },
    {
      id: 'default',
      model: Component,
      view: ComponentView
    }
  ];

  return {
    Component,

    Components,

    ComponentsView,

    componentTypes,

    componentsById,

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'DomComponents',

    /**
     * Returns config
     * @return {Object} Config object
     * @private
     */
    getConfig() {
      return c;
    },

    /**
     * Mandatory for the storage manager
     * @type {String}
     * @private
     */
    storageKey() {
      var keys = [];
      var smc = (c.stm && c.stm.getConfig()) || {};
      if (smc.storeHtml) keys.push('html');
      if (smc.storeComponents) keys.push('components');
      return keys;
    },

    /**
     * Initialize module. Called on a new instance of the editor with configurations passed
     * inside 'domComponents' field
     * @param {Object} config Configurations
     * @private
     */
    init(config) {
      c = config || {};
      em = c.em;
      this.em = em;

      if (em) {
        c.components = em.config.components || c.components;
      }

      for (var name in defaults) {
        if (!(name in c)) c[name] = defaults[name];
      }

      var ppfx = c.pStylePrefix;
      if (ppfx) c.stylePrefix = ppfx + c.stylePrefix;

      // Load dependencies
      if (em) {
        c.modal = em.get('Modal') || '';
        c.am = em.get('AssetManager') || '';
        em.get('Parser').compTypes = componentTypes;
        em.on('change:componentHovered', this.componentHovered, this);

        const selected = em.get('selected');
        em.listenTo(selected, 'add', (sel, c, opts) =>
          this.selectAdd(selected.getComponent(sel), opts)
        );
        em.listenTo(selected, 'remove', (sel, c, opts) =>
          this.selectRemove(selected.getComponent(sel), opts)
        );
      }

      if (em.get('hasPages')) {
        c.components = '';
      }

      return this;
    },

    /**
     * On load callback
     * @private
     */
    onLoad() {
      c.components && this.setComponents(c.components, { silent: 1 });
    },

    /**
     * Load components from the passed object, if the object is empty will try to fetch them
     * autonomously from the selected storage
     * The fetched data will be added to the collection
     * @param {Object} data Object of data to load
     * @return {Object} Loaded data
     */
    load(data = '') {
      const { em } = this;
      let result = '';

      if (!data && c.stm) {
        data = c.em.getCacheLoad();
      }

      const { components, html } = data;

      if (components) {
        if (isObject(components) || isArray(components)) {
          result = components;
        } else {
          try {
            result = JSON.parse(components);
          } catch (err) {
            em && em.logError(err);
          }
        }
      } else if (html) {
        result = html;
      }

      const isObj = result && result.constructor === Object;

      if ((result && result.length) || isObj) {
        this.clear();

        // If the result is an object I consider it the wrapper
        if (isObj) {
          this.getWrapper().set(result);
        } else {
          this.getComponents().add(result);
        }
      }

      return result;
    },

    /**
     * Store components on the selected storage
     * @param {Boolean} noStore If true, won't store
     * @return {Object} Data to store
     */
    store(noStore) {
      if (!c.stm || this.em.get('hasPages')) {
        return {};
      }

      var obj = {};
      var keys = this.storageKey();

      if (keys.indexOf('html') >= 0) {
        obj.html = c.em.getHtml();
      }

      if (keys.indexOf('components') >= 0) {
        // const storeWrap = (em && !em.getConfig('avoidInlineStyle')) || c.storeWrapper;
        const storeWrap = c.storeWrapper;
        const toStore = storeWrap ? this.getWrapper() : this.getComponents();
        obj.components = JSON.stringify(toStore);
      }

      if (!noStore) {
        c.stm.store(obj);
      }

      return obj;
    },

    /**
     * Returns privately the main wrapper
     * @return {Object}
     * @private
     */
    getComponent() {
      const sel = this.em.get('PageManager').getSelected();
      const frame = sel && sel.getMainFrame();
      return frame && frame.getComponent();
    },

    /**
     * Returns root component inside the canvas. Something like `<body>` inside HTML page
     * The wrapper doesn't differ from the original Component Model
     * @return {Component} Root Component
     * @example
     * // Change background of the wrapper and set some attribute
     * var wrapper = domComponents.getWrapper();
     * wrapper.set('style', {'background-color': 'red'});
     * wrapper.set('attributes', {'title': 'Hello!'});
     */
    getWrapper() {
      return this.getComponent();
    },

    /**
     * Returns wrapper's children collection. Once you have the collection you can
     * add other Components(Models) inside. Each component can have several nested
     * components inside and you can nest them as more as you wish.
     * @return {Components} Collection of components
     * @example
     * // Let's add some component
     * var wrapperChildren = domComponents.getComponents();
     * var comp1 = wrapperChildren.add({
     *   style: { 'background-color': 'red'}
     * });
     * var comp2 = wrapperChildren.add({
     *   tagName: 'span',
     *   attributes: { title: 'Hello!'}
     * });
     * // Now let's add an other one inside first component
     * // First we have to get the collection inside. Each
     * // component has 'components' property
     * var comp1Children = comp1.get('components');
     * // Procede as before. You could also add multiple objects
     * comp1Children.add([
     *   { style: { 'background-color': 'blue'}},
     *   { style: { height: '100px', width: '100px'}}
     * ]);
     * // Remove comp2
     * wrapperChildren.remove(comp2);
     */
    getComponents() {
      const wrp = this.getWrapper();
      return wrp && wrp.get('components');
    },

    /**
     * Add new components to the wrapper's children. It's the same
     * as 'domComponents.getComponents().add(...)'
     * @param {Object|Component|Array<Object>} component Component/s to add
     * @param {string} [component.tagName='div'] Tag name
     * @param {string} [component.type=''] Type of the component. Available: ''(default), 'text', 'image'
     * @param {boolean} [component.removable=true] If component is removable
     * @param {boolean} [component.draggable=true] If is possible to move the component around the structure
     * @param {boolean} [component.droppable=true] If is possible to drop inside other components
     * @param {boolean} [component.badgable=true] If the badge is visible when the component is selected
     * @param {boolean} [component.stylable=true] If is possible to style component
     * @param {boolean} [component.copyable=true] If is possible to copy&paste the component
     * @param {string} [component.content=''] String inside component
     * @param {Object} [component.style={}] Style object
     * @param {Object} [component.attributes={}] Attribute object
     * @param {Object} opt the options object to be used by the [Components.add]{@link getComponents} method
     * @return {Component|Array<Component>} Component/s added
     * @example
     * // Example of a new component with some extra property
     * var comp1 = domComponents.addComponent({
     *   tagName: 'div',
     *   removable: true, // Can't remove it
     *   draggable: true, // Can't move it
     *   copyable: true, // Disable copy/past
     *   content: 'Content text', // Text inside component
     *   style: { color: 'red'},
     *   attributes: { title: 'here' }
     * });
     */
    addComponent(component, opt = {}) {
      return this.getComponents().add(component, opt);
    },

    /**
     * Render and returns wrapper element with all components inside.
     * Once the wrapper is rendered, and it's what happens when you init the editor,
     * the all new components will be added automatically and property changes are all
     * updated immediately
     * @return {HTMLElement}
     */
    render() {
      return componentView.render().el;
    },

    /**
     * Remove all components
     * @return {this}
     */
    clear(opts = {}) {
      this.getComponents()
        .map(i => i)
        .forEach(i => i.remove(opts));
      return this;
    },

    /**
     * Set components
     * @param {Object|string} components HTML string or components model
     * @param {Object} opt the options object to be used by the {@link addComponent} method
     * @return {this}
     * @private
     */
    setComponents(components, opt = {}) {
      this.clear(opt).addComponent(components, opt);
    },

    /**
     * Add new component type.
     * Read more about this in [Define New Component](https://grapesjs.com/docs/modules/Components.html#define-new-component)
     * @param {string} type Component ID
     * @param {Object} methods Component methods
     * @return {this}
     */
    addType(type, methods) {
      const { em } = this;
      const {
        model = {},
        view = {},
        isComponent,
        extend,
        extendView,
        extendFn = [],
        extendFnView = []
      } = methods;
      const compType = this.getType(type);
      const extendType = this.getType(extend);
      const extendViewType = this.getType(extendView);
      const typeToExtend = extendType
        ? extendType
        : compType
        ? compType
        : this.getType('default');
      const modelToExt = typeToExtend.model;
      const viewToExt = extendViewType
        ? extendViewType.view
        : typeToExtend.view;

      // Function for extending source object methods
      const getExtendedObj = (fns, target, srcToExt) =>
        fns.reduce((res, next) => {
          const fn = target[next];
          const parentFn = srcToExt.prototype[next];
          if (fn && parentFn) {
            res[next] = function(...args) {
              parentFn.bind(this)(...args);
              fn.bind(this)(...args);
            };
          }
          return res;
        }, {});

      // If the model/view is a simple object I need to extend it
      if (typeof model === 'object') {
        methods.model = modelToExt.extend(
          {
            ...model,
            ...getExtendedObj(extendFn, model, modelToExt),
            defaults: {
              ...(result(modelToExt.prototype, 'defaults') || {}),
              ...(result(model, 'defaults') || {})
            }
          },
          {
            isComponent:
              compType && !extendType && !isComponent
                ? modelToExt.isComponent
                : isComponent || (() => 0)
          }
        );
      }

      if (typeof view === 'object') {
        methods.view = viewToExt.extend({
          ...view,
          ...getExtendedObj(extendFnView, view, viewToExt)
        });
      }

      if (compType) {
        compType.model = methods.model;
        compType.view = methods.view;
      } else {
        methods.id = type;
        componentTypes.unshift(methods);
      }

      const event = `component:type:${compType ? 'update' : 'add'}`;
      em && em.trigger(event, compType || methods);

      return this;
    },

    /**
     * Get component type.
     * Read more about this in [Define New Component](https://grapesjs.com/docs/modules/Components.html#define-new-component)
     * @param {string} type Component ID
     * @return {Object} Component type defintion, eg. `{ model: ..., view: ... }`
     */
    getType(type) {
      var df = componentTypes;

      for (var it = 0; it < df.length; it++) {
        var dfId = df[it].id;
        if (dfId == type) {
          return df[it];
        }
      }
      return;
    },

    /**
     * Remove component type
     * @param {string} type Component ID
     * @returns {Object|undefined} Removed component type, undefined otherwise
     */
    removeType(id) {
      const df = componentTypes;
      const type = this.getType(id);
      if (!type) return;
      const index = df.indexOf(type);
      df.splice(index, 1);
      return type;
    },

    /**
     * Return the array of all types
     * @return {Array}
     */
    getTypes() {
      return componentTypes;
    },

    selectAdd(component, opts = {}) {
      if (component) {
        component.set({
          status: 'selected'
        });
        ['component:selected', 'component:toggled'].forEach(event =>
          this.em.trigger(event, component, opts)
        );
      }
    },

    selectRemove(component, opts = {}) {
      if (component) {
        const { em } = this;
        component.set({
          status: '',
          state: ''
        });
        ['component:deselected', 'component:toggled'].forEach(event =>
          this.em.trigger(event, component, opts)
        );
      }
    },

    /**
     * Triggered when the component is hovered
     * @private
     */
    componentHovered() {
      const em = c.em;
      const model = em.get('componentHovered');
      const previous = em.previous('componentHovered');
      const state = 'hovered';

      // Deselect the previous component
      previous &&
        previous.get('status') == state &&
        previous.set({
          status: '',
          state: ''
        });

      model && isEmpty(model.get('status')) && model.set('status', state);
    },

    allById() {
      return componentsById;
    },

    destroy() {
      const all = this.allById();
      Object.keys(all).forEach(id => all[id] && all[id].remove());
      componentView && componentView.remove();
      [c, em, componentsById, component, componentView].forEach(i => (i = {}));
      this.em = {};
    }
  };
};
