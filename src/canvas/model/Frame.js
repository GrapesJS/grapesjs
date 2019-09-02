import Backbone from 'backbone';
import Component from 'dom_components/model/Component';
import CssRules from 'css_composer/model/CssRules';

export default Backbone.Model.extend({
  defaults: {
    wrapper: '',
    width: '',
    height: '',
    head: '',
    x: 0,
    y: 0,
    root: 0,
    styles: 0,
    attributes: {}
  },

  initialize() {
    const { root, styles } = this.attributes;
    this.set('head', []);
    !root && this.set('root', new Component({ type: 'wrapper' }));
    !styles && this.set('styles', new CssRules());
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
