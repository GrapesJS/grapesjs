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
   * @event `canvas:viewport` Canvas viewport updated (eg. zoom or coordinates).
   * @example
   * editor.on('canvas:viewport', () => {
   *  const { Canvas } = editor;
   *  console.log('Canvas, zoom:', Canvas.getZoom(), 'coords:', Canvas.getCoords());
   * });
   */
  viewport = 'canvas:viewport',

  /**
   * @event `canvas:viewport:start` Canvas viewport update started (eg. zooming or panning)
   * @example
   * editor.on('canvas:viewport:start', () => {
   *  console.log('viewport update started')
   * });
   */
  viewportStart = 'canvas:viewport:start',

  /**
   * @event `canvas:viewport:end` Canvas viewport update ended. This event is debounced on 300ms from the `canvas:viewport:start`.
   * @example
   * editor.on('canvas:viewport:end', () => {
   *  console.log('viewport updated ended')
   * });
   */
  viewportEnd = 'canvas:viewport:end',

  /**
   * @event `canvas:zoom` Canvas zoom updated.
   * @example
   * editor.on('canvas:zoom', () => {
   *  console.log('New canvas zoom:', editor.Canvas.getZoom());
   * });
   */
  zoom = 'canvas:zoom',
}
/**{END_EVENTS}*/
