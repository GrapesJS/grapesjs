import CanvasModule from '..';
import { ModuleModel } from '../../abstract';
import { BoxRect, LiteralUnion } from '../../common';
import Component from '../../dom_components/model/Component';
import ComponentView from '../../dom_components/view/ComponentView';
import Frame from './Frame';

export enum CanvasSpotBuiltInTypes {
  Select = 'select',
  Hover = 'hover',
  Padding = 'padding',
  Margin = 'margin',
  Resize = 'resize',
}

export type CanvasSpotBuiltInType = `${CanvasSpotBuiltInTypes}`;

export type CanvasSpotType = LiteralUnion<CanvasSpotBuiltInType, string>;

/** @private */
export interface CanvasSpotBase<T extends CanvasSpotType> {
  id: string;
  type: T;
  boxRect?: BoxRect;
  component?: Component;
  componentView?: ComponentView;
  frame?: Frame;
}

/** @private */
export interface CanvasSpotProps<T extends CanvasSpotType = CanvasSpotType> extends CanvasSpotBase<T> {}

export default class CanvasSpot<T extends CanvasSpotProps = CanvasSpotProps> extends ModuleModel<CanvasModule, T> {
  defaults() {
    return {
      id: '',
      type: '',
    } as T;
  }

  get boxRect() {
    const { el, em } = this;
    const cvView = em.Canvas.getCanvasView();
    const boxRect = this.get('boxRect');

    if (boxRect) {
      return boxRect;
    } else if (el && cvView) {
      return cvView.getElBoxRect(el);
    }

    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };
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

  get style() {
    const { width, height, x, y } = this.boxRect;

    return {
      width,
      height,
      top: 0,
      left: 0,
      position: 'absolute',
      translate: `${x}px ${y}px`,
    };
  }

  isType<E extends T>(type: E['type']): this is CanvasSpot<E> {
    return this.type === type;
  }
}
