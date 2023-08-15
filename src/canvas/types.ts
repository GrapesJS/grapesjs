export enum CanvasEvents {
  /**
   *  Something is dragged inside the canvas, `DataTransfer` instance passed as an argument.
   */
  dragEnter = 'canvas:dragenter',
  /**
   * Something is dragging on the canvas, `DataTransfer` instance passed as an argument.
   */
  dragOver = 'canvas:dragover',
  /**
   * When a drag operation is ended, `DataTransfer` instance passed as an argument.
   */
  dragEnd = 'canvas:dragend',
  /**
   * On any dataTransfer parse, `DataTransfer` instance and the `result` are passed as arguments.
   * By changing `result.content` you're able to customize what is dropped.
   */
  dragData = 'canvas:dragdata',
  /**
   * Something is dropped in canvas, `DataTransfer` instance and the dropped model are passed as arguments.
   */
  drop = 'canvas:drop',
  /**
   * Spots updated.
   * @example
   * editor.on('canvas:spot', () => {
   *  console.log('Spots', editor.Canvas.getSpots());
   * });
   */
  spot = 'canvas:spot',
  /**
   * New canvas spot added.
   * @example
   * editor.on('canvas:spot:add', ({ spot }) => {
   *  console.log('Spot added', spot);
   * });
   */
  spotAdd = 'canvas:spot:add',
  /**
   * Canvas spot updated.
   * @example
   * editor.on('canvas:spot:update', ({ spot }) => {
   *  console.log('Spot updated', spot);
   * });
   */
  spotUpdate = 'canvas:spot:update',
  /**
   * Canvas spot removed.
   * @example
   * editor.on('canvas:spot:remove', ({ spot }) => {
   *  console.log('Spot removed', spot);
   * });
   */
  spotRemove = 'canvas:spot:remove',
}
