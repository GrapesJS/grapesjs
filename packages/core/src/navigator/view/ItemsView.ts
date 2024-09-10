import { isUndefined } from 'underscore';
import { View } from '../../common';
import Component from '../../dom_components/model/Component';
import EditorModel from '../../editor/model/Editor';
import ItemView from './ItemView';
import Components from '../../dom_components/model/Components';
import LayerManager from '..';

export default class ItemsView extends View {
  items: ItemView[];
  opt: any;
  config: any;
  parentView: ItemView;
  module: LayerManager;
  /** @ts-ignore */
  collection!: Components;

  constructor(opt: any = {}) {
    super(opt);
    this.items = [];
    this.opt = opt;
    const config = opt.config || {};
    this.config = config;
    this.module = opt.module;
    this.parentView = opt.parentView;
    const pfx = config.stylePrefix || '';
    const ppfx = config.pStylePrefix || '';
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset resetNavigator', this.render);
    this.listenTo(coll, 'remove', this.removeChildren);
    this.className = `${pfx}layers`;
    const em = config.em as EditorModel;

    if (config.sortable && !this.opt.sorter) {
      const utils = em.Utils;
      this.opt.sorter = new utils.Sorter({
        // @ts-ignore
        container: config.sortContainer || this.el,
        containerSel: `.${this.className}`,
        itemSel: `.${pfx}layer`,
        ignoreViewChildren: 1,
        avoidSelectOnEnd: 1,
        nested: 1,
        ppfx,
        pfx,
        em,
      });
    }

    // For the sorter
    this.$el.data('collection', coll);
    opt.parent && this.$el.data('model', opt.parent);
  }

  removeChildren(removed: Component) {
    const view = removed.viewLayer;
    if (!view) return;
    view.remove();
    delete removed.viewLayer;
  }

  /**
   * Add to collection
   * @param Object Model
   *
   * @return Object
   * */
  addTo(model: Component) {
    this.addToCollection(model, null, this.collection.indexOf(model));
  }

  /**
   * Add new object to collection
   * @param  Object  Model
   * @param  Object   Fragment collection
   * @param  integer  Index of append
   *
   * @return Object Object created
   * */
  addToCollection(model: Component, fragment: DocumentFragment | null, index?: number) {
    const { parentView, opt, config, el } = this;
    const { ItemView, opened, module, level, sorter } = opt;
    const item: ItemView =
      model.viewLayer ||
      new ItemView({
        ItemView,
        level,
        model,
        parentView,
        config,
        sorter,
        opened,
        module,
      });
    const rendered = item.render().el;

    if (fragment) {
      fragment.appendChild(rendered);
    } else {
      const parent = el;
      const children = parent.childNodes;

      if (!isUndefined(index)) {
        const lastIndex = children.length == index;

        // If the added model is the last of collection
        // need to change the logic of append
        if (lastIndex) {
          index--;
        }

        // In case the added is new in the collection index will be -1
        if (lastIndex || !children.length) {
          parent.appendChild(rendered);
        } else {
          parent.insertBefore(rendered, children[index]);
        }
      } else {
        parent.appendChild(rendered);
      }
    }
    this.items.push(item);
    return rendered;
  }

  remove(...args: []) {
    View.prototype.remove.apply(this, args);
    this.items.map((i) => i.remove());
    return this;
  }

  render() {
    const { el, module } = this;
    const frag = document.createDocumentFragment();
    el.innerHTML = '';
    this.collection
      .map((cmp) => module.__getLayerFromComponent(cmp))
      .forEach((model) => this.addToCollection(model, frag));
    el.appendChild(frag);
    el.className = this.className!;
    return this;
  }
}
