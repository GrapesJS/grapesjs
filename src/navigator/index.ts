import { isString } from 'underscore';
import { Model } from '../abstract';
import Module from '../abstract/Module';
import Component from '../dom_components/model/Component';
import { hasWin, isComponent, isDef } from '../utils/mixins';
import defaults from './config/config';
import View from './view/ItemView';

interface LayerData {
  open: boolean,
  selected: boolean,
  hovered: boolean,
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

export default class LayerManager extends Module<typeof defaults> {
    model?: Model;

    view?: View;

    events = events;

    get name(): string {
      return 'LayerManager';
    }

    init() {
      this.__initDefaults(defaults);
      this.componentChanged = this.componentChanged.bind(this);
      this.__onRootChange = this.__onRootChange.bind(this);
      this.__onComponent = this.__onComponent.bind(this);
      this.model = new Model(this, { opened: {} });
      // @ts-ignore
      this.config.stylePrefix = this.config.pStylePrefix;
      return this;
    }

    onLoad() {
      const { em, config, model } = this;
      model!.listenTo(em, 'component:selected', this.componentChanged);
      model!.listenToOnce(em, 'load', () => this.setRoot(config.root));
      model!.on('change:root', this.__onRootChange);
      model!.listenTo(em, 'component:update:open component:update:status', this.__onComponent);
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

      this.model!.set('root', root);

      return root;
    }

    /**
     * Get the root of layers
     * @return {Component}
     */
    getRoot() {
      return this.model!.get('root');
    }

    getLayerData(component: any): LayerData {
      const status = component.get('status');

      return {
        open: !!component.get('open'),
        selected: status === 'selected',
        hovered: status === 'hovered', // || this.em.getHovered() === component,
        components: this.getComponents(component),
      }
    }

    setLayerData(component: any, data: Partial<Omit<LayerData, 'components'>>, opts = {}) {
      const { em } = this;
      const { open, selected, hovered } = data;

      if (isDef(open)) {
        component.set('open', open);
      }
      if (isDef(selected)) {
        selected ? em.setSelected(component, opts) : em.removeSelected(component);
      }
      if (isDef(hovered)) {
        hovered ? em.setHovered(component) : em.setHovered(null);
      }
    }

    getComponents(component: any): Component[] {
      return component.components().filter((cmp: any) => {
        const tag = cmp.get('tagName');
        const hideText = this.config.hideTextnode;
        const isValid = !hideText || (!cmp.is('textnode') && tag !== 'br');

        return isValid && cmp.get('layerable');
      });
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
      const opened = this.model!.get('opened');
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
        opened: model!.get('opened'),
        model: this.getRoot(),
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

    updateLayer(component: any, opts?: any) {
      this.em.trigger(evComponent, component, opts);
    }
};
