import Backbone from 'backbone';

export default Backbone.Model.extend({
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
    return [...this.get('head')];
  },

  setHead(value) {
    return this.set('head', [...value]);
  },

  addHeadItem(item) {
    const head = this.getHead();
    head.push(item);
    this.setHead(head);
  },

  getHeadByAttr(attr, value, tag) {
    const head = this.getHead();
    return head.filter(
      item =>
        item.attributes &&
        item.attributes[attr] == value &&
        (!tag || tag === item.tag)
    )[0];
  },

  removeHeadByAttr(attr, value, tag) {
    const head = this.getHead();
    const item = this.getHeadByAttr(attr, value, tag);
    const index = head.indexOf(item);

    if (index >= 0) {
      head.splice(index, 1);
      this.setHead(head);
    }
  },

  addLink(href) {
    const tag = 'link';
    !this.getHeadByAttr('href', href, tag) &&
      this.addHeadItem({
        tag,
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
    const tag = 'script';
    !this.getHeadByAttr('src', src, tag) &&
      this.addHeadItem({
        tag,
        attributes: { src }
      });
  },

  removeScript(src) {
    this.removeHeadByAttr('src', src, 'script');
  }
});
