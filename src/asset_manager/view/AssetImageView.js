module.exports = require('./AssetView').extend({

  events: {
    click: 'handleClick',
    dblclick: 'handleDblClick',
    'click [data-toggle=asset-remove]': 'removeItem',
  },

  template(view, model) {
    const pfx = view.pfx;
    const ppfx = view.ppfx;
    let name = model.get('name');
    let width = model.get('width');
    let height = model.get('height');
    let unit = model.get('unitDim');
    let dim = width && height ? `${width}x${height}${unit}` : '';
    name = name || model.getFilename();
    return `
      <div id="${pfx}preview-cont">
        <div id="${pfx}preview" style="background-image: url(${model.get('src')});"></div>
        <div id="${pfx}preview-bg" class="${ppfx}checker-bg"></div>
      </div>
      <div id="${pfx}meta">
        <div id="${pfx}name">${name}</div>
        <div id="${pfx}dimensions">${dim}</div>
      </div>
      <div id="${pfx}close" data-toggle="asset-remove">&Cross;</div>
      <div style="clear:both"></div>
    `;
  },

  init(o) {
    const pfx = this.pfx;
    this.className  += ` ${pfx}asset-image`;
  },

  /**
   * Trigger when the asset is clicked
   * @private
   * */
  handleClick() {
    var onClick = this.config.onClick;
    var model = this.model;
    this.collection.trigger('deselectAll');
    this.$el.addClass(this.pfx + 'highlight');

    if (typeof onClick === 'function') {
      onClick(model);
    } else {
      this.updateTarget(model.get('src'));
    }
  },

  /**
   * Trigger when the asset is double clicked
   * @private
   * */
  handleDblClick() {
    var onDblClick = this.config.onDblClick;
    var model = this.model;

    if (typeof onDblClick === 'function') {
      onDblClick(model);
    } else {
      this.updateTarget(model.get('src'));
    }

    var onSelect = this.collection.onSelect;
    if (typeof onSelect == 'function') {
      onSelect(this.model);
    }
  },

  /**
   * Update target if exists
   * @param  {String}  v   Value
   * @private
   * */
  updateTarget(v) {
    const target = this.collection.target;

    if (target && target.set) {
      var attr = _.clone(target.get('attributes'));
      target.set('attributes', attr );
      target.set('src', v );
    }
  },

  /**
   * Remove asset from collection
   * @private
   * */
  removeItem(e) {
    e.stopPropagation();
    this.model.collection.remove(this.model);
  }
});
