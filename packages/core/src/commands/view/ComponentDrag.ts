import { keys, bindAll, each, isUndefined, debounce } from 'underscore';
import { CanvasEvents } from '../../canvas/types';
import Dragger, { DraggerOptions } from '../../utils/Dragger';
import type Editor from '../../editor';
import type Component from '../../dom_components/model/Component';
import type EditorModel from '../../editor/model/Editor';
import { getComponentModel, getComponentView } from '../../utils/mixins';
import type ComponentView from '../../dom_components/view/ComponentView';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

const evName = 'dmode';

export interface ComponentDragCommandRegistryRun {
  'core:component-drag': CommandPublicFnFromHandler<CommandComponentDrag['run']>;
}

export default class CommandComponentDrag extends CommandAbstract<ComponentDragOpts> {
  editor!: Editor;
  em!: EditorModel;
  opts!: ComponentDragOpts;
  target!: Component;
  guides?: ComponentDragGuide[];
  guidesContainer?: HTMLElement;
  guidesEl?: HTMLElement;
  guidesStatic?: ComponentDragGuide[];
  guidesTarget?: ComponentDragGuide[];
  isTran?: boolean;
  elGuideInfoX?: HTMLElement;
  elGuideInfoY?: HTMLElement;
  elGuideInfoContentX?: HTMLElement;
  elGuideInfoContentY?: HTMLElement;
  dragger?: Dragger;

  run(editor: Editor, _sender: any, opts = {} as ComponentDragOpts) {
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

    if (!opts.target) throw new Error('Target option is required');

    const config = {
      doc: opts.target.getEl()?.ownerDocument,
      onStart: this.onStart,
      onEnd: this.onEnd,
      onDrag: this.onDrag,
      getPosition: this.getPosition,
      setPosition: this.setPosition,
      guidesStatic: () => this.guidesStatic ?? [],
      guidesTarget: () => this.guidesTarget ?? [],
      ...(opts.dragger ?? {}),
    };
    this.setupGuides();
    this.opts = opts;
    this.editor = editor;
    this.em = editor.getModel();
    this.target = opts.target;
    this.isTran = opts.mode == 'translate';
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

    opts.event && drg.start(opts.event);
    this.toggleDrag(true);
    this.em.trigger(`${evName}:start`, this.getEventOpts());

    return drg;
  }

  getEventOpts(): ComponentDragEventProps {
    const guidesActive = this.guidesTarget?.filter((item) => item.active) ?? [];
    return {
      mode: this.opts.mode,
      component: this.target,
      target: this.target,
      guidesTarget: this.guidesTarget ?? [],
      guidesStatic: this.guidesStatic ?? [],
      guidesMatched: this.getGuidesMatched(guidesActive),
      command: this,
    };
  }

  stop() {
    this.toggleDrag();
  }

  setupGuides() {
    (this.guides ?? []).forEach((item) => {
      const { guide } = item;
      guide?.parentNode?.removeChild(guide);
    });
    this.guides = [];
  }

  getGuidesContainer() {
    let { guidesEl } = this;

    if (!guidesEl) {
      const { editor, em, opts } = this;
      const pfx = editor.getConfig().stylePrefix ?? '';
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
      editor.Canvas.getGlobalToolsEl()?.appendChild(guidesEl);
      this.guidesEl = guidesEl;
      this.elGuideInfoX = elInfoX;
      this.elGuideInfoY = elInfoY;
      this.elGuideInfoContentX = elInfoX.querySelector(`.${pfx}guide-info__content`) ?? undefined;
      this.elGuideInfoContentY = elInfoY.querySelector(`.${pfx}guide-info__content`) ?? undefined;

      em.on(
        `${CanvasEvents.update} frame:scroll`,
        debounce(() => {
          this.updateGuides();
          opts.debug && this.guides?.forEach((item) => this.renderGuide(item));
        }, 200),
      );
    }

    return guidesEl;
  }

  getGuidesStatic() {
    let result: ComponentDragGuide[] = [];
    const el = this.target.getEl();
    const parentNode = el?.parentElement;
    if (!parentNode) return [];
    each(
      parentNode.children,
      (item) => (result = result.concat(el !== item ? this.getElementGuides(item as HTMLElement) : [])),
    );

    return result.concat(this.getElementGuides(parentNode));
  }

