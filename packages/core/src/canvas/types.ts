import type Component from '../dom_components/model/Component';
import type Dragger from '../utils/Dragger';
import type { DraggableContent } from '../utils/sorter/types';
import type CanvasSpot from './model/CanvasSpot';
import type Frame from './model/Frame';
import type FrameView from './view/FrameView';
import { ObjectAny, SetOptions } from '../common';

export interface ToScreenOption {
  toScreen?: boolean;
}

export interface ToWorldOption {
  toWorld?: boolean;
}

export interface GetBoxRectOptions extends ToScreenOption {
  local?: boolean;
}

export interface CanvasRefreshOptions {
  /**
   * Refresh canvas spots.
   */
  spots?: boolean;
  all?: boolean;
}

export interface SetZoomOptions extends SetOptions {
  from?: string;
}

export interface CanvasDragDataResult {
  content: DraggableContent['content'];
  setContent: (content: DraggableContent['content']) => void;
}

export interface CanvasSpotEventProps {
  spot: CanvasSpot;
}

export interface CanvasFrameEventProps {
  el: HTMLIFrameElement;
  model: Frame;
  view: FrameView;
  window: Window;
}

export interface CanvasToolsUpdateEventProps extends ObjectAny {
  type: string;
}

/**{START_EVENTS}*/
export enum CanvasEvents {
  /**
   * @event `canvas:dragenter` Something is dragged inside the canvas. `DataTransfer` instance and dragged content are passed as arguments.
   */
  dragEnter = 'canvas:dragenter',

  /**
   * @event `canvas:dragover` Something is dragging on the canvas. Triggering event is passed as an argument.
   */
  dragOver = 'canvas:dragover',

  /**
   * @event `canvas:dragend` When a drag operation is ended, triggering event is passed as an argument.
   */
  dragEnd = 'canvas:dragend',

  /**
   * @event `canvas:dragdata` On any dataTransfer parse, `DataTransfer` instance and the `result` are passed as arguments. By changing `result.content` you're able to customize what is dropped.
   */
  dragData = 'canvas:dragdata',

  /**
   * @event `canvas:drop` Something is dropped in canvas, `DataTransfer` instance and the dropped model are passed as arguments.
   */
  drop = 'canvas:drop',

  /**
   * @event `canvas:spot` Spots updated.
   * @example
   * editor.on('canvas:spot', () => {
   *  console.log('Spots', editor.Canvas.getSpots());
   * });
   */
  spot = 'canvas:spot',

  /**
   * @event `canvas:spot:add` New canvas spot added.
   * @example
   * editor.on('canvas:spot:add', ({ spot }) => {
   *  console.log('Spot added', spot);
   * });
   */
  spotAdd = 'canvas:spot:add',

  /**
   * @event `canvas:spot:update` Canvas spot updated.
   * @example
   * editor.on('canvas:spot:update', ({ spot }) => {
   *  console.log('Spot updated', spot);
   * });
   */
  spotUpdate = 'canvas:spot:update',

  /**
   * @event `canvas:spot:remove` Canvas spot removed.
   * @example
   * editor.on('canvas:spot:remove', ({ spot }) => {
   *  console.log('Spot removed', spot);
   * });
   */
  spotRemove = 'canvas:spot:remove',

  /**
   * @event `canvas:coords` Canvas coordinates updated.
   * @example
   * editor.on('canvas:coords', () => {
   *  console.log('Canvas coordinates updated:', editor.Canvas.getCoords());
   * });
   */
  coords = 'canvas:coords',

  /**
   * @event `canvas:zoom` Canvas zoom updated.
   * @example
   * editor.on('canvas:zoom', () => {
   *  console.log('Canvas zoom updated:', editor.Canvas.getZoom());
   * });
   */
  zoom = 'canvas:zoom',

  /**
   * @event `canvas:pointer` Canvas pointer updated.
   * @example
   * editor.on('canvas:pointer', () => {
   *  console.log('Canvas pointer updated:', editor.Canvas.getPointer());
   * });
   */
  pointer = 'canvas:pointer',

