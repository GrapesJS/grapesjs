import { View } from '../../common';
import { appendAtIndex } from '../../utils/dom';
import PropertyView from './PropertyView';

export default class PropertiesView extends View {
  config?: any;
  pfx: string;
  properties: PropertyView[];
  parent?: PropertyView;

  constructor(o: any) {
    super(o);
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.properties = [];
    this.parent = o.parent;
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
  }

  addTo(model: any, coll: any, opts: any) {
    this.add(model, null, opts);
  }

  add(model: any, frag: DocumentFragment | null, opts: any = {}) {
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
    View.prototype.remove.apply(this, arguments as any);
    this.clearItems();
    return this;
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
