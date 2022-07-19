import { result, forEach, isEmpty, isString } from 'underscore';
import { Model } from '../../abstract';
import CanvasModule from '..';
import ComponentWrapper from '../../dom_components/model/ComponentWrapper';
import { isComponent, isObject } from '../../utils/mixins';
import FrameView from '../view/FrameView';
import Frames from './Frames';

const keyAutoW = '__aw';
const keyAutoH = '__ah';

/**
 * @property {Object|String} component Wrapper component definition. You can also pass an HTML string as components of the default wrapper component.
 * @property {String} [width=''] Width of the frame. By default, the canvas width will be taken.
 * @property {String} [height=''] Height of the frame. By default, the canvas height will be taken.
 * @property {Number} [x=0] Horizontal position of the frame in the canvas.
 * @property {Number} [y=0] Vertical position of the frame in the canvas.
 *
 */
export default class Frame extends Model<CanvasModule> {
  defaults() {
    return {
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
      _undoexc: ['changesCount'],
    };
  }
  view?: FrameView;

  /**
   * @hideconstructor
   */
  constructor(module: CanvasModule, attr: any) {
    super(module, attr);
    const { em } = this;
    const { styles, component } = this.attributes;
    const domc = em.get('DomComponents');
    const conf = domc.getConfig();
    const allRules = em.get('CssComposer').getAll();
    const idMap: any = {};
    const modOpts = { em, config: conf, frame: this, idMap };

    if (!isComponent(component)) {
      const wrp = isObject(component) ? component : { components: component };
      !wrp.type && (wrp.type = 'wrapper');
      const Wrapper = domc.getType('wrapper').model;
      this.set('component', new Wrapper(wrp, modOpts));
    }

    if (!styles) {
      this.set('styles', allRules);
    } else if (!isObject(styles)) {
      // Avoid losing styles on remapped components
      const idMapKeys = Object.keys(idMap);
      if (idMapKeys.length && Array.isArray(styles)) {
        styles.forEach(style => {
          const sel = style.selectors;
          if (sel && sel.length == 1) {
            const sSel = sel[0];
            const idSel = sSel.name && sSel.type === 2 && sSel;
            if (idSel && idMap[idSel.name]) {
              idSel.name = idMap[idSel.name];
            } else if (isString(sSel) && sSel[0] === '#') {
              const prevId = sSel.substring(1);
              if (prevId && idMap[prevId]) {
                sel[0] = `#${idMap[prevId]}`;
              }
            }
          }
        });
      }

      allRules.add(styles);
      this.set('styles', allRules);
    }

    !attr.width && this.set(keyAutoW, 1);
    !attr.height && this.set(keyAutoH, 1);
  }

  get head(): { tag: string; attributes: any }[] {
    return this.get('head');
  }

  onRemove() {
    this.getComponent().remove({ root: 1 });
  }

  changesUp(opt: any = {}) {
    if (opt.temporary || opt.noCount || opt.avoidStore) {
      return;
    }
    this.set('changesCount', this.get('changesCount') + 1);
  }

  getComponent(): ComponentWrapper {
    return this.get('component');
  }

  getStyles() {
    return this.get('styles');
  }

  disable() {
    this.trigger('disable');
  }

  remove() {
    this.view = undefined;
    const coll = this.collection;
    return coll && coll.remove(this);
  }

  getHead() {
    return [...this.head];
  }

  setHead(value: { tag: string; attributes: any }[]) {
    return this.set('head', [...value]);
  }

  addHeadItem(item: { tag: string; attributes: any }) {
    this.head.push(item);
  }

  getHeadByAttr(attr: string, value: any, tag: string) {
    return this.head.filter(item => item.attributes && item.attributes[attr] == value && (!tag || tag === item.tag))[0];
  }

  removeHeadByAttr(attr: string, value: any, tag: string) {
    const item = this.getHeadByAttr(attr, value, tag);
    const index = this.head.indexOf(item);

    if (index >= 0) {
      this.head.splice(index, 1);
    }
  }

  addLink(href: string) {
    const tag = 'link';
    !this.getHeadByAttr('href', href, tag) &&
      this.addHeadItem({
        tag,
        attributes: {
          href,
          rel: 'stylesheet',
        },
      });
  }

  removeLink(href: string) {
    this.removeHeadByAttr('href', href, 'link');
  }

  addScript(src: string) {
    const tag = 'script';
    !this.getHeadByAttr('src', src, tag) &&
      this.addHeadItem({
        tag,
        attributes: { src },
      });
  }

  removeScript(src: string) {
    this.removeHeadByAttr('src', src, 'script');
  }

  getPage() {
    return (this.collection as unknown as Frames)?.page;
  }

  _emitUpdated(data = {}) {
    this.em.trigger('frame:updated', { frame: this, ...data });
  }

  toJSON(opts: any = {}) {
    const obj = Model.prototype.toJSON.call(this, opts);
    const defaults = result(this, 'defaults');

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
}
