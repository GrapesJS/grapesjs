import Backbone from 'backbone';

module.exports = Backbone.Model.extend({
  defaults: {
    wrapper: '',
    width: '',
    height: '',
    head: '',
    attributes: {}
  },

  initialize() {
    this.set('head', []);
  },

  getHead() {
    return this.get('head');
  },

  setHead(value) {
    return this.set('head', [...value]);
  },

  addHeadItem(item) {
    const head = this.getHead();
    head.push(item);
    this.setHead(head);
  },

  removeHeadByAttr(attr, value, tag) {
    const head = this.getHead();
    const item = head.filter(
      item =>
        item.attributes &&
        item.attributes[attr] == value &&
        (!tag || tag === item.tag)
    )[0];
    const index = head.indexOf(item);

    if (index >= 0) {
      head.splice(index, 1);
      this.setHead(head);
    }
  },

  addLink(href) {
    this.addHeadItem({
      tag: 'link',
      attributes: {
        href,
        rel: 'stylesheet'
      }
    });
  },

  removeLink(href) {
    this.removeHeadByAttr('href', href, 'link');
  },

  addScript(src) {
    this.addHeadItem({
      tag: 'script',
      attributes: { src }
    });
  },

  removeScript(src) {
    this.removeHeadByAttr('src', src, 'script');
  }
});
