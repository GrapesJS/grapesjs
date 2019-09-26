import { isFunction } from 'underscore';
import AssetView from './AssetView';

export default AssetView.extend({
  events: {
    'click [data-toggle=asset-remove]': 'onRemove',
    click: 'onClick',
    dblclick: 'onDblClick'
  },

  getPreview() {
    const pfx = this.pfx;
    const src = this.model.get('src');
    return `
      <div class="${pfx}preview" style="background-image: url('${src}');"></div>
      <div class="${pfx}preview-bg ${this.ppfx}checker-bg"></div>
    `;
  },

  getInfo() {
    const pfx = this.pfx;
    const model = this.model;
    let name = model.get('name');
    let width = model.get('width');
    let height = model.get('height');
    let unit = model.get('unitDim');
    let dim = width && height ? `${width}x${height}${unit}` : '';
    name = name || model.getFilename();
    return `
      <div class="${pfx}name">${name}</div>
      <div class="${pfx}dimensions">${dim}</div>
    `;
  },

  init(o) {
    const pfx = this.pfx;
    this.className += ` ${pfx}asset-image`;
  },

  /**
   * Triggered when the asset is clicked
   * @private
   * */
  onClick() {
    var onClick = this.config.onClick;
    var model = this.model;
    this.collection.trigger('deselectAll');
    this.$el.addClass(this.pfx + 'highlight');

    if (isFunction(onClick)) {
      onClick(model);
    } else {
      this.updateTarget(this.collection.target);
    }
  },

  /**
   * Triggered when the asset is double clicked
   * @private
   * */
  onDblClick() {
    const { em, model } = this;
    const onDblClick = this.config.onDblClick;

    if (isFunction(onDblClick)) {
      onDblClick(model);
    } else {
      this.updateTarget(this.collection.target);
      em && em.get('Modal').close();
    }

    var onSelect = this.collection.onSelect;
    isFunction(onSelect) && onSelect(model);
  },

  /**
   * Remove asset from collection
   * @private
   * */
  onRemove(e) {
    e.stopImmediatePropagation();
    this.model.collection.remove(this.model);
  }
});
