import { isFunction } from 'underscore';
import AssetView from './AssetView';
import AssetImage from '../model/AssetImage';
import html from '../../utils/html';

export default class AssetImageView extends AssetView<AssetImage> {
  getPreview() {
    const { pfx, ppfx, model } = this;
    const src = model.get('src');
    return html`
      <div class="${pfx}preview" style="background-image: url('${src}');"></div>
      <div class="${pfx}preview-bg ${ppfx}checker-bg"></div>
    `;
  }

  getInfo() {
    const { pfx, model } = this;
    let name = model.get('name');
    let width = model.get('width');
    let height = model.get('height');
    let unit = model.get('unitDim');
    let dim = width && height ? `${width}x${height}${unit}` : '';
    name = name || model.getFilename();
    return html`
      <div class="${pfx}name">${name}</div>
      <div class="${pfx}dimensions">${dim}</div>
    `;
  }

  // @ts-ignore
  init(o) {
    const pfx = this.pfx;
    this.className += ` ${pfx}asset-image`;
  }

  /**
   * Triggered when the asset is clicked
   * @private
   * */
  onClick() {
    const { model, pfx } = this;
    const { select } = this.__getBhv();
    // @ts-ignore
    const { onClick } = this.config;
    const coll = this.collection;
    coll.trigger('deselectAll');
    this.$el.addClass(pfx + 'highlight');

    if (isFunction(select)) {
      select(model, false);
    } else if (isFunction(onClick)) {
      onClick(model);
    } else {
      // @ts-ignore
      this.updateTarget(coll.target);
    }
  }

  /**
   * Triggered when the asset is double clicked
   * @private
   * */
  onDblClick() {
    const { em, model } = this;
    const { select } = this.__getBhv();
    // @ts-ignore
    const { onDblClick } = this.config;
    // @ts-ignore
    const { target, onSelect } = this.collection;

    if (isFunction(select)) {
      select(model, true);
    } else if (isFunction(onDblClick)) {
      onDblClick(model);
    } else {
      this.updateTarget(target);
      em && em.get('Modal').close();
    }
    isFunction(onSelect) && onSelect(model);
  }

  /**
   * Remove asset from collection
   * @private
   * */
  onRemove(e: Event) {
    e.stopImmediatePropagation();
    this.model.collection.remove(this.model);
  }
}

AssetImageView.prototype.events = {
  // @ts-ignore
  'click [data-toggle=asset-remove]': 'onRemove',
  click: 'onClick',
  dblclick: 'onDblClick',
};
