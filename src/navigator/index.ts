/**
 * You can customize the initial state of the module from the editor initialization
 * ```js
 * const editor = grapesjs.init({
 *  // ...
 *  layerManager: {
 *    // ...
 *  },
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const layers = editor.Layers;
 * ```
 *
 * ## Available Events
 * * `layer:root` - Root layer changed. The new root component is passed as an argument to the callback.
 * * `layer:component` - Component layer is updated. The updated component is passed as an argument to the callback.
 *
 * ## Methods
 * * [setRoot](#setroot)
 * * [getRoot](#getroot)
 * * [getComponents](#getcomponents)
 * * [setOpen](#setopen)
 * * [isOpen](#isopen)
 * * [setVisible](#setvisible)
 * * [isVisible](#isvisible)
 * * [setlocked](#setlocked)
 * * [isLocked](#islocked)
 * * [setName](#setname)
 * * [getName](#getname)
 * * [getLayerData](#getlayerdata)
 *
 * [Page]: page.html
 * [Component]: component.html
 *
 * @module Layers
 */

import { isString, bindAll } from 'underscore';
import { Model } from '../abstract';
import Module from '../abstract/Module';
import Component from '../dom_components/model/Component';
import EditorModel from '../editor/model/Editor';
import { hasWin, isComponent, isDef } from '../utils/mixins';
import defaults from './config/config';
import View from './view/ItemView';

interface LayerData {
  name: string;
  open: boolean;
  selected: boolean;
  hovered: boolean;
  visible: boolean;
  locked: boolean;
  components: Component[];
}

export const evAll = 'layer';
export const evPfx = `${evAll}:`;
export const evRoot = `${evPfx}root`;
export const evComponent = `${evPfx}component`;
export const evCustom = `${evPfx}custom`;

const events = {
  all: evAll,
  root: evRoot,
  component: evComponent,
  custom: evCustom,
};

const styleOpts = { mediaText: '' };

const propsToListen = ['open', 'status', 'locked', 'custom-name', 'components', 'classes']
  .map(p => `component:update:${p}`)
  .join(' ');

const isStyleHidden = (style: any = {}) => {
  return (style.display || '').trim().indexOf('none') === 0;
};

export default class LayerManager extends Module<typeof defaults> {
  model!: Model;

  view?: View;

  events = events;

  constructor(em: EditorModel) {
    super(em, 'LayerManager', defaults);
    bindAll(this, 'componentChanged', '__onRootChange', '__onComponent');
    this.model = new Model(this, { opened: {} });
    // @ts-ignore
    this.config.stylePrefix = this.config.pStylePrefix;
    return this;
  }

  onLoad() {
    const { em, config, model } = this;
    model.listenTo(em, 'component:selected', this.componentChanged);
    model.on('change:root', this.__onRootChange);
    model.listenTo(em, propsToListen, this.__onComponent);
    this.componentChanged();
    model.listenToOnce(em, 'load', () => {
      this.setRoot(config.root);
      this.__appendTo();
    });
  }

  /**
   * Update the root layer with another component.
   * @param {[Component]|String} component Component to be set as root
   * @return {[Component]}
   * @example
   * const component = editor.getSelected();
   * layers.setRoot(component);
   */
  setRoot(component: Component | string): Component {
    const wrapper: Component = this.em.getWrapper();
    let root = isComponent(component) ? (component as Component) : wrapper;

    if (component && isString(component) && hasWin()) {
      root = wrapper.find(component)[0] || wrapper;
    }

    this.model.set('root', root);

    return root;
  }

  /**
   * Get the current root layer.
   * @return {[Component]}
   * @example
   * const layerRoot = layers.getRoot();
   */
  getRoot(): Component {
    return this.model.get('root'); // || this.em.getWrapper();
  }

  /**
   * Get valid layer child components (eg. excludes non layerable components).
   * @param {[Component]} component Component from which you want to get child components
   * @returns {Array<[Component]>}
   * @example
   * const component = editor.getSelected();
   * const components = layers.getComponents(component);
   * console.log(components);
   */
  getComponents(component: Component): Component[] {
    return component.components().filter((cmp: any) => this.__isLayerable(cmp));
  }

  /**
   * Update the layer open state of the component.
   * @param {[Component]} component Component to update
   * @param {Boolean} value
   */
  setOpen(component: Component, value: boolean) {
    component.set('open', value);
  }

  /**
   * Check the layer open state of the component.
   * @param {[Component]} component
   * @returns {Boolean}
   */
  isOpen(component: Component): boolean {
    return !!component.get('open');
  }

  /**
   * Update the layer visibility state of the component.
   * @param {[Component]} component Component to update
   * @param {Boolean} value
   */
  setVisible(component: Component, value: boolean) {
    const prevDspKey = '__prev-display';
    const style: any = component.getStyle(styleOpts);
    const { display } = style;

    if (value) {
      const prevDisplay = component.get(prevDspKey);
      delete style.display;

      if (prevDisplay) {
        style.display = prevDisplay;
        component.unset(prevDspKey);
      }
    } else {
      display && component.set(prevDspKey, display);
      style.display = 'none';
    }

    component.setStyle(style, styleOpts);
    this.updateLayer(component);
    this.em.trigger('component:toggled'); // Updates Style Manager #2938
  }

