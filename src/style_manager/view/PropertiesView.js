import { View } from '../../common';
import { appendAtIndex } from '../../utils/dom';

export default class PropertiesView extends View {
  initialize(o) {
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.properties = [];
    this.parent = o.parent;
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
  }

  addTo(model, coll, opts) {
    this.add(model, null, opts);
  }

  add(model, frag, opts = {}) {
    const { parent, config } = this;
    const appendTo = frag || this.el;
    const view = new model.typeView({ model, config });
    parent && (view.parent = parent);
    view.render();
    const rendered = view.el;
    this.properties.push(view);
    appendAtIndex(appendTo, rendered, opts.at);
  }

  remove() {
    View.prototype.remove.apply(this, arguments);
    this.clearItems();
  }

  clearItems() {
    this.properties.forEach(item => item.remove());
    this.properties = [];
  }

  render() {
    const { $el, pfx } = this;
    this.clearItems();
    const fragment = document.createDocumentFragment();
    this.collection.forEach(model => this.add(model, fragment));
    $el.empty();
    $el.append(fragment);
    $el.attr('class', `${pfx}properties`);
    return this;
  }
}
