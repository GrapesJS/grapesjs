import { View } from '../../common';
import { appendAtIndex } from '../../utils/dom';
import SectorView from './SectorView';

export default class SectorsView extends View {
  initialize(o = {}) {
    const { module, config = {} } = o;
    const coll = this.collection;
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.config = config;
    this.module = module;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
  }

  remove() {
    View.prototype.remove.apply(this, arguments);
    ['config', 'module', 'em'].forEach(i => (this[i] = {}));
  }

  addTo(model, c, opts = {}) {
    this.addToCollection(model, null, opts);
  }

  addToCollection(model, fragmentEl, opts = {}) {
    const { config, el } = this;
    const appendTo = fragmentEl || el;
    const rendered = new SectorView({ model, config }).render().el;
    appendAtIndex(appendTo, rendered, opts.at);

    return rendered;
  }

  render() {
    const { $el, pfx, ppfx } = this;
    $el.empty();
    const frag = document.createDocumentFragment();
    this.collection.each(model => this.addToCollection(model, frag));
    $el.append(frag);
    $el.addClass(`${pfx}sectors ${ppfx}one-bg ${ppfx}two-color`);
    return this;
  }
}
