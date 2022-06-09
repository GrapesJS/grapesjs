import { View } from '../../common';
import Component, { eventDrag } from '../../dom_components/model/Component';
import ItemView from './ItemView';

export default class ItemsView extends View {
  items: ItemView[];
  opt: any;
  config: any;
  parentView: ItemView;

  constructor(opt: any = {}) {
    super(opt);
    this.items = [];
    this.opt = opt;
    const config = opt.config || {};
    this.config = config;
    this.parentView = opt.parentView;
    const pfx = config.stylePrefix || '';
    const ppfx = config.pStylePrefix || '';
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset resetNavigator', this.render);
    this.listenTo(coll, 'remove', this.removeChildren);
    this.className = `${pfx}layers`;
    const em = config.em;

    if (config.sortable && !this.opt.sorter) {
      const utils = em.get('Utils');
      this.opt.sorter = new utils.Sorter({
        container: config.sortContainer || this.el,
        containerSel: `.${this.className}`,
        itemSel: `.${pfx}layer`,
        ignoreViewChildren: 1,
        onEndMove(created: any, sorter: any, data: any) {
          const srcModel = sorter.getSourceModel();
          em.setSelected(srcModel, { forceChange: 1 });
          em.trigger(`${eventDrag}:end`, data);
        },
        avoidSelectOnEnd: 1,
        nested: 1,
        ppfx,
        pfx,
      });
    }

    // For the sorter
    this.$el.data('collection', coll);
    opt.parent && this.$el.data('model', opt.parent);
  }

  removeChildren(removed: Component) {
    // @ts-ignore
    const view = removed.viewLayer;
    if (!view) return;
    view.remove();
    // @ts-ignore
    delete removed.viewLayer;
  }

  /**
   * Add to collection
   * @param Object Model
   *
   * @return Object
   * */
  addTo(model: Component) {
    var i = this.collection.indexOf(model);
    this.addToCollection(model, null, i);
  }

  /**
   * Add new object to collection
   * @param  Object  Model
   * @param  Object   Fragment collection
   * @param  integer  Index of append
   *
   * @return Object Object created
   * */
  addToCollection(model: Component, fragmentEl: DocumentFragment | null, index?: number) {
    const { parentView, opt, config } = this;
    const { ItemView, opened, module, level, sorter } = opt;
    const fragment = fragmentEl || null;
    const item = new ItemView({
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
      if (typeof index !== 'undefined') {
        var method = 'before';
        // If the added model is the last of collection
        // need to change the logic of append
        if (this.$el.children().length == index) {
          index--;
          method = 'after';
        }
        // In case the added is new in the collection index will be -1
        if (index < 0) {
          this.$el.append(rendered);
        } else {
          // @ts-ignore
          this.$el.children().eq(index)[method](rendered);
        }
      } else this.$el.append(rendered);
    }
    this.items.push(item);
    return rendered;
  }

  remove(...args: []) {
    View.prototype.remove.apply(this, args);
    this.items.map(i => i.remove());
    return this;
  }

  render() {
    const frag = document.createDocumentFragment();
    const el = this.el;
    el.innerHTML = '';
    this.collection.each(model => this.addToCollection(model, frag));
    el.appendChild(frag);
    el.className = this.className!;
    return this;
  }
}
