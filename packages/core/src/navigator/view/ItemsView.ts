import { isUndefined } from 'underscore';
import { View } from '../../common';
import Component from '../../dom_components/model/Component';
import EditorModel from '../../editor/model/Editor';
import ItemView from './ItemView';
import Components from '../../dom_components/model/Components';
import LayerManager from '..';
import { DragDirection } from '../../utils/sorter/types';
import LayersComponentNode from '../../utils/sorter/LayersComponentNode';
import ComponentSorter from '../../utils/sorter/ComponentSorter';

export default class ItemsView extends View {
  items: ItemView[];
  opt: {
    sorter: ComponentSorter<LayersComponentNode>;
    [k: string]: any;
  };
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
      const container = config.sortContainer || this.el;
      const placeholderElement = this.createPlaceholder(pfx);
      this.opt.sorter = new utils.ComponentSorter({
        em,
        treeClass: LayersComponentNode,
        containerContext: {
          container: container,
          containerSel: `.${this.className}`,
          itemSel: `.${pfx}layer`,
          pfx: config.pStylePrefix,
          document: document,
          placeholderElement: placeholderElement,
        },
        dragBehavior: {
          dragDirection: DragDirection.Vertical,
          nested: true,
        },
      });
    }

    // For the sorter
    this.$el.data('collection', coll);
    opt.parent && this.$el.data('model', opt.parent);
  }

  /**
   * Create placeholder
   * @return {HTMLElement}
   */
  private createPlaceholder(pfx: string) {
    const el = document.createElement('div');
    const ins = document.createElement('div');
    this.el.parentNode;
    el.className = pfx + 'placeholder';
    el.style.display = 'none';
    el.style.pointerEvents = 'none';
    ins.className = pfx + 'placeholder-int';
    el.appendChild(ins);

    return el;
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
