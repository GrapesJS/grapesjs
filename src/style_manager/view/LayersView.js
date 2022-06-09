import { View } from '../../common';
import LayerView from './LayerView';

export default class LayersView extends View {
  initialize(o) {
    const coll = this.collection;
    const config = o.config || {};
    const em = config.em;
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

    // For the Sorter
    const utils = em ? em.get('Utils') : '';
    this.sorter = utils
      ? new utils.Sorter({
          container: this.el,
          ignoreViewChildren: 1,
          containerSel: `.${pfx}layers`,
          itemSel: `.${pfx}layer`,
          pfx: config.pStylePrefix,
        })
      : '';
    coll.view = this;
    this.$el.data('model', coll);
    this.$el.data('collection', coll);
  }

  addTo(model) {
    const i = this.collection.indexOf(model);
    this.addToCollection(model, null, i);
  }

  addToCollection(model, fragmentEl, index) {
    const fragment = fragmentEl || null;
    const { propertyView, config, sorter, $el } = this;
    const view = new LayerView({ model, config, sorter, propertyView });
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
          $el.children().eq(index)[method](rendered);
        }
      } else {
        $el.append(rendered);
      }
    }

    return rendered;
  }

  reset(coll, opts) {
    this.clearItems(opts);
    this.render();
  }

  remove() {
    this.clearItems();
    View.prototype.remove.apply(this, arguments);
  }

  clearItems() {
    this.items.forEach(item => item.remove());
    this.items = [];
  }

  render() {
    const { $el, sorter } = this;
    const frag = document.createDocumentFragment();
    $el.empty();
    this.collection.forEach(m => this.addToCollection(m, frag));
    $el.append(frag);
    $el.attr('class', this.className);
    if (sorter) sorter.plh = null;

    return this;
  }
}
