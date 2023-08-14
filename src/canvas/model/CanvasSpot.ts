import CanvasModule from '..';
import { ModuleModel } from '../../abstract';
import { BoxRect, LiteralUnion } from '../../common';
import Component from '../../dom_components/model/Component';
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
export interface CanvasSpotProps<T = CanvasSpotType> {
  id: string;
  type: T;
  boxRect?: BoxRect;
  component?: Component;
  frame?: Frame;
}

export default class CanvasSpot extends ModuleModel<CanvasModule, CanvasSpotProps> {
  defaults() {
    return {
      id: '',
      type: '',
    };
  }

  get boxRect() {
    return (
      this.get('boxRect') || {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      }
    );
  }

  get type() {
    return this.get('type') || '';
  }
}
