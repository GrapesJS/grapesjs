var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  initialize(o = {}) {
    this.options = o;
    this.collection = o.collection;
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.ppfx = this.config.pStylePrefix || '';
    this.className = this.pfx + 'asset';
    this.listenTo(this.model, 'destroy remove', this.remove);
    const init = this.init && this.init.bind(this);
    init && init(o);
  },

  template() {
    const pfx = this.pfx;
    return `
      <div id="${pfx}preview-cont">
        ${this.getPreview()}
      </div>
      <div id="${pfx}meta">
        ${this.getInfo()}
      </div>
      <div id="${pfx}close" data-toggle="asset-remove">&Cross;</div>
      <div style="clear:both"></div>
    `;
  },

  getPreview() {
    return '';
  },

  getInfo() {
    return '';
  },

  render() {
    const el = this.el;
    el.innerHTML = this.template(this, this.model);
    el.className = this.className;
    return this;
  },
});
