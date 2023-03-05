import { View } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { appendAtIndex } from '../../utils/dom';
import { StyleManagerConfig } from '../config/config';
import Sector from '../model/Sector';
import Sectors from '../model/Sectors';
import SectorView from './SectorView';

export default class SectorsView extends View {
  pfx: string;
  ppfx: string;
  config: StyleManagerConfig;
  module: any;

  constructor(
    o: { module?: any; config?: StyleManagerConfig; el?: HTMLElement; em?: EditorModel; collection?: Sectors } = {}
  ) {
    // @ts-ignore
    super(o);
    const { module, config } = o;
    const coll = this.collection;
    this.pfx = config?.stylePrefix || '';
    this.ppfx = config?.pStylePrefix || '';
    this.config = config!;
    this.module = module!;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
  }

  remove() {
    View.prototype.remove.apply(this, arguments as any);
    ['config', 'module', 'em'].forEach(
      i =>
        // @ts-ignore
        (this[i] = {})
    );
    return this;
  }

  addTo(model: Sector, c: any, opts = {}) {
    this.addToCollection(model, null, opts);
  }

  addToCollection(model: Sector, fragmentEl: DocumentFragment | null, opts: { at?: number } = {}) {
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
