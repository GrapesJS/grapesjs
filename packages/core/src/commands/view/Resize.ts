import { LiteralUnion, Position } from '../../common';
import Component from '../../dom_components/model/Component';
import { ComponentsEvents } from '../../dom_components/types';
import ComponentView from '../../dom_components/view/ComponentView';
import StyleableModel, { StyleProps } from '../../domain_abstract/model/StyleableModel';
import { getUnitFromValue } from '../../utils/mixins';
import Resizer, { RectDim, ResizerOptions } from '../../utils/Resizer';
import { CommandObject } from './CommandAbstract';

export interface ComponentResizeOptions extends ResizerOptions {
  component: Component;
  componentView?: ComponentView;
  el?: HTMLElement;
  afterStart?: () => void;
  afterEnd?: () => void;
  /**
   * When the element is using an absolute position, the resizer, by default, will try to
   * update position values (eg. 'top'/'left')
   */
  skipPositionUpdate?: boolean;
  /**
   * @deprecated
   */
  options?: ResizerOptions;
}

export interface ComponentResizeModelProperty {
  value: string;
  property: string;
  number: number;
  unit: string;
}

export interface ComponentResizeEventProps {
  component: Component;
  event: PointerEvent;
  el: HTMLElement;
  rect: RectDim;
}

export interface ComponentResizeEventStartProps extends ComponentResizeEventProps {
  model: StyleableModel;
  modelWidth: ComponentResizeModelProperty;
  modelHeight: ComponentResizeModelProperty;
}

export interface ComponentResizeEventMoveProps extends ComponentResizeEventProps {
  delta: Position;
  pointer: Position;
}

export interface ComponentResizeEventEndProps extends ComponentResizeEventProps {
  moved: boolean;
}

export interface ComponentResizeEventUpdateProps extends ComponentResizeEventProps {
  partial: boolean;
  delta: Position;
  pointer: Position;
  style: StyleProps;
  updateStyle: (styles?: StyleProps) => void;
  convertPxToUnit: (props: ConvertPxToUnitProps) => string;
}

export interface ConvertPxToUnitProps {
  el: HTMLElement;
  valuePx: number;
  unit?: LiteralUnion<ConvertUnitsToPx, string>;
  elComputedStyle?: CSSStyleDeclaration;
  /**
   * If true, the conversion will be done as height (requred for % units).
   */
  isHeight?: boolean;
  /**
   * @default 3
   */
  roundDecimals?: number;
  /**
   * DPI (Dots Per Inch) value to use for conversion.
   * @default 96
   */
  dpi?: number;
}

export enum ConvertUnitsToPx {
  pt = 'pt',
  pc = 'pc',
  in = 'in',
  cm = 'cm',
  mm = 'mm',
  vw = 'vw',
  vh = 'vh',
  vmin = 'vmin',
  vmax = 'vmax',
  svw = 'svw',
  lvw = 'lvw',
  dvw = 'dvw',
  svh = 'svh',
  lvh = 'lvh',
  dvh = 'dvh',
  perc = '%',
}