  /**
   * Check the layer visibility state of the component.
   * @param {[Component]} component
   * @returns {Boolean}
   */
  isVisible(component: Component): boolean {
    return !isStyleHidden(component.getStyle(styleOpts));
  }

  /**
   * Update the layer locked state of the component.
   * @param {[Component]} component Component to update
   * @param {Boolean} value
   */
  setLocked(component: Component, value: boolean) {
    component.set('locked', value);
  }

  /**
   * Check the layer locked state of the component.
   * @param {[Component]} component
   * @returns {Boolean}
   */
  isLocked(component: Component): boolean {
    return component.get('locked');
  }

  /**
   * Update the layer name of the component.
   * @param {[Component]} component Component to update
   * @param {String} value New name
   */
  setName(component: Component, value: string) {
    component.set('custom-name', value);
  }

  /**
   * Get the layer name of the component.
   * @param {[Component]} component
   * @returns {String} Component layer name
   */
  getName(component: Component) {
    return component.getName();
  }

  /**
   * Get layer data from a component.
   * @param {[Component]} component Component from which you want to read layer data.
   * @returns {Object} Object containing the layer data.
   * @example
   * const component = editor.getSelected();
   * const layerData = layers.getLayerData(component);
   * console.log(layerData);
   */
  getLayerData(component: Component): LayerData {
    const status = component.get('status');

    return {
      name: component.getName(),
      open: this.isOpen(component),
      selected: status === 'selected',
      hovered: status === 'hovered', // || this.em.getHovered() === component,
      visible: this.isVisible(component),
      locked: this.isLocked(component),
      components: this.getComponents(component),
    };
  }

  setLayerData(component: Component, data: Partial<Omit<LayerData, 'components'>>, opts = {}) {
    const { em, config } = this;
    const { open, selected, hovered, visible, locked, name } = data;
    const cmpOpts = { fromLayers: true, ...opts };

    if (isDef(open)) {
      this.setOpen(component, open!);
    }
    if (isDef(selected)) {
      if (selected) {
        em.setSelected(component, cmpOpts);
        const scroll = config.scrollCanvas;
        scroll && component.views?.forEach((view: any) => view.scrollIntoView(scroll));
      } else {
        em.removeSelected(component, cmpOpts);
      }
    }
    if (isDef(hovered) && config.showHover) {
      hovered ? em.setHovered(component, cmpOpts) : em.setHovered(null, cmpOpts);
    }
    if (isDef(visible)) {
      visible !== this.isVisible(component) && this.setVisible(component, visible!);
    }
    if (isDef(locked)) {
      this.setLocked(component, locked!);
    }
    if (isDef(name)) {
      this.setName(component, name!);
    }
  }

  /**
   * Triggered when the selected component is changed
   * @private
   */
  componentChanged(sel?: Component, opts = {}) {
    // @ts-ignore
    if (opts.fromLayers) return;
    const { em, config } = this;
    const { scrollLayers } = config;
    const opened = this.model.get('opened');
    const selected = em.getSelected();
    let parent = selected?.parent();

    for (let cid in opened) {
      opened[cid].set('open', false);
      delete opened[cid];
    }

    while (parent) {
      parent.set('open', true);
      opened[parent.cid] = parent;
      parent = parent.parent();
    }

    if (selected && scrollLayers) {
      // @ts-ignore
      const el = selected.viewLayer?.el;
      el?.scrollIntoView(scrollLayers);
    }
  }

  getAll() {
    return this.view;
  }

  render() {
    const { config, model } = this;
    const ItemView = View.extend(config.extend);
    this.view = new ItemView({
      el: this.view?.el,
      ItemView,
      level: 0,
      config,
      opened: model.get('opened'),
      model: this.getRoot(),
      module: this,
    });
    return this.view?.render().el as HTMLElement;
  }

  destroy() {
    this.view?.remove();
  }

  __onRootChange() {
    const root = this.getRoot();
    this.view?.setRoot(root);
    this.em.trigger(evRoot, root);
  }

  __onComponent(component: Component) {
    this.updateLayer(component);
  }

  __isLayerable(cmp: Component): boolean {
    const tag = cmp.get('tagName');
    const hideText = this.config.hideTextnode;
    const isValid = !hideText || (!cmp.is('textnode') && tag !== 'br');

    return isValid && cmp.get('layerable');
  }

  __trgCustom(opts?: any) {
    this.em.trigger(this.events.custom, {
      container: opts.container,
      root: this.getRoot(),
    });
  }

  updateLayer(component: Component, opts?: any) {
    this.em.trigger(evComponent, component, opts);
  }
}
