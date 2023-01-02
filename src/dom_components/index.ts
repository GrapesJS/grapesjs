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
 * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
 *
 * ```js
 * // Listen to events
 * editor.on('component:create', () => { ... });
 *
 * // Use the API
 * const cmp = editor.Components;
 * cmp.addType(...);
 * ```
 *
 * ## Available Events
 * * `component:create` - Component is created (only the model, is not yet mounted in the canvas), called after the init() method
 * * `component:mount` - Component is mounted to an element and rendered in canvas
 * * `component:add` - Triggered when a new component is added to the editor, the model is passed as an argument to the callback
 * * `component:remove` - Triggered when a component is removed, the model is passed as an argument to the callback
 * * `component:remove:before` - Triggered before the remove of the component, the model, remove function (if aborted via options, with this function you can complete the remove) and options (use options.abort = true to prevent remove), are passed as arguments to the callback
 * * `component:clone` - Triggered when a component is cloned, the new model is passed as an argument to the callback
 * * `component:update` - Triggered when a component is updated (moved, styled, etc.), the model is passed as an argument to the callback
 * * `component:update:{propertyName}` - Listen any property change, the model is passed as an argument to the callback
 * * `component:styleUpdate` - Triggered when the style of the component is updated, the model is passed as an argument to the callback
 * * `component:styleUpdate:{propertyName}` - Listen for a specific style property change, the model is passed as an argument to the callback
 * * `component:selected` - New component selected, the selected model is passed as an argument to the callback
 * * `component:deselected` - Component deselected, the deselected model is passed as an argument to the callback
 * * `component:toggled` - Component selection changed, toggled model is passed as an argument to the callback
 * * `component:type:add` - New component type added, the new type is passed as an argument to the callback
 * * `component:type:update` - Component type updated, the updated type is passed as an argument to the callback
 * * `component:drag:start` - Component drag started. Passed an object, to the callback, containing the `target` (component to drag), `parent` (parent of the component) and `index` (component index in the parent)
 * * `component:drag` - During component drag. Passed the same object as in `component:drag:start` event, but in this case, `parent` and `index` are updated by the current pointer
 * * `component:drag:end` - Component drag ended. Passed the same object as in `component:drag:start` event, but in this case, `parent` and `index` are updated by the final pointer
 *
 * ## Methods
 * * [getWrapper](#getwrapper)
 * * [getComponents](#getcomponents)
 * * [addComponent](#addcomponent)
 * * [clear](#clear)
 * * [addType](#addtype)
 * * [getType](#gettype)
 * * [getTypes](#gettypes)
 *
 * * [Component]: component.html
 *
 * @module Components
 */
import { isEmpty, isObject, isArray, isFunction, isString, result, debounce } from 'underscore';
import defaults from './config/config';
import Component, { keyUpdate, keyUpdateInside } from './model/Component';
import Components from './model/Components';
import ComponentView from './view/ComponentView';
import ComponentWrapperView from './view/ComponentWrapperView';
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
import { ItemManagerModule } from '../abstract/Module';
import EditorModel from '../editor/model/Editor';
import { Model } from 'backbone';

// TODO update once components are migrated to TS
type ComponentDefinition = Record<string, any>;

export default class ComponentManager extends ItemManagerModule {
  componentTypes = [
    {
      id: 'cell',
      model: ComponentTableCell,
      view: ComponentTableCellView,
    },
    {
      id: 'row',
      model: ComponentTableRow,
      view: ComponentTableRowView,
    },
    {
      id: 'table',
      model: ComponentTable,
      view: ComponentTableView,
    },
    {
      id: 'thead',
      model: ComponentTableHead,
      view: ComponentTableHeadView,
    },
    {
      id: 'tbody',
      model: ComponentTableBody,
      view: ComponentTableBodyView,
    },
    {
      id: 'tfoot',
      model: ComponentTableFoot,
      view: ComponentTableFootView,
    },
    {
      id: 'map',
      model: ComponentMap,
      view: ComponentMapView,
    },
    {
      id: 'link',
      model: ComponentLink,
      view: ComponentLinkView,
    },
    {
      id: 'label',
      model: ComponentLabel,
      view: ComponentLabelView,
    },
    {
      id: 'video',
      model: ComponentVideo,
      view: ComponentVideoView,
    },
    {
      id: 'image',
      model: ComponentImage,
      view: ComponentImageView,
    },
    {
      id: 'script',
      model: ComponentScript,
      view: ComponentScriptView,
    },
    {
      id: 'svg-in',
      model: ComponentSvgIn,
      view: ComponentSvgView,
    },
    {
      id: 'svg',
      model: ComponentSvg,
      view: ComponentSvgView,
    },
    {
      id: 'iframe',
      model: ComponentFrame,
      view: ComponentFrameView,
    },
    {
      id: 'comment',
      model: ComponentComment,
      view: ComponentCommentView,
    },
    {
      id: 'textnode',
      model: ComponentTextNode,
      view: ComponentTextNodeView,
    },
    {
      id: 'text',
      model: ComponentText,
      view: ComponentTextView,
    },
    {
      id: 'wrapper',
      model: ComponentWrapper,
      view: ComponentWrapperView,
    },
    {
      id: 'default',
      model: Component,
      view: ComponentView,
    },
  ];

  componentsById: { [id: string]: Component } = {};
  componentView?: ComponentWrapperView;

  Component = Component;

  Components = Components;

  ComponentsView = ComponentsView;

  /**
   * Name of the module
   * @type {String}
   * @private
   */
  //name = "DomComponents";

  storageKey = 'components';

  shallow?: Component;

  /**
   * Initialize module. Called on a new instance of the editor with configurations passed
   * inside 'domComponents' field
   * @param {Object} config Configurations
   * @private
   */
  constructor(em: EditorModel) {
    super(em, 'DomComponents', new Components(undefined, { em }));

    if (em) {
      this.config.components = em.config.components || this.config.components;
    }

    for (var name in defaults) {
      //@ts-ignore
      if (!(name in this.config)) this.config[name] = defaults[name];
    }

    var ppfx = this.config.pStylePrefix;
    if (ppfx) this.config.stylePrefix = ppfx + this.config.stylePrefix;

    // Load dependencies
    if (em) {
      this.config.modal = em.get('Modal') || '';
      this.config.am = em.get('AssetManager') || '';
      em.get('Parser').compTypes = this.componentTypes;
      em.on('change:componentHovered', this.componentHovered, this);

      const selected = em.get('selected');
      em.listenTo(selected, 'add', (sel, c, opts) => this.selectAdd(selected.getComponent(sel), opts));
      em.listenTo(selected, 'remove', (sel, c, opts) => this.selectRemove(selected.getComponent(sel), opts));
    }

    return this;
  }

  load(data: any) {
    return this.loadProjectData(data, {
      onResult: (result: Component) => {
        let wrapper = this.getWrapper();

        if (!wrapper) {
          this.em.get('PageManager').add({}, { select: true });
          wrapper = this.getWrapper();
        }

        if (isArray(result)) {
          result.length && wrapper.components(result);
        } else {
          const { components = [], ...rest } = result;
          wrapper.set(rest);
          //@ts-ignore
          wrapper.components(components);
        }
      },
    });
  }

  store() {
    return {};
  }

  /**
   * Returns privately the main wrapper
   * @return {Object}
   * @private
   */
  getComponent(): Component {
    const sel = this.em.get('PageManager').getSelected();
    const frame = sel && sel.getMainFrame();
    return frame && frame.getComponent();
  }

  /**
   * Returns root component inside the canvas. Something like `<body>` inside HTML page
   * The wrapper doesn't differ from the original Component Model
   * @return {[Component]} Root Component
   * @example
   * // Change background of the wrapper and set some attribute
   * var wrapper = cmp.getWrapper();
   * wrapper.set('style', {'background-color': 'red'});
   * wrapper.set('attributes', {'title': 'Hello!'});
   */
  getWrapper() {
    return this.getComponent();
  }

  /**
   * Returns wrapper's children collection. Once you have the collection you can
   * add other Components(Models) inside. Each component can have several nested
   * components inside and you can nest them as more as you wish.
   * @return {Components} Collection of components
   * @example
   * // Let's add some component
   * var wrapperChildren = cmp.getComponents();
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
  getComponents(): Components {
    const wrp = this.getWrapper();
    return wrp && wrp.get('components');
  }

  /**
   * Add new components to the wrapper's children. It's the same
   * as 'cmp.getComponents().add(...)'
   * @param {Object|[Component]|Array<Object>} component Component/s to add
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
   * @return {[Component]|Array<[Component]>} Component/s added
   * @example
   * // Example of a new component with some extra property
   * var comp1 = cmp.addComponent({
   *   tagName: 'div',
   *   removable: true, // Can't remove it
   *   draggable: true, // Can't move it
   *   copyable: true, // Disable copy/past
   *   content: 'Content text', // Text inside component
   *   style: { color: 'red'},
   *   attributes: { title: 'here' }
   * });
   */
  addComponent(component: Component | string | ComponentDefinition, opt = {}) {
    return this.getComponents().add(component, opt);
  }

  /**
   * Render and returns wrapper element with all components inside.
   * Once the wrapper is rendered, and it's what happens when you init the editor,
   * the all new components will be added automatically and property changes are all
   * updated immediately
   * @return {HTMLElement}
   * @private
   */
  render() {
    return this.componentView?.render().el;
  }

  /**
   * Remove all components
   * @return {this}
   */
  clear(opts = {}) {
    const components = this.getComponents();
    //@ts-ignore
    components?.filter(Boolean).forEach(i => i.remove(opts));
    return this;
  }

  /**
   * Set components
   * @param {Object|string} components HTML string or components model
   * @param {Object} opt the options object to be used by the {@link addComponent} method
   * @return {this}
   * @private
   */
  setComponents(components: Component, opt = {}) {
    this.clear(opt).addComponent(components, opt);
  }

  /**
   * Add new component type.
   * Read more about this in [Define New Component](https://grapesjs.com/docs/modules/Components.html#define-new-component)
   * @param {string} type Component ID
   * @param {Object} methods Component methods
   * @return {this}
   */
  addType(type: string, methods: any) {
    const { em } = this;
    const { model = {}, view = {}, isComponent, extend, extendView, extendFn = [], extendFnView = [] } = methods;
    const compType = this.getType(type);
    const extendType = this.getType(extend);
    const extendViewType = this.getType(extendView);
    const typeToExtend = extendType ? extendType : compType ? compType : this.getType('default');
    const modelToExt = typeToExtend.model;
    const viewToExt = extendViewType ? extendViewType.view : typeToExtend.view;

    // Function for extending source object methods
    const getExtendedObj = (fns: any[], target: any, srcToExt: any) =>
      fns.reduce((res, next) => {
        const fn = target[next];
        const parentFn = srcToExt.prototype[next];
        if (fn && parentFn) {
          res[next] = function (...args: any[]) {
            parentFn.bind(this)(...args);
            fn.bind(this)(...args);
          };
        }
        return res;
      }, {});

    // If the model/view is a simple object I need to extend it
    if (typeof model === 'object') {
      const defaults = result(model, 'defaults');
      delete model.defaults;
      methods.model = modelToExt.extend(
        {
          ...model,
          ...getExtendedObj(extendFn, model, modelToExt),
        },
        {
          isComponent: compType && !extendType && !isComponent ? modelToExt.isComponent : isComponent || (() => 0),
        }
      );
      Object.defineProperty(methods.model.prototype, 'defaults', {
        value: {
          ...(result(modelToExt.prototype, 'defaults') || {}),
          ...(defaults || {}),
        },
      });
    }

    if (typeof view === 'object') {
      methods.view = viewToExt.extend({
        ...view,
        ...getExtendedObj(extendFnView, view, viewToExt),
      });
    }

    if (compType) {
      compType.model = methods.model;
      compType.view = methods.view;
    } else {
      methods.id = type;
      this.componentTypes.unshift(methods);
    }

    const event = `component:type:${compType ? 'update' : 'add'}`;
    em?.trigger(event, compType || methods);

    return this;
  }

  /**
   * Get component type.
   * Read more about this in [Define New Component](https://grapesjs.com/docs/modules/Components.html#define-new-component)
   * @param {string} type Component ID
   * @return {Object} Component type definition, eg. `{ model: ..., view: ... }`
   */
  getType(type: 'default'): { id: string; model: any; view: any };
  getType(type: string): { id: string; model: any; view: any } | undefined;
  getType(type: string) {
    var df = this.componentTypes;

    for (var it = 0; it < df.length; it++) {
      var dfId = df[it].id;
      if (dfId == type) {
        return df[it];
      }
    }
    return;
  }

  /**
   * Remove component type
   * @param {string} type Component ID
   * @returns {Object|undefined} Removed component type, undefined otherwise
   */
  removeType(id: string) {
    const df = this.componentTypes;
    const type = this.getType(id);
    if (!type) return;
    const index = df.indexOf(type);
    df.splice(index, 1);
    return type;
  }

  /**
   * Return the array of all types
   * @return {Array}
   */
  getTypes() {
    return this.componentTypes;
  }

  selectAdd(component: Component, opts = {}) {
    if (component) {
      component.set({
        status: 'selected',
      });
      ['component:selected', 'component:toggled'].forEach(event => this.em.trigger(event, component, opts));
    }
  }

  selectRemove(component: Component, opts = {}) {
    if (component) {
      const { em } = this;
      component.set({
        status: '',
        state: '',
      });
      ['component:deselected', 'component:toggled'].forEach(event => this.em.trigger(event, component, opts));
    }
  }

  /**
   * Triggered when the component is hovered
   * @private
   */
  componentHovered() {
    const { em } = this;
    const model = em.get('componentHovered');
    const previous = em.previous('componentHovered');
    const state = 'hovered';

    // Deselect the previous component
    previous &&
      previous.get('status') == state &&
      previous.set({
        status: '',
        state: '',
      });

    model && isEmpty(model.get('status')) && model.set('status', state);
  }

  getShallowWrapper() {
    let { shallow, em } = this;

    if (!shallow && em) {
      const shallowEm = em.shallow;
      if (!shallowEm) return;
      const domc = shallowEm.get('DomComponents');
      domc.componentTypes = this.componentTypes;
      shallow = domc.getWrapper();
      if (shallow) {
        const events = [keyUpdate, keyUpdateInside].join(' ');
        shallow.on(
          events,
          debounce(() => shallow?.components(''), 100)
        );
      }
      this.shallow = shallow;
    }

    return shallow;
  }

  /**
   * Check if the component can be moved inside another.
   * @param {[Component]} target The target Component is the one that is supposed to receive the source one.
   * @param {[Component]|String} source The source can be another Component or an HTML string.
   * @param {Number} [index] Index position. If not specified, the check will perform against appending the source to target.
   * @returns {Object} Object containing the `result` (Boolean), `source`, `target` (as Components), and a `reason` (Number) with these meanings:
   * * `0` - Invalid source. This is a default value and should be ignored in case the `result` is true.
   * * `1` - Source doesn't accept target as destination.
   * * `2` - Target doesn't accept source.
   * @private
   */
  canMove(target: Component, source?: Component, index?: number) {
    const at = index || index === 0 ? index : null;
    const result = {
      result: false,
      reason: 0,
      target,
      source: null,
    };

    if (!source || !target) return result;

    //@ts-ignore
    let srcModel = source.toHTML ? source : null;

    if (!srcModel) {
      const wrapper = this.getShallowWrapper();
      srcModel = wrapper?.append(source)[0];
    }

    //@ts-ignore
    result.source = srcModel;

    if (!srcModel) return result;

    // Check if the source is draggable in the target
    let draggable = srcModel.get('draggable');

    if (isFunction(draggable)) {
      draggable = !!draggable(srcModel, target, at);
    } else {
      const el = target.getEl();
      draggable = isArray(draggable) ? draggable.join(',') : draggable;
      draggable = isString(draggable) ? el?.matches(draggable) : draggable;
    }

    if (!draggable) return { ...result, reason: 1 };

    // Check if the target accepts the source
    let droppable = target.get('droppable');

    if (isFunction(droppable)) {
      droppable = !!droppable(srcModel, target, at);
    } else {
      if (droppable === false && target.isInstanceOf('text') && srcModel.get('textable')) {
        droppable = true;
      } else {
        const el = srcModel.getEl();
        droppable = isArray(droppable) ? droppable.join(',') : droppable;
        droppable = isString(droppable) ? el?.matches(droppable) : droppable;
      }
    }

    // Ensure the target is not inside the source
    const isTargetInside = [target].concat(target.parents()).indexOf(srcModel) > -1;

    if (!droppable || isTargetInside) return { ...result, reason: 2 };

    return { ...result, result: true };
  }

  allById() {
    return this.componentsById;
  }

  getById(id: string) {
    return this.componentsById[id] || null;
  }

  destroy() {
    const all = this.allById();
    Object.keys(all).forEach(id => all[id] && all[id].remove());
    this.componentView?.remove();
    [this.em, this.componentsById, this.componentView].forEach(i => (i = {}));
  }
}
