import { Model } from 'backbone';
import { result, forEach, isEmpty, debounce } from 'underscore';
import { isComponent, isObject } from 'utils/mixins';

const keyAutoW = '__aw';
const keyAutoH = '__ah';

export default Model.extend({
  defaults: () => ({
    x: 0,
    y: 0,
    changesCount: 0,
    attributes: {},
    width: null,
    height: null,
    head: [],
    component: '',
    styles: '',
    _undo: true,
    _undoexc: ['changesCount']
  }),

  initialize(props, opts = {}) {
    const { config } = opts;
    const { em } = config;
    const { styles, component } = this.attributes;
    const domc = em.get('DomComponents');
    const conf = domc.getConfig();
    const allRules = em.get('CssComposer').getAll();
    this.em = em;
    const modOpts = { em, config: conf, frame: this };

    if (!isComponent(component)) {
      const wrp = isObject(component) ? component : { components: component };
      !wrp.type && (wrp.type = 'wrapper');
      const Wrapper = domc.getType('wrapper').model;
      this.set('component', new Wrapper(wrp, modOpts));
    }

    if (!styles) {
      this.set('styles', allRules);
    } else if (!isObject(styles)) {
      allRules.add(styles);
      this.set('styles', allRules);
    }

    !props.width && this.set(keyAutoW, 1);
    !props.height && this.set(keyAutoH, 1);
  },

  onRemove() {
    this.getComponent().remove({ root: 1 });
  },

  changesUp: debounce(function(opt = {}) {
    if (opt.temporary || opt.noCount || opt.avoidStore) {
      return;
    }
    this.set('changesCount', this.get('changesCount') + 1);
  }),

  getComponent() {
    return this.get('component');
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
    const head = this.get('head') || [];
    return [...head];
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

  getPage() {
    const coll = this.collection;
    return coll && coll.page;
  },

  _emitUpdated(data = {}) {
    this.em.trigger('frame:updated', { frame: this, ...data });
  },

  toJSON(opts = {}) {
    const obj = Model.prototype.toJSON.call(this, opts);
    const { em } = this;
    const sm = em && em.get('StorageManager');
    const smc = sm && sm.getConfig();
    const defaults = result(this, 'defaults');

    if (smc && !opts.fromUndo) {
      const opts = { component: this.getComponent() };
      if (smc.storeHtml) obj.html = em.getHtml(opts);
      if (smc.storeCss) obj.css = em.getCss(opts);
    }

    if (opts.fromUndo) delete obj.component;
    delete obj.styles;
    delete obj.changesCount;
    obj[keyAutoW] && delete obj.width;
    obj[keyAutoH] && delete obj.height;

    // Remove private keys
    forEach(obj, (value, key) => {
      key.indexOf('_') === 0 && delete obj[key];
    });

    forEach(defaults, (value, key) => {
      if (obj[key] === value) delete obj[key];
    });

    forEach(['attributes', 'head'], prop => {
      if (isEmpty(obj[prop])) delete obj[prop];
    });

    return obj;
  }
});
