import { forEach, isEmpty, isNumber, isString, keys, result } from 'underscore';
import CanvasModule from '..';
import { ModuleModel } from '../../abstract';
import { BoxRect, PrevToNewIdMap } from '../../common';
import type Component from '../../dom_components/model/Component';
import ComponentWrapper from '../../dom_components/model/ComponentWrapper';
import { ComponentDefinition } from '../../dom_components/model/types';
import { ComponentsEvents } from '../../dom_components/types';
import Page from '../../pages/model/Page';
import { createId, isComponent, isObject } from '../../utils/mixins';
import FrameView from '../view/FrameView';
import Frames from './Frames';
import { CssRuleJSON } from '../../css_composer/model/CssRule';
import CanvasEvents from '../types';

const keyAutoW = '__aw';
const keyAutoH = '__ah';

export interface FrameProperties {
  id?: string;
  page?: Page;
  component?: string | ComponentDefinition | ComponentDefinition[] | Component;
  width?: string | number | null;
  height?: string | number | null;
  x?: number;
  y?: number;
  attributes?: Record<string, unknown>;
  head?: { tag: string; attributes: any }[];
  styles?: string | CssRuleJSON[];
  refFrame?: string | Frame | null;
  refComponent?: string | Component | null;
  skipFromStorage?: boolean;
  [key: string]: unknown;
}

const getDimension = (frame: Frame, type: 'width' | 'height') => {
  const dim = frame.get(type);
  const viewDim = frame.view?.el[type === 'width' ? 'offsetWidth' : 'offsetHeight'];

  if (isNumber(dim)) {
    return dim;
  } else if (isString(dim) && dim.endsWith('px')) {
    return parseFloat(dim);
  } else if (viewDim) {
    return viewDim;
  } else {
    return 0;
  }
};

/**
 * @property {Object|String} component Wrapper component definition. You can also pass an HTML string as components of the default wrapper component.
 * @property {String} [width=''] Width of the frame. By default, the canvas width will be taken.
 * @property {String} [height=''] Height of the frame. By default, the canvas height will be taken.
 * @property {Number} [x=0] Horizontal position of the frame in the canvas.
 * @property {Number} [y=0] Vertical position of the frame in the canvas.
 *
 */
export default class Frame extends ModuleModel<CanvasModule> {
  page?: Page;
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
      refFrame: null,
      _undo: true,
      _undoexc: ['changesCount'],
    };
  }
  view?: FrameView;

  /**
   * @hideconstructor
   */
  constructor(module: CanvasModule, attr: FrameProperties) {
    const page = attr.page;
    delete attr.page;
    super(module, attr);
    this.page = page;
    const { em } = this;
    const { styles, component } = this.attributes;
    const domc = em.Components;
    const conf = domc.getConfig();
    const allRules = em.Css.getAll();
    const idMap: PrevToNewIdMap = {};
    const modOpts = { em, config: conf, frame: this, idMap };

    if (!isComponent(component)) {
      const wrp = isObject(component) ? component : { components: component };
      !wrp.type && (wrp.type = 'wrapper');
      const Wrapper = (domc.getType(wrp.type as string) || domc.getType('wrapper')!).model;
      this.set('component', new Wrapper(wrp, modOpts));
    } else {
      this.updateComponentFrame(component);
      this.emitComponentAdd(component);
    }

    if (!styles) {
      this.set('styles', allRules);
    } else if (!isObject(styles)) {
      let newStyles = styles as string | CssRuleJSON[];

      // Avoid losing styles on remapped components
      if (keys(idMap).length) {
        newStyles = isString(newStyles) ? em.Parser.parseCss(newStyles) : newStyles;
        em.Css.checkId(newStyles, { idMap });
      }

      allRules.add(newStyles);
      this.set('styles', allRules);
    }

    !attr.width && this.set(keyAutoW, 1);
    !attr.height && this.set(keyAutoH, 1);

    !this.id && this.set('id', createId());
  }

  get width() {
    return getDimension(this, 'width');
  }

  get height() {
    return getDimension(this, 'height');
  }

  get head(): { tag: string; attributes: any }[] {
    return this.get('head');
  }

  get refFrame(): Frame | undefined {
    return this.get('refFrame');
  }

  get refComponent(): Component | undefined {
    return this.get('refComponent');
  }

  updateComponentFrame(component: Component) {
    if (component.frame !== this) {
      component.opt.frame = this;
    }

    component.components().forEach((child) => this.updateComponentFrame(child));
  }

  emitComponentAdd(component: Component, opts: Record<string, any> = {}) {
    this.em.trigger(ComponentsEvents.add, component, opts);
    component.components().forEach((child) => this.emitComponentAdd(child, opts));
  }

  get root() {
    const { refFrame } = this;
    return refFrame?.getComponent() || this.getComponent();
  }

  initRefs() {
    const { refFrame, refComponent, em } = this;
    if (isString(refFrame)) {
      const frame = this.module.framesById[refFrame];
      frame && this.set({ refFrame: frame }, { silent: true });
    }
    if (isString(refComponent)) {
      const component = em.Components.getById(refComponent);
      component && this.set({ refComponent: component }, { silent: true });
    }
  }

  getBoxRect(): BoxRect {
    const { x, y } = this.attributes;
    const { width, height } = this;

    return {
      x,
      y,
      width,
      height,
    };
  }

  onRemove() {
    !this.refFrame && !this.refComponent && this.getComponent().remove({ root: 1 });
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

  getMainComponent(): Component {
    return this.refComponent || this.root;
  }

  getStyles() {
    return this.get('styles');
  }

  disable() {
    this.trigger('disable');
  }

  remove() {
    this.view?.remove();
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
    return this.head.filter(
      (item) => item.attributes && item.attributes[attr] == value && (!tag || tag === item.tag),
    )[0];
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

  getPage(): Page | undefined {
    return this.page || (this.collection as unknown as Frames)?.page;
  }

  _emitUpdated(data = {}) {
    this.em.trigger('frame:updated', { frame: this, ...data });
  }

  _emitUnload() {
    this._emitWithEditor(CanvasEvents.frameUnload, { frame: this });
  }

  _emitWithEditor(event: string, data?: Record<string, any>) {
    [this.em, this].forEach((item) => item?.trigger(event, data));
  }

  hasAutoHeight() {
    const { height } = this.attributes;

    if (height === 'auto' || this.config.infiniteCanvas) {
      return true;
    }

    return false;
  }

  toJSON(opts: any = {}) {
    const obj = ModuleModel.prototype.toJSON.call(this, opts);
    const defaults = result(this, 'defaults');

    if (opts.fromUndo) delete obj.component;
    delete obj.skipFromStorage;
    delete obj.refComponent;
    delete obj.styles;
    delete obj.changesCount;
    obj[keyAutoW] && delete obj.width;
    obj[keyAutoH] && delete obj.height;

    if (obj.refFrame) {
      obj.refFrame = obj.refFrame.id;
      delete obj.component;
    }

    // Remove private keys
    forEach(obj, (value, key) => {
      key.indexOf('_') === 0 && delete obj[key];
    });

    forEach(defaults, (value, key) => {
      if (obj[key] === value) delete obj[key];
    });

    forEach(['attributes', 'head'], (prop) => {
      if (isEmpty(obj[prop])) delete obj[prop];
    });

    return obj;
  }
}
