import Backbone from 'backbone';
import Component from 'dom_components/model/Component';
import { isComponent, isObject } from 'utils/mixins';

export default Backbone.Model.extend({
  defaults: () => ({
    x: 0,
    y: 0,
    attributes: {},
    width: null,
    height: null,
    head: [],
    components: '',
    styles: ''
  }),

  initialize(props, opts = {}) {
    const { config } = opts;
    const { em } = config;
    const { styles, components } = this.attributes;
    const conf = em.get('DomComponents').getConfig();
    const allRules = em.get('CssComposer').getAll();
    this.em = em;
    const modOpts = { em, config: conf, frame: this };

    if (!isComponent(components)) {
      this.set(
        'components',
        new Component({ type: 'wrapper', components }, modOpts)
      );
    }

    if (!styles) {
      this.set('styles', allRules);
    } else if (!isObject(styles)) {
      allRules.add(styles);
      this.set('styles', allRules);
    }
  },

  getComponents() {
    return this.get('components');
  },

  getStyles() {
    return this.get('styles');
  },

  disable() {
    this.trigger('disable');
  },

  remove() {
    this.view = 0;
    const coll = this.collection;
    return coll && coll.remove(this);
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
  },

  _emitUpdated(data = {}) {
    this.em.trigger('frame:updated', { frame: this, ...data });
  }
});
