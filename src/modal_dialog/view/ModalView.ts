import { View } from '../../abstract';
import Modal from '../model/Modal';

export default class ModalView extends View<Modal> {
  template({ pfx, ppfx, content, title }: any) {
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
  }

  events() {
    return {
      click: 'onClick',
      'click [data-close-modal]': 'hide',
    };
  }

  $title?: JQuery<HTMLElement>;
  $content?: JQuery<HTMLElement>;
  $collector?: JQuery<HTMLElement>;

  constructor(o: any) {
    super(o);
    const model = this.model;
    this.listenTo(model, 'change:open', this.updateOpen);
    this.listenTo(model, 'change:title', this.updateTitle);
    this.listenTo(model, 'change:content', this.updateContent);
  }

  onClick(e: Event) {
    const bkd = this.config.backdrop;
    bkd && e.target === this.el && this.hide();
  }

  /**
   * Returns collector element
   * @return {HTMLElement}
   * @private
   */
  getCollector() {
    if (!this.$collector) this.$collector = this.$el.find('.' + this.pfx + 'collector');
    return this.$collector;
  }

  /**
   * Returns content element
   * @return {HTMLElement}
   */
  getContent() {
    const pfx = this.pfx;

    if (!this.$content) {
      this.$content = this.$el.find(`.${pfx}content #${pfx}c`);
    }

    return this.$content;
  }

  /**
   * Returns title element
   * @return {HTMLElement}
   * @private
   */
  getTitle(opts: any = {}) {
    if (!this.$title) this.$title = this.$el.find('.' + this.pfx + 'title');
    return opts.$ ? this.$title : this.$title.get(0);
  }

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
  }

  /**
   * Update title
   * @private
   * */
  updateTitle() {
    const title = this.getTitle({ $: true });
    //@ts-ignore
    title && title.empty().append(this.model.get('title'));
  }

  /**
   * Update open
   * @private
   * */
  updateOpen() {
    this.el.style.display = this.model.get('open') ? '' : 'none';
  }

  /**
   * Hide modal
   * @private
   * */
  hide() {
    this.model.close();
  }

  /**
   * Show modal
   * @private
   * */
  show() {
    this.model.open();
  }

  updateAttr(attr?: any) {
    const { pfx, $el, el } = this;
    //@ts-ignore
    const currAttr = [].slice.call(el.attributes).map(i => i.name);
    $el.removeAttr(currAttr.join(' '));
    $el.attr({
      ...(attr || {}),
      class: `${pfx}container ${(attr && attr.class) || ''}`.trim(),
    });
  }

  render() {
    const el = this.$el;
    const obj = this.model.toJSON();
    obj.pfx = this.pfx;
    obj.ppfx = this.ppfx;
    el.html(this.template(obj));
    this.updateAttr();
    this.updateOpen();
    return this;
  }
}