  getGuidesTarget() {
    return this.getElementGuides(this.target.getEl()!);
  }

  updateGuides(guides?: ComponentDragGuide[]) {
    let lastEl: HTMLElement | undefined;
    let lastPos: ComponentOrigRect | undefined;
    const guidesToUpdate = guides ?? this.guides ?? [];
    guidesToUpdate.forEach((item) => {
      const { origin } = item;
      const pos = lastEl === origin ? lastPos! : this.getElementPos(origin);
      lastEl = origin;
      lastPos = pos;
      each(this.getGuidePosUpdate(item, pos), (val, key) => {
        (item as unknown as Record<string, unknown>)[key] = val;
      });
      item.originRect = pos;
    });
  }

  getGuidePosUpdate(item: ComponentDragGuide, rect: ComponentOrigRect) {
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
  }

  renderGuide(item: { active?: boolean; guide?: HTMLElement; x?: number; y?: number }) {
    if (this.opts.skipGuidesRender) return;
    const el = item.guide ?? document.createElement('div');
    const un = 'px';
    const guideSize = item.active ? 2 : 1;

    el.style.cssText = `position: absolute; background-color: ${item.active ? 'green' : 'red'};`;

    if (!el.children.length) {
      const numEl = document.createElement('div');
      numEl.style.cssText = 'position: absolute; color: red; padding: 5px; top: 0; left: 0;';
      el.appendChild(numEl);
    }

    if (item.y) {
      el.style.width = '100%';
      el.style.height = `${guideSize}${un}`;
      el.style.top = `${item.y}${un}`;
      el.style.left = '0';
    } else {
      el.style.width = `${guideSize}${un}`;
      el.style.height = '100%';
      el.style.left = `${item.x}${un}`;
      el.style.top = `0${un}`;
    }

    !item.guide && this.guidesContainer?.appendChild(el);
    return el;
  }

  getElementPos(el: HTMLElement) {
    return this.editor.Canvas.getElementPos(el, { noScroll: 1 });
  }

  getElementGuides(el: HTMLElement) {
    const { opts } = this;
    const origin = el;
    const originRect = this.getElementPos(el);
    const component = getComponentModel(el);
    const componentView = getComponentView(el);

    const { top, height, left, width } = originRect;
    const guidePoints: { type: string; x?: number; y?: number }[] = [
      { type: 't', y: top },
      { type: 'b', y: top + height },
      { type: 'l', x: left },
      { type: 'r', x: left + width },
      { type: 'x', x: left + width / 2 },
      { type: 'y', y: top + height / 2 },
    ];

    const guides = guidePoints.map((guidePoint) => {
      const guide = opts.debug ? this.renderGuide(guidePoint) : undefined;
      return {
        ...guidePoint,
        component,
        componentView,
        componentEl: origin,
        origin,
        componentElRect: originRect,
        originRect,
        guideEl: guide,
        guide,
      };
    }) as unknown as ComponentDragGuide[];

    guides.forEach((guidePoint) => this.guides?.push(guidePoint));

    return guides;
  }