  /**
   * @event `canvas:refresh` Canvas was refreshed to update elements on top, like spots/tools (eg. via `editor.Canvas.refresh()` or on frame resize).
   * @example
   * editor.on('canvas:refresh', (canvasRefreshOptions) => {
   *  console.log('Canvas refreshed with options:', canvasRefreshOptions);
   * });
   */
  refresh = 'canvas:refresh',

  /**
   * @event `canvas:update` Canvas was updated.
   */
  update = 'canvas:update',
  updateTools = 'canvas:updateTools',

  /**
   * @event `canvas:tools:update` Canvas tools were updated.
   */
  toolsUpdate = 'canvas:tools:update',

  /**
   * @event `canvas:move:start` Canvas move started.
   */
  moveStart = 'canvas:move:start',

  /**
   * @event `canvas:move` Canvas is moving.
   */
  move = 'canvas:move',

  /**
   * @event `canvas:move:end` Canvas move ended.
   */
  moveEnd = 'canvas:move:end',

  /**
   * @event `canvas:frame:load` Frame loaded in canvas. The event is triggered right after iframe's `onload`.
   * @example
   * editor.on('canvas:frame:load', ({ window }) => {
   *  console.log('Frame loaded', window);
   * });
   */
  frameLoad = 'canvas:frame:load',

  /**
   * @event `canvas:frame:load:head` Frame head loaded in canvas. The event is triggered right after iframe's finished to load the head elements (eg. scripts)
   * @example
   * editor.on('canvas:frame:load:head', ({ window }) => {
   *  console.log('Frame head loaded', window);
   * });
   */
  frameLoadHead = 'canvas:frame:load:head',

  /**
   * @event `canvas:frame:load:body` Frame body loaded in canvas. The event is triggered when the body is rendered with components.
   * @example
   * editor.on('canvas:frame:load:body', ({ window }) => {
   *  console.log('Frame completed the body render', window);
   * });
   */
  frameLoadBody = 'canvas:frame:load:body',

  /**
   * @event `canvas:frame:unload` Frame is unloading from the canvas.
   * @example
   * editor.on('canvas:frame:unload', ({ frame }) => {
   *  console.log('Unloading frame', frame);
   * });
   */
  frameUnload = 'canvas:frame:unload',
}
/**{END_EVENTS}*/

export type CanvasEvent = `${CanvasEvents}`;

export interface CanvasEventCallback {
  [CanvasEvents.dragEnter]: [DataTransfer | null | undefined, NonNullable<DraggableContent['content']>];
  [CanvasEvents.dragOver]: [Event];
  [CanvasEvents.dragEnd]: [Event | undefined];
  [CanvasEvents.dragData]: [DataTransfer | null | undefined, CanvasDragDataResult];
  [CanvasEvents.drop]: [DataTransfer | null | undefined, Component | Component[]];
  [CanvasEvents.spot]: [];
  [CanvasEvents.spotAdd]: [CanvasSpotEventProps];
  [CanvasEvents.spotUpdate]: [CanvasSpotEventProps];
  [CanvasEvents.spotRemove]: [CanvasSpotEventProps];
  [CanvasEvents.coords]: [];
  [CanvasEvents.zoom]: [{ options: SetZoomOptions }];
  [CanvasEvents.pointer]: [];
  [CanvasEvents.refresh]: [CanvasRefreshOptions];
  [CanvasEvents.update]: [Event | { options: SetZoomOptions } | undefined];
  [CanvasEvents.updateTools]: [];
  [CanvasEvents.toolsUpdate]: [CanvasToolsUpdateEventProps];
  [CanvasEvents.moveStart]: [Dragger];
  [CanvasEvents.move]: [Dragger];
  [CanvasEvents.moveEnd]: [Dragger];
  [CanvasEvents.frameLoad]: [CanvasFrameEventProps];
  [CanvasEvents.frameLoadHead]: [CanvasFrameEventProps];
  [CanvasEvents.frameLoadBody]: [CanvasFrameEventProps];
  [CanvasEvents.frameUnload]: [{ frame: Frame }];
}

// need this to avoid the TS documentation generator to break
export default CanvasEvents;
