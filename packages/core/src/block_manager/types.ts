import BlockManager from '.';
import Category, { CategoryProperties, ItemsByCategory } from '../abstract/ModuleCategory';
import {
  AddOptions,
  EventCallbackAdd,
  EventCallbackAll,
  EventCallbackRemove,
  EventCallbackRemoveBefore,
  EventCallbackUpdate,
} from '../common';
import Component from '../dom_components/model/Component';
import Block from './model/Block';

export interface BlocksByCategory extends ItemsByCategory<Block> {}

export interface BlocksCustomData {
  bm: BlockManager;
  blocks: Block[];
  container: HTMLElement | undefined;
  dragStart: (block: Block, ev?: Event) => void;
  drag: (ev: Event) => void;
  dragStop: (cancel?: boolean) => void;
}

export type BlockEvent = `${BlocksEvents}`;

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
   * @event `block:category:update` Block category updated.
   * @example
   * editor.on('block:category:update', ({ category, changes }) => { ... });
   */
  categoryUpdate = 'block:category:update',

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

export interface BlocksEventCallback {
  [BlocksEvents.add]: EventCallbackAdd<Block>;
  [BlocksEvents.remove]: EventCallbackRemove<Block>;
  [BlocksEvents.removeBefore]: EventCallbackRemoveBefore<Block>;
  [BlocksEvents.update]: EventCallbackUpdate<Block>;
  [BlocksEvents.dragStart]: [Block, DragEvent?];
  [BlocksEvents.drag]: [Block, DragEvent?];
  [BlocksEvents.dragEnd]: [Component | undefined, Block];
  [BlocksEvents.categoryUpdate]: [{ category: Category; changes: Partial<CategoryProperties>; options: AddOptions }];
  [BlocksEvents.custom]: [BlocksCustomData];
  [BlocksEvents.all]: EventCallbackAll<BlockEvent, Block>;
}

// need this to avoid the TS documentation generator to break
export default BlocksEvents;
