import { View } from '../../common';
import Asset from '../model/Asset';
import Assets from '../model/Assets';
import { AssetManagerConfig } from '../config/config';
import { clone } from 'underscore';
import EditorModel from '../../editor/model/Editor';

export type AssetViewProps = Backbone.ViewOptions<Asset> & {
  collection: Assets;
  config: AssetManagerConfig;
};

export default class AssetView<TModel extends Asset = Asset> extends View<TModel> {
  pfx: string;
  ppfx: string;
  options: AssetViewProps;
  config: AssetManagerConfig;
  em: EditorModel;
  init?: (opt: AssetViewProps) => void;

  constructor(opt: AssetViewProps) {
    super(opt as any);
    this.options = opt;
    this.collection = opt.collection;
    const config = opt.config || {};
    this.config = config;
    this.pfx = config.stylePrefix || '';
    // @ts-ignore
    this.ppfx = config.pStylePrefix || '';
    // @ts-ignore
    this.em = config.em;
    this.className = this.pfx + 'asset';
    this.listenTo(this.model, 'destroy remove', this.remove);
    // @ts-ignore
    this.model.view = this;
    const init = this.init && this.init.bind(this);
    init && init(opt);
  }

  __getBhv() {
    const { em } = this;
    const am = em && em.get('AssetManager');
    return (am && am.__getBehaviour()) || {};
  }

  template(view: AssetView, asset: Asset) {
    const { pfx } = this;
    return `
      <div class="${pfx}preview-cont">
        ${this.getPreview()}
      </div>
      <div class="${pfx}meta">
        ${this.getInfo()}
      </div>
      <div class="${pfx}close" data-toggle="asset-remove">
        &Cross;
      </div>
    `;
  }

  /**
   * Update target if exists
   * @param {Model} target
   * @private
   * */
  updateTarget(target: any) {
    if (target && target.set) {
      target.set('attributes', clone(target.get('attributes')));
      target.set('src', this.model.get('src'));
    }
  }

  getPreview() {
    return '';
  }

  getInfo() {
    return '';
  }

  render() {
    const el = this.el;
    el.innerHTML = this.template(this, this.model);
    el.className = this.className!;
    return this;
  }
}
