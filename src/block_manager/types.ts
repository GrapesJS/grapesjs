/**{START_EVENTS}*/
export enum BlocksEvents {
  /**
   * @event `block:add` New block added to the collection. The [Block] is passed as an argument to the callback.
   * @example
   * editor.on('block:add', (block) => { ... });
   */
  add = 'block:add',

  /**
   * @event `block:remove` Block removed from the collection. The [Block] is passed as an argument to the callback.
   * @example
   * editor.on('block:remove', (block) => { ... });
   */
  remove = 'block:remove',

  /**
   * @event `block:remove:before` Event triggered before Block remove.
   * @example
   * editor.on('block:remove:before', (block, remove, opts) => { ... });
   */
  removeBefore = 'block:remove:before',

  /**
   * @event `block:update` Block updated. The [Block] and the object containing changes are passed as arguments to the callback.
   * @example
   * editor.on('block:update', (block, updatedProps) => { ... });
   */
  update = 'block:update',

  /**
   * @event `block:drag:start` Started dragging block. The [Block] is passed as an argument.
   * @example
   * editor.on('block:drag:start', (block) => { ... });
   */
  dragStart = 'block:drag:start',

  /**
   * @event `block:drag` The block is dragging. The [Block] is passed as an argument.
   * @example
   * editor.on('block:drag', (block) => { ... });
   */
  drag = 'block:drag',

  /**
   * @event `block:drag:stop` Dragging of the block is stopped. The dropped [Component] (if dropped successfully) and the [Block] are passed as arguments.
   * @example
   * editor.on('block:drag:stop', (component, block) => { ... });
   */
  dragEnd = 'block:drag:stop',

  /**
   * @event `block:custom` Event to use in case of [custom Block Manager UI](https://grapesjs.com/docs/modules/Blocks.html#customization).
   * @example
   * editor.on('block:custom', ({ container, blocks, ... }) => { ... });
   */
  custom = 'block:custom',

  /**
   * @event `block` Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
   * @example
   * editor.on('block', ({ event, model, ... }) => { ... });
   */
  all = 'block',
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default BlocksEvents;
