import CanvasModule from '..';
import { ModuleModel } from '../../abstract';
import { BoxRect, LiteralUnion } from '../../common';
import Component from '../../dom_components/model/Component';
import ComponentView from '../../dom_components/view/ComponentView';
import { GetBoxRectOptions } from '../types';
import Frame from './Frame';

export enum CanvasSpotBuiltInTypes {
  Select = 'select',
  Hover = 'hover',
  Spacing = 'spacing',
  Target = 'target',
  Resize = 'resize',
}

export type CanvasSpotBuiltInType = `${CanvasSpotBuiltInTypes}`;

export type CanvasSpotType = LiteralUnion<CanvasSpotBuiltInType, string>;

/** @private */
export interface CanvasSpotBase<T extends CanvasSpotType> {
  /**
   * Spot type, eg. `select`.
   */
  type: T;
  /**
   * Spot ID.
   */
  id: string;
  /**
   * Fixed box rect of the spot, eg. `{ width: 100, height: 100, x: 0, y: 0 }`.
   */
  boxRect?: BoxRect;
  /**
   * Component to which the spot will be attached.
   */
  component?: Component;
  /**
   * ComponentView to which the spot will be attached.
   */
  componentView?: ComponentView;
  frame?: Frame;
}

export interface CanvasSpotProps<T extends CanvasSpotType = CanvasSpotType> extends CanvasSpotBase<T> {}

/**
 * Canvas spots are elements drawn on top of the canvas. They can be used to represent anything you
 * might need but the most common use case of canvas spots is rendering information and managing
 * components rendered in the canvas.
 * Read here for more information about [Canvas Spots](https://grapesjs.com/docs/modules/Canvas.html#canvas-spots)
 *
 * [Component]: component.html
 *
 * @property {String} id Spot ID.
 * @property {String} type Spot type.
 * @property {[Component]} [component] Component to which the spot will be attached.
 * @property {ComponentView} [componentView] ComponentView to which the spot will be attached.
 * @property {Object} [boxRect] Fixed box rect of the spot, eg. `{ width: 100, height: 100, x: 0, y: 0 }`.
 *
 */
export default class CanvasSpot<T extends CanvasSpotProps = CanvasSpotProps> extends ModuleModel<CanvasModule, T> {
  defaults() {
    return {
      id: '',
      type: '',
    } as T;
  }

  get type() {
    return this.get('type') || '';
  }

  get component() {
    const cmp = this.get('component');
    return cmp || this.get('componentView')?.model;
  }

  get componentView() {
    const cmpView = this.get('componentView');
    return cmpView || this.get('component')?.getView();
  }

  get el() {
    return this.componentView?.el;
  }

  /**
   * Get the box rect of the spot.
   * @param {Object} [opts={}]
   * @returns {Object} The box rect object
   * @example
   * canvasSpot.getBoxRect();
   * // { width: 100, height: 50, x: 0, y: 0 }
   */
  getBoxRect(opts?: GetBoxRectOptions) {
    const { el, em } = this;
    const cvView = em.Canvas.getCanvasView();
    const boxRect = this.get('boxRect');

    if (boxRect) {
      return boxRect;
    } else if (el && cvView) {
      return cvView.getElBoxRect(el, opts);
    }

    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
  }

  /**
   * Get the style object of the spot.
   * @param {Object} [opts={}]
   * @returns {CSSStyleDeclaration} [opts]
   * @example
   * canvasSpot.getStyle();
   * // { width: '100px', height: '...', ... }
   */
  getStyle(opts: { boxRect?: BoxRect } & GetBoxRectOptions = {}): Partial<CSSStyleDeclaration> {
    const { width, height, x, y } = opts.boxRect || this.getBoxRect(opts);

    return {
      width: `${width}px`,
      height: `${height}px`,
      top: '0',
      left: '0',
      position: 'absolute',
      translate: `${x}px ${y}px`,
    };
  }

  /**
   * Check the spot type.
   * @param {String} type
   * @returns {Boolean}
   * @example
   * canvasSpot.isType('select');
   */
  isType<E extends T>(type: E['type']): this is CanvasSpot<E> {
    return this.type === type;
  }
}
