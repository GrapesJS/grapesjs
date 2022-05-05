import { isString, bindAll } from 'underscore';
import { Model } from '../abstract';
import Module from '../abstract/Module';
import Component from '../dom_components/model/Component';
import { hasWin, isComponent, isDef } from '../utils/mixins';
import defaults from './config/config';
import View from './view/ItemView';

interface LayerData {
  name: string,
  open: boolean,
  selected: boolean,
  hovered: boolean,
  visible: boolean,
  locked: boolean,
  components: Component[],
}

export const evAll = 'layer';
export const evPfx = `${evAll}:`;
export const evRoot = `${evPfx}root`;
export const evComponent = `${evPfx}component`;

const events = {
  all: evAll,
  root: evRoot,
  component: evComponent,
};

const styleOpts = { mediaText: '' };

const propsToListen = ['open', 'status', 'locked', 'custom-name', 'components', 'classes']
  .map(p => `component:update:${p}`).join(' ');

const isStyleHidden = (style: any = {}) => {
  return (style.display || '').trim().indexOf('none') === 0;
};

export default class LayerManager extends Module<typeof defaults> {
    model!: Model;

    view?: View;

    events = events;

    get name(): string {
      return 'LayerManager';
    }

    init() {
      this.__initDefaults(defaults);
      bindAll(this, 'componentChanged', '__onRootChange', '__onComponent');
      this.model = new Model(this, { opened: {} });
      // @ts-ignore
      this.config.stylePrefix = this.config.pStylePrefix;
      return this;
    }

    onLoad() {
      const { em, config, model } = this;
      model.listenTo(em, 'component:selected', this.componentChanged);
      model.listenToOnce(em, 'load', () => this.setRoot(config.root));
      model.on('change:root', this.__onRootChange);
      model.listenTo(em, propsToListen, this.__onComponent);
      this.componentChanged();
    }

    postRender() {
      this.__appendTo();
    }

    /**
     * Set new root for layers
     * @param {Component|string} component Component to be set as the root
     * @return {Component}
     */
    setRoot(component: Component | string): Component {
      const wrapper: Component = this.em.getWrapper();
      let root = isComponent(component) ? component as Component : wrapper;

      if (component && isString(component) && hasWin()) {
        root = wrapper.find(component)[0] || wrapper;
      }

      this.model.set('root', root);

      return root;
    }

    /**
     * Get the root of layers
     * @return {Component}
     */
    getRoot() {
      return this.model.get('root');
    }

    getLayerData(component: any): LayerData {
      const status = component.get('status');

      return {
        name: component.getName(),
        open: this.isOpen(component),
        selected: status === 'selected',
        hovered: status === 'hovered', // || this.em.getHovered() === component,
        visible: this.isVisible(component),
        locked: this.isLocked(component),
        components: this.getComponents(component),
      }
    }

    setLayerData(component: any, data: Partial<Omit<LayerData, 'components'>>, opts = {}) {
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
          scroll && component.views.forEach((view: any) => view.scrollIntoView(scroll));
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

    getComponents(component: any): Component[] {
      return component.components().filter((cmp: any) => this.__isLayerable(cmp));
    }

    setOpen(component: any, value: boolean) {
      component.set('open', value);
    }

    isOpen(component: any): boolean {
      return !!component.get('open');
    }

    /**
     * Update component visibility
     * */
    setVisible(component: any, value: boolean) {
      const prevDspKey = '__prev-display';
      const style = component.getStyle(styleOpts);
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
     * Check if the component is visible
     * */
    isVisible(component: any): boolean {
      return !isStyleHidden(component.getStyle(styleOpts));
    }

    /**
     * Update component locked value
     * */
    setLocked(component: any, value: boolean) {
      component.set('locked', value);
    }

    /**
     * Check if the component is locked
     * */
    isLocked(component: any): boolean {
      return component.get('locked');
    }

    /**
     * Update component name
     * */
    setName(component: any, value: string) {
      component.set('custom-name', value);
    }

    /**
     * Return the view of layers
     * @return {View}
     * @private
     */
    getAll() {
      return this.view;
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

    __onComponent(component: any) {
      this.updateLayer(component);
    }

    __isLayerable(cmp: any): boolean {
      const tag = cmp.get('tagName');
      const hideText = this.config.hideTextnode;
      const isValid = !hideText || (!cmp.is('textnode') && tag !== 'br');

      return isValid && cmp.get('layerable');
    }

    updateLayer(component: any, opts?: any) {
      this.em.trigger(evComponent, component, opts);
    }
};