export default {
  run(editor, _, options: ComponentResizeOptions) {
    const { Canvas, Utils, em } = editor;
    const canvasView = Canvas.getCanvasView();
    const pfx = em.config.stylePrefix || '';
    const resizeClass = `${pfx}resizing`;
    const {
      onStart = () => {},
      onMove = () => {},
      onEnd = () => {},
      updateTarget = () => {},
      el: elOpts,
      componentView,
      component,
      skipPositionUpdate,
      ...resizableOpts
    } = options;
    const el = elOpts || componentView?.el || component.getEl()!;
    const resizeEventOpts = { component, el };
    let modelToStyle: StyleableModel;
    let elComputedStyle: CSSStyleDeclaration;

    const toggleBodyClass = (method: string, e: any, opts: any) => {
      const docs = opts.docs;
      docs &&
        docs.forEach((doc: Document) => {
          const body = doc.body;
          const cls = body.className || '';
          body.className = (method == 'add' ? `${cls} ${resizeClass}` : cls.replace(resizeClass, '')).trim();
        });
    };

    const resizeOptions: ResizerOptions = {
      appendTo: Canvas.getResizerEl(),
      prefix: editor.getConfig().stylePrefix,
      posFetcher: canvasView.getElementPos.bind(canvasView),
      mousePosFetcher: Canvas.getMouseRelativePos.bind(Canvas),
      docs: [document],
      updateOnMove: true,
      skipUnitAdjustments: true,
      onStart: (ev, opts) => {
        onStart(ev, opts);
        const { el, config, resizer } = opts;
        const { keyHeight, keyWidth, currentUnit, keepAutoHeight, keepAutoWidth } = config;
        toggleBodyClass('add', ev, opts);
        modelToStyle = em.Styles.getModelToStyle(component);
        elComputedStyle = getComputedStyle(el);
        const modelStyle = modelToStyle.getStyle();
        const rectStart = { ...resizer.startDim! };

        let currentWidth = modelStyle[keyWidth!] as string;
        config.autoWidth = keepAutoWidth && currentWidth === 'auto';
        if (isNaN(parseFloat(currentWidth))) {
          currentWidth = elComputedStyle[keyWidth as any];
        }

        let currentHeight = modelStyle[keyHeight!] as string;
        config.autoHeight = keepAutoHeight && currentHeight === 'auto';
        if (isNaN(parseFloat(currentHeight))) {
          currentHeight = elComputedStyle[keyHeight as any];
        }

        const valueWidth = parseFloat(currentWidth);
        const valueHeight = parseFloat(currentHeight);
        const unitWidth = getUnitFromValue(currentWidth);
        const unitHeight = getUnitFromValue(currentHeight);

        if (currentUnit) {
          config.unitWidth = unitWidth;
          config.unitHeight = unitHeight;
        }

        const eventProps: ComponentResizeEventStartProps = {
          ...resizeEventOpts,
          event: ev,
          rect: rectStart,
          model: modelToStyle,
          modelWidth: {
            value: currentWidth,
            property: keyWidth!,
            number: valueWidth,
            unit: unitWidth,
          },
          modelHeight: {
            value: currentHeight,
            property: keyHeight!,
            number: valueHeight,
            unit: unitHeight,
          },
        };
        editor.trigger(ComponentsEvents.resizeStart, eventProps);
        editor.trigger(ComponentsEvents.resize, { ...eventProps, type: 'start' });
        options.afterStart?.();
      },

      onMove: (event, opts) => {
        onMove(event, opts);
        const { resizer } = opts;
        const eventProps: ComponentResizeEventMoveProps = {
          ...resizeEventOpts,
          event,
          delta: resizer.delta!,
          pointer: resizer.currentPos!,
          rect: resizer.rectDim!,
        };
        editor.trigger(ComponentsEvents.resizeStart, eventProps);
        editor.trigger(ComponentsEvents.resize, { ...eventProps, type: 'move' });
      },

      onEnd: (event, opts) => {
        onEnd(event, opts);
        toggleBodyClass('remove', event, opts);
        const { resizer } = opts;
        const eventProps: ComponentResizeEventEndProps = {
          ...resizeEventOpts,
          event,
          rect: resizer.rectDim!,
          moved: resizer.moved,
        };
        editor.trigger(ComponentsEvents.resizeEnd, eventProps);
        editor.trigger(ComponentsEvents.resize, { ...resizeEventOpts, type: 'end' });
        options.afterEnd?.();
      },

      updateTarget: (_el, rect, options) => {
        updateTarget(_el, rect, options);
        if (!modelToStyle) {
          return;
        }

        const { store, selectedHandler, config, resizer, event } = options;
        const { keyHeight, keyWidth, autoHeight, autoWidth, unitWidth, unitHeight } = config;
        const onlyHeight = ['tc', 'bc'].indexOf(selectedHandler!) >= 0;
        const onlyWidth = ['cl', 'cr'].indexOf(selectedHandler!) >= 0;
        const partial = !store;
        const style: StyleProps = {};

        if (!onlyHeight) {
          const bodyw = Canvas.getBody()?.offsetWidth || 0;
          const width = rect.w < bodyw ? rect.w : bodyw;
          style[keyWidth!] = autoWidth
            ? 'auto'
            : this.convertPxToUnit({
                el,
                elComputedStyle,
                valuePx: width,
                unit: unitWidth,
              });
        }

        if (!onlyWidth) {
          style[keyHeight!] = autoHeight
            ? 'auto'
            : this.convertPxToUnit({
                el,
                elComputedStyle,
                valuePx: rect.h,
                unit: unitHeight,
                isHeight: true,
              });
        }

        if (!skipPositionUpdate && em.getDragMode(component)) {
          style.top = `${rect.t}px`;
          style.left = `${rect.l}px`;
        }

        let styleUpdated = false;

        const updateStyle = (customStyle?: StyleProps) => {
          styleUpdated = true;
          const finalStyle = { ...(customStyle || style), __p: partial };
          modelToStyle.addStyle(finalStyle, { avoidStore: partial });
          em.Styles.__emitCmpStyleUpdate(finalStyle as any, { components: component });
        };

        const eventProps: ComponentResizeEventUpdateProps = {
          ...resizeEventOpts,
          rect,
          partial,
          event,
          style,
          updateStyle,
          convertPxToUnit: (props: Omit<ConvertPxToUnitProps, 'el'>) =>
            this.convertPxToUnit({ el, elComputedStyle, ...props }),
          delta: resizer.delta!,
          pointer: resizer.currentPos!,
        };
        editor.trigger(ComponentsEvents.resizeUpdate, eventProps);
        !styleUpdated && updateStyle();
      },
      ...resizableOpts,
      ...options.options,
    };

    let { canvasResizer } = this;

    // Create the resizer for the canvas if not yet created
    if (!canvasResizer) {
      this.canvasResizer = new Utils.Resizer(resizeOptions);
      canvasResizer = this.canvasResizer;
    }

    canvasResizer.setOptions(resizeOptions, true);
    canvasResizer.blur();
    canvasResizer.focus(el);
    return canvasResizer;
  },

  stop() {
    this.canvasResizer?.blur();
  },

  convertPxToUnit(props: ConvertPxToUnitProps): string {
    const { el, valuePx, unit, dpi = 96, roundDecimals = 3, isHeight, elComputedStyle } = props;
    const win = el.ownerDocument.defaultView;
    const winWidth = win?.innerWidth || 1;
    const winHeight = window.innerHeight || 1;
    let valueResult = valuePx;
    let untiResult = unit;

    switch (unit) {
      case ConvertUnitsToPx.pt:
        valueResult = valuePx * (72 / dpi);
        break;
      case ConvertUnitsToPx.pc:
        valueResult = valuePx * (6 / dpi);
        break;
      case ConvertUnitsToPx.in:
        valueResult = valuePx / dpi;
        break;
      case ConvertUnitsToPx.cm:
        valueResult = valuePx / (dpi / 2.54);
        break;
      case ConvertUnitsToPx.mm:
        valueResult = valuePx / (dpi / 25.4);
        break;
      case ConvertUnitsToPx.vw:
        valueResult = (valuePx / winWidth) * 100;
        break;
      case ConvertUnitsToPx.vh:
        valueResult = (valuePx / winHeight) * 100;
        break;
      case ConvertUnitsToPx.vmin: {
        const vmin = Math.min(winWidth, winHeight);
        valueResult = (valuePx / vmin) * 100;
        break;
      }
      case ConvertUnitsToPx.vmax: {
        const vmax = Math.max(winWidth, winHeight);
        valueResult = (valuePx / vmax) * 100;
        break;
      }
      case ConvertUnitsToPx.perc: {
        const { parentElement, offsetParent } = el;
        const parentEl = elComputedStyle?.position === 'absolute' ? (offsetParent as HTMLElement) : parentElement;
        const parentWidth = parentEl?.offsetWidth || 1;
        const parentHeight = parentEl?.offsetHeight || 1;
        const parentSize = isHeight ? parentHeight : parentWidth;
        valueResult = (valuePx / parentSize) * 100;
        break;
      }
      case ConvertUnitsToPx.svw:
      case ConvertUnitsToPx.lvw:
      case ConvertUnitsToPx.dvw:
        valueResult = (valuePx / winWidth) * 100;
        break;
      case ConvertUnitsToPx.svh:
      case ConvertUnitsToPx.lvh:
      case ConvertUnitsToPx.dvh:
        valueResult = (valuePx / winHeight) * 100;
        break;
      default:
        untiResult = 'px';
    }

    return `${+valueResult.toFixed(roundDecimals)}${untiResult}`;
  },
} as CommandObject<
  ComponentResizeOptions,
  {
    canvasResizer?: Resizer;
    convertPxToUnit: (props: ConvertPxToUnitProps) => string;
  }
>;
