export interface ToScreenOption {
  toScreen?: boolean;
}

export interface ToWorldOption {
  toWorld?: boolean;
}

export interface GetBoxRectOptions extends ToScreenOption {
  local?: boolean;
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
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default CanvasEvents;
