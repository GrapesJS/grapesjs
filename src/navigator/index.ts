import { Model } from '../abstract';
import Module from '../abstract/Module';
import Component from '../dom_components/model/Component';
import { hasWin } from '../utils/mixins';
import defaults from './config/config';
import View from './view/ItemView';

export default class LayerManager extends Module<typeof defaults> {
    model?: Model;

    view?: View;

    get name(): string {
      return 'LayerManager';
    }

    init() {
      this.__initDefaults(defaults);
      this.componentChanged = this.componentChanged.bind(this);
      const model = new Model(this);
      this.model = model;
      // model.on(chnSel, this._onRootChange);
      // @ts-ignore
      this.config.stylePrefix = this.config.pStylePrefix;
      return this;
    }

    postLoad() {
      const { root } = this.config;
      const rootCmp = root && hasWin() ? root : this.em.getWrapper();
      this.setRoot(rootCmp);
    }

    onLoad() {
      this.model?.listenTo(this.em, 'component:selected', this.componentChanged);
      this.componentChanged();
    }

    postRender() {
      this.__appendTo();
    }

    /**
     * Set new root for layers
     * @param {HTMLElement|Component|String} el Component to be set as the root
     * @return {self}
     */
    setRoot(el: HTMLElement | string) {
      this.view?.setRoot(el);
      return this;
    }

    /**
     * Get the root of layers
     * @return {Component}
     */
    getRoot() {
      return this.view?.model;
    }

    /**
     * Return the view of layers
     * @return {View}
     */
    getAll() {
      return this.view;
    }

    /**
     * Triggered when the selected component is changed
     * @private
     */
    componentChanged(selected?: Component, opts = {}) {
      // @ts-ignore
      if (opts.fromLayers) return;
      const { em, config } = this;
      const opened = em.get('opened');
      const model = em.getSelected();
      const scroll = config.scrollLayers;
      let parent = model && model.collection ? model.collection.parent : null;
      for (let cid in opened) opened[cid].set('open', 0);

      while (parent) {
        parent.set('open', 1);
        opened[parent.cid] = parent;
        parent = parent.collection ? parent.collection.parent : null;
      }

      if (model && scroll) {
        const el = model.viewLayer && model.viewLayer.el;
        el && el.scrollIntoView(scroll);
      }
    }

    render() {
      const { em, config } = this;
      const ItemView = View.extend(config.extend);
      this.view?.remove();
      this.view = new ItemView({
        ItemView,
        level: 0,
        config,
        opened: em.get('opened') || {},
        model: em.getWrapper(),
      });
      return this.view?.render().el as HTMLElement;
    }

    destroy() {
      this.view?.remove();
    }
};
