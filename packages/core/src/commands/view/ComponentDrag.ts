import { keys, bindAll, each, isUndefined, debounce } from 'underscore';
import Dragger from '../../utils/Dragger';
import { CommandObject } from './CommandAbstract';

type Rect = { left: number; width: number; top: number; height: number };
type OrigRect = { left: number; width: number; top: number; height: number; rect: Rect };

type Guide = {
  type: string;
  y: number;
  x: number;
  origin: HTMLElement;
  originRect: OrigRect;
  guide: HTMLElement;
};

const evName = 'dmode';

export default {
  run(editor, sender, opts = {}) {
    bindAll(
      this,
      'setPosition',
      'onStart',
      'onDrag',
      'onEnd',
      'getPosition',
      'getGuidesStatic',
      'renderGuide',
      'getGuidesTarget',
    );
    const { target, event, mode, dragger = {} } = opts;
    const el = target.getEl();
    const config = {
      doc: el.ownerDocument,
      onStart: this.onStart,
      onEnd: this.onEnd,
      onDrag: this.onDrag,
      getPosition: this.getPosition,
      setPosition: this.setPosition,
      guidesStatic: () => this.guidesStatic,
      guidesTarget: () => this.guidesTarget,
      ...dragger,
    };
    this.setupGuides();
    this.opts = opts;
    this.editor = editor;
    this.em = editor.getModel();
    this.target = target;
    this.isTran = mode == 'translate';
    this.guidesContainer = this.getGuidesContainer();
    this.guidesTarget = this.getGuidesTarget();
    this.guidesStatic = this.getGuidesStatic();
    let drg = this.dragger;

    if (!drg) {
      drg = new Dragger(config);
      this.dragger = drg;
    } else {
      drg.setOptions(config);
    }

    event && drg.start(event);
    this.toggleDrag(1);
    this.em.trigger(`${evName}:start`, this.getEventOpts());

    return drg;
  },

  getEventOpts() {
    return {
      mode: this.opts.mode,
      target: this.target,
      guidesTarget: this.guidesTarget,
      guidesStatic: this.guidesStatic,
    };
  },

  stop() {
    this.toggleDrag();
  },

  setupGuides() {
    (this.guides || []).forEach((item: any) => {
      const { guide } = item;
      guide && guide.parentNode.removeChild(guide);
    });
    this.guides = [];
  },

  getGuidesContainer() {
    let { guidesEl } = this;

    if (!guidesEl) {
      const { editor, em, opts } = this;
      const pfx = editor.getConfig().stylePrefix;
      const elInfoX = document.createElement('div');
      const elInfoY = document.createElement('div');
      const guideContent = `<div class="${pfx}guide-info__line ${pfx}danger-bg">
        <div class="${pfx}guide-info__content ${pfx}danger-color"></div>
      </div>`;
      guidesEl = document.createElement('div');
      guidesEl.className = `${pfx}guides`;
      elInfoX.className = `${pfx}guide-info ${pfx}guide-info__x`;
      elInfoY.className = `${pfx}guide-info ${pfx}guide-info__y`;
      elInfoX.innerHTML = guideContent;
      elInfoY.innerHTML = guideContent;
      guidesEl.appendChild(elInfoX);
      guidesEl.appendChild(elInfoY);
      editor.Canvas.getGlobalToolsEl().appendChild(guidesEl);
      this.guidesEl = guidesEl;
      this.elGuideInfoX = elInfoX;
      this.elGuideInfoY = elInfoY;
      this.elGuideInfoContentX = elInfoX.querySelector(`.${pfx}guide-info__content`);
      this.elGuideInfoContentY = elInfoY.querySelector(`.${pfx}guide-info__content`);

      em.on(
        'canvas:update frame:scroll',
        debounce(() => {
          this.updateGuides();
          opts.debug && this.guides?.forEach((item: any) => this.renderGuide(item));
        }, 200),
      );
    }

    return guidesEl;
  },

  getGuidesStatic() {
    let result: any = [];
    const el = this.target.getEl();
    const { parentNode = {} } = el;
    each(parentNode.children, (item) => (result = result.concat(el !== item ? this.getElementGuides(item) : [])));

    return result.concat(this.getElementGuides(parentNode));
  },

  getGuidesTarget() {
    return this.getElementGuides(this.target.getEl());
  },

  updateGuides(guides: any) {
    let lastEl: any;
    let lastPos: any;
    (guides || this.guides).forEach((item: any) => {
      const { origin } = item;
      const pos = lastEl === origin ? lastPos : this.getElementPos(origin);
      lastEl = origin;
      lastPos = pos;
      each(this.getGuidePosUpdate(item, pos), (val, key) => (item[key] = val));
      item.originRect = pos;
    });
  },

  getGuidePosUpdate(item: any, rect: any) {
    const result: { x?: number; y?: number } = {};
    const { top, height, left, width } = rect;

    switch (item.type) {
      case 't':
        result.y = top;
        break;
      case 'b':
        result.y = top + height;
        break;
      case 'l':
        result.x = left;
        break;
      case 'r':
        result.x = left + width;
        break;
      case 'x':
        result.x = left + width / 2;
        break;
      case 'y':
        result.y = top + height / 2;
        break;
    }

    return result;
  },

  renderGuide(item: any = {}) {
    const el = item.guide || document.createElement('div');
    const un = 'px';
    const guideSize = item.active ? 2 : 1;
    let numEl = el.children[0];
    el.style = `position: absolute; background-color: ${item.active ? 'green' : 'red'};`;

    if (!el.children.length) {
      numEl = document.createElement('div');
      numEl.style = 'position: absolute; color: red; padding: 5px; top: 0; left: 0;';
      el.appendChild(numEl);
    }

    if (item.y) {
      el.style.width = '100%';
      el.style.height = `${guideSize}${un}`;
      el.style.top = `${item.y}${un}`;
      el.style.left = 0;
    } else {
      el.style.width = `${guideSize}${un}`;
      el.style.height = '100%';
      el.style.left = `${item.x}${un}`;
      el.style.top = `0${un}`;
    }

    !item.guide && this.guidesContainer.appendChild(el);
    return el;
  },

  getElementPos(el: HTMLElement) {
    return this.editor.Canvas.getElementPos(el, { noScroll: 1 });
  },

  getElementGuides(el: HTMLElement) {
    const { opts } = this;
    const originRect = this.getElementPos(el);
    const { top, height, left, width } = originRect;
    // @ts-ignore
    const guides: Guide[] = [
      { type: 't', y: top }, // Top
      { type: 'b', y: top + height }, // Bottom
      { type: 'l', x: left }, // Left
      { type: 'r', x: left + width }, // Right
      { type: 'x', x: left + width / 2 }, // Mid x
      { type: 'y', y: top + height / 2 }, // Mid y
    ].map((item) => ({
      ...item,
      origin: el,
      originRect,
      guide: opts.debug && this.renderGuide(item),
    }));
    guides.forEach((item) => this.guides?.push(item));

    return guides;
  },

  getTranslate(transform: string, axis = 'x') {
    let result = 0;
    (transform || '').split(' ').forEach((item) => {
      const itemStr = item.trim();
      const fn = `translate${axis.toUpperCase()}(`;
      if (itemStr.indexOf(fn) === 0) result = parseFloat(itemStr.replace(fn, ''));
    });
    return result;
  },

  setTranslate(transform: string, axis: string, value: string) {
    const fn = `translate${axis.toUpperCase()}(`;
    const val = `${fn}${value})`;
    let result = (transform || '')
      .split(' ')
      .map((item) => {
        const itemStr = item.trim();
        if (itemStr.indexOf(fn) === 0) item = val;
        return item;
      })
      .join(' ');
    if (result.indexOf(fn) < 0) result += ` ${val}`;

    return result;
  },

  getPosition() {
    const { target, isTran } = this;
    const { left, top, transform } = target.getStyle();
    let x = 0;
    let y = 0;

    if (isTran) {
      x = this.getTranslate(transform);
      y = this.getTranslate(transform, 'y');
    } else {
      x = parseFloat(left || 0);
      y = parseFloat(top || 0);
    }

    return { x, y };
  },

  setPosition({ x, y, end, position, width, height }: any) {
    const { target, isTran, em } = this;
    const unit = 'px';
    const __p = !end; // Indicate if partial change
    const left = `${parseInt(x, 10)}${unit}`;
    const top = `${parseInt(y, 10)}${unit}`;
    let styleUp = {};

    if (isTran) {
      let transform = target.getStyle()['transform'] || '';
      transform = this.setTranslate(transform, 'x', left);
      transform = this.setTranslate(transform, 'y', top);
      styleUp = { transform, __p };
      target.addStyle(styleUp, { avoidStore: !end });
    } else {
      const adds: any = { position, width, height };
      const style: any = { left, top, __p };
      keys(adds).forEach((add) => {
        const prop = adds[add];
        if (prop) style[add] = prop;
      });
      styleUp = style;
      target.addStyle(styleUp, { avoidStore: !end });
    }

    em?.Styles.__emitCmpStyleUpdate(styleUp, { components: em.getSelected() });
  },

  _getDragData() {
    const { target } = this;
    return {
      target,
      parent: target.parent(),
      index: target.index(),
    };
  },

  onStart(event: Event) {
    const { target, editor, isTran, opts } = this;
    const { center, onStart } = opts;
    const { Canvas } = editor;
    const style = target.getStyle();
    const position = 'absolute';
    const relPos = [position, 'relative'];
    onStart && onStart(this._getDragData());
    if (isTran) return;

    if (style.position !== position) {
      let { left, top, width, height } = Canvas.offset(target.getEl());
      let parent = target.parent();
      let parentRel;

      // Check for the relative parent
      do {
        const pStyle = parent.getStyle();
        parentRel = relPos.indexOf(pStyle.position) >= 0 ? parent : null;
        parent = parent.parent();
      } while (parent && !parentRel);

      // Center the target to the pointer position (used in Droppable for Blocks)
      if (center) {
        const { x, y } = Canvas.getMouseRelativeCanvas(event);
        left = x;
        top = y;
      } else if (parentRel) {
        const offsetP = Canvas.offset(parentRel.getEl());
        left = left - offsetP.left;
        top = top - offsetP.top;
      }

      this.setPosition({
        x: left,
        y: top,
        width: `${width}px`,
        height: `${height}px`,
        position,
      });
    }
  },

  onDrag(...args: any) {
    const { guidesTarget, opts } = this;
    const { onDrag } = opts;
    this.updateGuides(guidesTarget);
    opts.debug && guidesTarget.forEach((item: any) => this.renderGuide(item));
    opts.guidesInfo && this.renderGuideInfo(guidesTarget.filter((item: any) => item.active));
    onDrag && onDrag(this._getDragData());
  },

  onEnd(ev: Event, dragger: any, opt = {}) {
    const { editor, opts, id } = this;
    const { onEnd } = opts;
    onEnd && onEnd(ev, opt, { event: ev, ...opt, ...this._getDragData() });
    editor.stopCommand(id);
    this.hideGuidesInfo();
    this.em.trigger(`${evName}:end`, this.getEventOpts());
  },

  hideGuidesInfo() {
    ['X', 'Y'].forEach((item) => {
      const guide = this[`elGuideInfo${item}`];
      if (guide) guide.style.display = 'none';
    });
  },

  /**
   * Render guides with spacing information
   */
  renderGuideInfo(guides: Guide[] = []) {
    const { guidesStatic } = this;
    this.hideGuidesInfo();
    guides.forEach((item) => {
      const { origin, x } = item;
      const rectOrigin = this.getElementPos(origin);
      const axis = isUndefined(x) ? 'y' : 'x';
      const isY = axis === 'y';
      const origEdge1 = rectOrigin[isY ? 'left' : 'top'];
      const origEdge1Raw = rectOrigin.rect[isY ? 'left' : 'top'];
      const origEdge2 = isY ? origEdge1 + rectOrigin.width : origEdge1 + rectOrigin.height;
      const origEdge2Raw = isY ? origEdge1Raw + rectOrigin.rect.width : origEdge1Raw + rectOrigin.rect.height;
      const elGuideInfo = this[`elGuideInfo${axis.toUpperCase()}`];
      const elGuideInfoCnt = this[`elGuideInfoContent${axis.toUpperCase()}`];
      const guideInfoStyle = elGuideInfo.style;

      // Find the nearest element
      const res = guidesStatic
        ?.filter((stat) => stat.type === item.type)
        .map((stat) => {
          const { left, width, top, height } = stat.originRect;
          const statEdge1 = isY ? left : top;
          const statEdge2 = isY ? left + width : top + height;
          return {
            gap: statEdge2 < origEdge1 ? origEdge1 - statEdge2 : statEdge1 - origEdge2,
            guide: stat,
          };
        })
        .filter((item) => item.gap > 0)
        .sort((a, b) => a.gap - b.gap)
        .map((item) => item.guide)[0];

      if (res) {
        const { left, width, top, height, rect } = res.originRect;
        const isEdge1 = isY ? left < rectOrigin.left : top < rectOrigin.top;
        const statEdge1 = isY ? left : top;
        const statEdge1Raw = isY ? rect.left : rect.top;
        const statEdge2 = isY ? left + width : top + height;
        const statEdge2Raw = isY ? rect.left + rect.width : rect.top + rect.height;
        const posFirst = isY ? item.y : item.x;
        const posSecond = isEdge1 ? statEdge2 : origEdge2;
        const pos2 = `${posFirst}px`;
        const size = isEdge1 ? origEdge1 - statEdge2 : statEdge1 - origEdge2;
        const sizeRaw = isEdge1 ? origEdge1Raw - statEdge2Raw : statEdge1Raw - origEdge2Raw;
        guideInfoStyle.display = '';
        guideInfoStyle[isY ? 'top' : 'left'] = pos2;
        guideInfoStyle[isY ? 'left' : 'top'] = `${posSecond}px`;
        guideInfoStyle[isY ? 'width' : 'height'] = `${size}px`;
        elGuideInfoCnt.innerHTML = `${Math.round(sizeRaw)}px`;
        this.em.trigger(`${evName}:active`, {
          ...this.getEventOpts(),
          guide: item,
          guidesStatic,
          matched: res,
          posFirst,
          posSecond,
          size,
          sizeRaw,
          elGuideInfo,
          elGuideInfoCnt,
        });
      }
    });
  },

  toggleDrag(enable: boolean) {
    const { ppfx, editor } = this;
    const methodCls = enable ? 'add' : 'remove';
    const classes = [`${ppfx}is__grabbing`];
    const { Canvas } = editor;
    const body = Canvas.getBody();
    classes.forEach((cls) => body.classList[methodCls](cls));
    Canvas[enable ? 'startAutoscroll' : 'stopAutoscroll']();
  },
} as CommandObject<
  any,
  {
    guidesStatic?: Guide[];
    guides?: Guide[];
    [k: string]: any;
  }
>;
