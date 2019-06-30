import Backbone from 'backbone';

export default Backbone.View.extend({
  template({ pfx, ppfx, content, title }) {
    return `<div class="${pfx}dialog ${ppfx}one-bg ${ppfx}two-color">
      <div class="${pfx}header">
        <div class="${pfx}title">${title}</div>
        <div class="${pfx}btn-close" data-close-modal>&Cross;</div>
      </div>
      <div class="${pfx}content">
        <div id="${pfx}c">${content}</div>
        <div style="clear:both"></div>
      </div>
    </div>
    <div class="${pfx}collector" style="display: none"></div>`;
  },

  events: {
    click: 'onClick',
    'click [data-close-modal]': 'hide'
  },

  initialize(o) {
    const model = this.model;
    const config = o.config || {};
    const pfx = config.stylePrefix || '';
    this.config = config;
    this.pfx = pfx;
    this.ppfx = config.pStylePrefix || '';
    this.listenTo(model, 'change:open', this.updateOpen);
    this.listenTo(model, 'change:title', this.updateTitle);
    this.listenTo(model, 'change:content', this.updateContent);
  },

  onClick(e) {
    const bkd = this.config.backdrop;
    bkd && e.target === this.el && this.hide();
  },

  /**
   * Returns collector element
   * @return {HTMLElement}
   * @private
   */
  getCollector() {
    if (!this.$collector)
      this.$collector = this.$el.find('.' + this.pfx + 'collector');
    return this.$collector;
  },

  /**
   * Returns content element
   * @return {HTMLElement}
   * @private
   */
  getContent() {
    const pfx = this.pfx;

    if (!this.$content) {
      this.$content = this.$el.find(`.${pfx}content #${pfx}c`);
    }

    return this.$content;
  },

  /**
   * Returns title element
   * @return {HTMLElement}
   * @private
   */
  getTitle() {
    if (!this.$title) this.$title = this.$el.find('.' + this.pfx + 'title');
    return this.$title.get(0);
  },

  /**
   * Update content
   * @private
   * */
  updateContent() {
    var content = this.getContent();
    const children = content.children();
    const coll = this.getCollector();
    const body = this.model.get('content');
    children.length && coll.append(children);
    content.empty().append(body);
  },

  /**
   * Update title
   * @private
   * */
  updateTitle() {
    var title = this.getTitle();
    if (title) title.innerHTML = this.model.get('title');
  },

  /**
   * Update open
   * @private
   * */
  updateOpen() {
    this.el.style.display = this.model.get('open') ? '' : 'none';
  },

  /**
   * Hide modal
   * @private
   * */
  hide() {
    this.model.set('open', 0);
  },

  /**
   * Show modal
   * @private
   * */
  show() {
    this.model.set('open', 1);
  },

  render() {
    const el = this.$el;
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    const obj = this.model.toJSON();
    obj.pfx = this.pfx;
    obj.ppfx = this.ppfx;
    el.html(this.template(obj));
    el.attr('class', `${pfx}container`);
    this.updateOpen();
    return this;
  }
});
