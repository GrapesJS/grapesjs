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

/**{START_EVENTS}*/
export enum CanvasEvents {
  /**
   * @event `canvas:dragenter` Something is dragged inside the canvas, `DataTransfer` instance passed as an argument.
   */
  dragEnter = 'canvas:dragenter',

  /**
   * @event `canvas:dragover` Something is dragging on the canvas, `DataTransfer` instance passed as an argument.
   */
  dragOver = 'canvas:dragover',

  /**
   * @event `canvas:dragend` When a drag operation is ended, `DataTransfer` instance passed as an argument.
   */
  dragEnd = 'canvas:dragend',

  /**
   * @event `canvas:dragdata` On any dataTransfer parse, `DataTransfer` instance and the `result` are passed as arguments.
   * By changing `result.content` you're able to customize what is dropped.
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
   * @event `canvas:refresh` Canvas was refreshed to update elements on top,
   * like spots/tools (eg. via `editor.Canvas.refresh()` or on frame resize).
   * @example
   * editor.on('canvas:refresh', (canvasRefreshOptions) => {
   *  console.log('Canvas refreshed with options:', canvasRefreshOptions);
   * });
   */
  refresh = 'canvas:refresh',

  /**
   * @event `canvas:frame:load` Frame loaded in canvas.
   * The event is triggered right after iframe's `onload`.
   * @example
   * editor.on('canvas:frame:load', ({ window }) => {
   *  console.log('Frame loaded', window);
   * });
   */
  frameLoad = 'canvas:frame:load',

  /**
   * @event `canvas:frame:load:head` Frame head loaded in canvas.
   * The event is triggered right after iframe's finished to load the head elemenets (eg. scripts)
   * @example
   * editor.on('canvas:frame:load:head', ({ window }) => {
   *  console.log('Frame head loaded', window);
   * });
   */
  frameLoadHead = 'canvas:frame:load:head',

  /**
   * @event `canvas:frame:load:body` Frame body loaded in canvas.
   * The event is triggered when the body is rendered with components.
   * @example
   * editor.on('canvas:frame:load:body', ({ window }) => {
   *  console.log('Frame completed the body render', window);
   * });
   */
  frameLoadBody = 'canvas:frame:load:body',
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default CanvasEvents;
