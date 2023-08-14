import CanvasModule from '..';
import { ModuleModel } from '../../abstract';
import { BoxRect, LiteralUnion } from '../../common';
import Component from '../../dom_components/model/Component';
import Frame from './Frame';

export type CanvasSpotBuiltInType = 'select' | 'hover' | 'padding' | 'margin' | 'resize';

export type CanvasSpotType = LiteralUnion<CanvasSpotBuiltInType, string>;

/** @private */
export interface CanvasSpotProps<T = CanvasSpotType> {
  id: string;
  type: T;
  boxRect: BoxRect;
  component?: Component;
  frame?: Frame;
}

export default class CanvasSpot extends ModuleModel<CanvasModule, CanvasSpotProps> {
  defaults() {
    return {
      id: '',
      type: '',
      boxRect: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    };
  }
}