  getTranslate(transform: string, axis = 'x') {
    let result = 0;
    (transform || '').split(' ').forEach((item) => {
      const itemStr = item.trim();
      const fn = `translate${axis.toUpperCase()}(`;
      if (itemStr.indexOf(fn) === 0) result = parseFloat(itemStr.replace(fn, ''));
    });
    return result;
  }

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
  }

  getPosition() {
    const { target, isTran } = this;
    const targetStyle = target.getStyle();

    const transform = targetStyle.transform as string | undefined;
    const left = targetStyle.left as string | undefined;
    const top = targetStyle.top as string | undefined;

    let x = 0;
    let y = 0;

    if (isTran && transform) {
      x = this.getTranslate(transform);
      y = this.getTranslate(transform, 'y');
    } else {
      x = parseFloat(left ?? '0');
      y = parseFloat(top ?? '0');
    }

    return { x, y };
  }

  setPosition({ x, y, end, position, width, height }: any) {
    const { target, isTran, em, opts } = this;
    const unit = 'px';
    const __p = !end;
    const left = `${parseInt(`${x}`, 10)}${unit}`;
    const top = `${parseInt(`${y}`, 10)}${unit}`;
    let styleUp = {};

    if (isTran) {
      let transform = (target.getStyle()?.transform ?? '') as string;
      transform = this.setTranslate(transform, 'x', left);
      transform = this.setTranslate(transform, 'y', top);
      styleUp = { transform, __p };
    } else {
      const adds: any = { position, width, height };
      const style: any = { left, top, __p };
      keys(adds).forEach((add) => {
        const prop = adds[add];
        if (prop) style[add] = prop;
      });
      styleUp = style;
    }

    if (opts.addStyle) {
      opts.addStyle({ component: target, styles: styleUp, partial: !end });
    } else {
      target.addStyle(styleUp, { avoidStore: !end });
    }

    em.Styles.__emitCmpStyleUpdate(styleUp, { components: em.getSelected() });
  }

  _getDragData() {
    const { target } = this;
    return {
      target,
      parent: target.parent(),
      index: target.index(),
    };
  }

  onStart(event: Event) {
    const { target, editor, isTran, opts } = this;
    const { Canvas } = editor;
    const style = target.getStyle();
    const position = 'absolute';
    const relPos = [position, 'relative'];
    opts.onStart?.(this._getDragData());
    if (isTran) return;

    if (style.position !== position) {
      let { left, top, width, height } = Canvas.offset(target.getEl()!);
      let parent = target.parent();
      let parentRel = null;

      do {
        const pStyle = parent?.getStyle();
        const parentPosition = pStyle?.position as string | undefined;
        if (parentPosition) {
          parentRel = relPos.indexOf(parentPosition) >= 0 ? parent : null;
        }
        parent = parent?.parent();
      } while (parent && !parentRel);

      if (opts.center) {
        const { x, y } = Canvas.getMouseRelativeCanvas(event as MouseEvent);
        left = x;
        top = y;
      } else if (parentRel) {
        const offsetP = Canvas.offset(parentRel.getEl()!);
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

    this.guidesStatic = this.getGuidesStatic();
  }

  onDrag(event: Event) {
    const { guidesTarget, opts } = this;

    this.updateGuides(guidesTarget);
    opts.debug && guidesTarget?.forEach((item) => this.renderGuide(item));
    opts.guidesInfo && this.renderGuideInfo(guidesTarget?.filter((item) => item.active) ?? []);
    opts.onDrag?.(this._getDragData());

    this.opts.event = event;
    this.em.trigger(`${evName}:move`, this.getEventOpts());
  }

  onEnd(ev: Event, _dragger: any, opt: any) {
    const { editor, opts, id } = this;
    opts.onEnd?.(ev, opt, { event: ev, ...opt, ...this._getDragData() });
    editor.stopCommand(`${id}`);
    this.hideGuidesInfo();

    this.em.trigger(`${evName}:end`, this.getEventOpts());
  }

  hideGuidesInfo() {
    ['X', 'Y'].forEach((item) => {
      const guide = this[`elGuideInfo${item}` as ElGuideInfoKey];
      if (guide) guide.style.display = 'none';
    });
  }

  renderGuideInfo(guides: ComponentDragGuide[] = []) {
    this.hideGuidesInfo();

    const guidesMatched = this.getGuidesMatched(guides);

    guidesMatched.forEach((guideMatched) => {
      if (!this.opts.skipGuidesRender) {
        this.renderSingleGuideInfo(guideMatched);
      }

      this.em.trigger(`${evName}:active`, {
        ...this.getEventOpts(),
        ...guideMatched,
      });
    });
  }

  renderSingleGuideInfo(guideMatched: ComponentDragGuideMatched) {
    const { posFirst, posSecond, size, sizeRaw, guide, elGuideInfo, elGuideInfoCnt } = guideMatched;

    const axis = isUndefined(guide.x) ? 'y' : 'x';
    const isY = axis === 'y';

    const guideInfoStyle = elGuideInfo.style;

    guideInfoStyle.display = '';
    guideInfoStyle[isY ? 'top' : 'left'] = `${posFirst}px`;
    guideInfoStyle[isY ? 'left' : 'top'] = `${posSecond}px`;
    guideInfoStyle[isY ? 'width' : 'height'] = `${size}px`;

    elGuideInfoCnt.innerHTML = `${Math.round(sizeRaw)}px`;
  }

  getGuidesMatched(guides: ComponentDragGuide[] = []) {
    const { guidesStatic = [] } = this;
    return guides
      .map((guide) => {
        const { origin, x } = guide;
        const rectOrigin = this.getElementPos(origin);
        const axis = isUndefined(x) ? 'y' : 'x';
        const isY = axis === 'y';

        const origEdge1 = rectOrigin[isY ? 'left' : 'top'];
        const origEdge1Raw = rectOrigin.rect[isY ? 'left' : 'top'];
        const origEdge2 = isY ? origEdge1 + rectOrigin.width : origEdge1 + rectOrigin.height;
        const origEdge2Raw = isY ? origEdge1Raw + rectOrigin.rect.width : origEdge1Raw + rectOrigin.rect.height;

        const guidesMatched = guidesStatic
          .filter((guideStatic) => {
            const complementaryTypes: Record<string, string[]> = {
              l: ['r', 'x'],
              r: ['l', 'x'],
              x: ['l', 'r'],
              t: ['b', 'y'],
              b: ['t', 'y'],
              y: ['t', 'b'],
            };

            return guideStatic.type === guide.type || complementaryTypes[guide.type]?.includes(guideStatic.type);
          })
          .map((guideStatic) => {
            const { left, width, top, height } = guideStatic.originRect;
            const statEdge1 = isY ? left : top;
            const statEdge2 = isY ? left + width : top + height;
            return {
              gap: statEdge2 < origEdge1 ? origEdge1 - statEdge2 : statEdge1 - origEdge2,
              guide: guideStatic,
            };
          })
          .filter((item) => item.gap > 0)
          .sort((a, b) => a.gap - b.gap)
          .map((item) => item.guide)
          .filter((item) => {
            switch (guide.type) {
              case 'l':
              case 'r':
              case 'x':
                return Math.abs(item.x - guide.x) < 1;
              case 't':
              case 'b':
              case 'y':
                return Math.abs(item.y - guide.y) < 1;
              default:
                return false;
            }
          });

        const firstGuideMatched = guidesMatched[0];

        if (firstGuideMatched) {
          const { left, width, top, height, rect } = firstGuideMatched.originRect;
          const isEdge1 = isY ? left < rectOrigin.left : top < rectOrigin.top;
          const statEdge1 = isY ? left : top;
          const statEdge1Raw = isY ? rect.left : rect.top;
          const statEdge2 = isY ? left + width : top + height;
          const statEdge2Raw = isY ? rect.left + rect.width : rect.top + rect.height;
          const posFirst = isY ? guide.y : guide.x;
          const posSecond = isEdge1 ? statEdge2 : origEdge2;
          const size = isEdge1 ? origEdge1 - statEdge2 : statEdge1 - origEdge2;
          const sizeRaw = isEdge1 ? origEdge1Raw - statEdge2Raw : statEdge1Raw - origEdge2Raw;

          const elGuideInfo = this[`elGuideInfo${axis.toUpperCase()}` as ElGuideInfoKey]!;
          const elGuideInfoCnt = this[`elGuideInfoContent${axis.toUpperCase()}` as ElGuideInfoContentKey]!;

          return {
            guide,
            guidesStatic,
            matched: firstGuideMatched,
            posFirst,
            posSecond,
            size,
            sizeRaw,
            elGuideInfo,
            elGuideInfoCnt,
          };
        } else {
          return null;
        }
      })
      .filter(Boolean) as ComponentDragGuideMatched[];
  }

  toggleDrag(enable?: boolean) {
    const { ppfx, editor } = this;
    const methodCls = enable ? 'add' : 'remove';
    const classes = [`${ppfx}is__grabbing`];
    const { Canvas } = editor;
    const body = Canvas.getBody();
    classes.forEach((cls) => body.classList[methodCls](cls));
    Canvas[enable ? 'startAutoscroll' : 'stopAutoscroll']();
  }
}

interface ComponentDragOpts {
  target: Component;
  center?: number;
  debug?: boolean;
  dragger?: DraggerOptions;
  event?: Event;
  guidesInfo?: number;
  mode?: 'absolute' | 'translate';
  skipGuidesRender?: boolean;
  addStyle?: (data: { component?: Component; styles?: Record<string, unknown>; partial?: boolean }) => void;
  onStart?: (data: any) => any;
  onDrag?: (data: any) => any;
  onEnd?: (ev: Event, opt: any, data: any) => void;
}

/**
 * Represents the properties of the drag events.
 */
export interface ComponentDragEventProps {
  mode: ComponentDragOpts['mode'];
  target: Component;
  component: Component;
  guidesTarget: ComponentDragGuide[];
  guidesStatic: ComponentDragGuide[];
  guidesMatched: ComponentDragGuideMatched[];
  command: ComponentDragProps & CommandAbstract<ComponentDragOpts>;
}

interface ComponentDragGuide {
  type: string;
  y: number;
  x: number;
  component: Component;
  componentView: ComponentView;
  origin: HTMLElement;
  componentEl: HTMLElement;
  originRect: ComponentOrigRect;
  componentElRect: ComponentOrigRect;
  guide?: HTMLElement;
  guideEl?: HTMLElement;
  active?: boolean;
}

interface ComponentDragGuideMatched {
  guidesStatic: ComponentDragGuide[];
  guide: ComponentDragGuide;
  matched: ComponentDragGuide;
  posFirst: number;
  posSecond: number;
  size: number;
  sizeRaw: number;
  elGuideInfo: HTMLElement;
  elGuideInfoCnt: HTMLElement;
}

interface ComponentOrigRect {
  top: number;
  left: number;
  width: number;
  height: number;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

type ElGuideInfoKey = 'elGuideInfoX' | 'elGuideInfoY';
type ElGuideInfoContentKey = 'elGuideInfoContentX' | 'elGuideInfoContentY';

interface ComponentDragProps {
  editor: Editor;
  em?: EditorModel;
  guides?: ComponentDragGuide[];
  guidesContainer?: HTMLElement;
  guidesEl?: HTMLElement;
  guidesStatic?: ComponentDragGuide[];
  guidesTarget?: ComponentDragGuide[];
  isTran?: boolean;
  opts: ComponentDragOpts;
  target: Component;
  elGuideInfoX?: HTMLElement;
  elGuideInfoY?: HTMLElement;
  elGuideInfoContentX?: HTMLElement;
  elGuideInfoContentY?: HTMLElement;
  dragger?: Dragger;

  getEventOpts: () => ComponentDragEventProps;
  stop: () => void;
  setupGuides: () => void;
  getGuidesContainer: () => HTMLElement;
  getGuidesStatic: () => ComponentDragGuide[];
  getGuidesTarget: () => ComponentDragGuide[];
  updateGuides: (guides?: ComponentDragGuide[]) => void;
  getGuidePosUpdate: (item: ComponentDragGuide, rect: ComponentOrigRect) => { x?: number; y?: number };
  renderGuide: (item: { active?: boolean; guide?: HTMLElement; x?: number; y?: number }) => HTMLElement | undefined;
  getElementPos: (el: HTMLElement) => ComponentOrigRect;
  getElementGuides: (el: HTMLElement) => ComponentDragGuide[];
  getTranslate: (transform: string, axis?: string) => number;
  setTranslate: (transform: string, axis: string, value: string) => string;
  getPosition: DraggerOptions['getPosition'];
  setPosition: (data: any) => void;
  _getDragData: () => { target: Component; parent?: Component; index?: number };
  onStart: DraggerOptions['onStart'];
  onDrag: DraggerOptions['onDrag'];
  onEnd: DraggerOptions['onEnd'];
  hideGuidesInfo: () => void;
  renderGuideInfo: (guides?: ComponentDragGuide[]) => void;
  renderSingleGuideInfo: (guideMatched: ComponentDragGuideMatched) => void;
  getGuidesMatched: (guides?: ComponentDragGuide[]) => ComponentDragGuideMatched[];
  toggleDrag: (enable?: boolean) => void;
}
