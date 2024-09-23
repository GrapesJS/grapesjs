import { View } from '../../common';
import EditorModel from '../../editor/model/Editor';
import StyleManagerSorter from '../../utils/sorter/StyleManagerSorter';
import { DragDirection } from '../../utils/sorter/types';
import Layer from '../model/Layer';
import Layers from '../model/Layers';
import LayerView from './LayerView';
import PropertyStackView from './PropertyStackView';

export default class LayersView extends View<Layer> {
  pfx: string;
  ppfx: string;
  config: any;
  propertyView: PropertyStackView;
  items: LayerView[];
  sorter: StyleManagerSorter;

  constructor(o: any) {
    super(o);
    const coll = this.collection;
    const config = o.config || {};
    const em = config.em as EditorModel;
    const pfx = config.stylePrefix || '';
    const ppfx = config.pStylePrefix || '';
    this.config = config;
    this.pfx = pfx;
    this.ppfx = ppfx;
    this.propertyView = o.propertyView;
    this.className = `${pfx}layers ${ppfx}field`;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.reset);
    this.items = [];
    const placeholderElement = this.createPlaceholder(config.pStylePrefix);
    this.$el.append(placeholderElement);

    // For the Sorter
    const utils = em?.Utils;
    this.sorter = new utils.StyleManagerSorter({
      em,
      containerContext: {
        container: this.el,
        containerSel: `.${pfx}layers`,
        itemSel: `.${pfx}layer`,
        pfx: config.pStylePrefix,
        document,
        placeholderElement: placeholderElement,
      },
      dragBehavior: {
        dragDirection: DragDirection.Vertical,
        nested: false,
      },
    });
    // @ts-ignore
    coll.view = this;
    this.$el.data('model', coll);
    this.$el.data('collection', coll);
  }

  addTo(model: Layer) {
    const i = this.collection.indexOf(model);
    this.addToCollection(model, null, i);
  }

  addToCollection(model: Layer, fragmentEl: DocumentFragment | null, index?: number) {
    const fragment = fragmentEl || null;
    const { propertyView, config, sorter, $el } = this;
    const view = new LayerView({
      model,
      // @ts-ignore
      config,
      sorter,
      propertyView,
    });
    const rendered = view.render().el;
    this.items.push(view);

    if (fragment) {
      fragment.appendChild(rendered);
    } else {
      if (typeof index != 'undefined') {
        let method = 'before';

        if ($el.children().length === index) {
          index--;
          method = 'after';
        }

        if (index < 0) {
          $el.append(rendered);
        } else {
          // @ts-ignore
          $el.children().eq(index)[method](rendered);
        }
      } else {
        $el.append(rendered);
      }
    }

    return rendered;
  }

  reset(coll: any, opts: any) {
    this.clearItems();
    this.render();
  }

  remove() {
    this.clearItems();
    View.prototype.remove.apply(this, arguments as any);
    return this;
  }

  clearItems() {
    this.items.forEach((item) => item.remove());
    this.items = [];
  }

  render() {
    const { $el } = this;
    const frag = document.createDocumentFragment();
    $el.empty();
    this.collection.forEach((m) => this.addToCollection(m, frag));
    $el.append(frag);
    $el.attr('class', this.className!);

    return this;
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
}
