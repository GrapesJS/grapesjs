/**{START_EVENTS}*/
export enum SelectorEvents {
  /**
   * @event `selector:add` Selector added. The Selector is passed as an argument to the callback.
   * @example
   * editor.on('selector:add', (selector) => { ... });
   */
  add = 'selector:add',

  /**
   * @event `selector:remove` Selector removed. The Selector is passed as an argument to the callback.
   * @example
   * editor.on('selector:remove', (selector) => { ... });
   */
  remove = 'selector:remove',

  /**
   * @event `selector:remove:before` Before selector remove. The Selector is passed as an argument to the callback.
   * @example
   * editor.on('selector:remove:before', (selector) => { ... });
   */
  removeBefore = 'selector:remove:before',

  /**
   * @event `selector:update` Selector updated. The Selector and the object containing changes are passed as arguments to the callback.
   * @example
   * editor.on('selector:update', (selector, changes) => { ... });
   */
  update = 'selector:update',

  /**
   * @event `selector:state` States changed. An object containing all the available data about the triggered event is passed as an argument to the callback.
   * @example
   * editor.on('selector:state', (state) => { ... });
   */
  state = 'selector:state',

  /**
   * @event `selector:custom` Custom selector event. An object containing states, selected selectors, and container is passed as an argument.
   * @example
   * editor.on('selector:custom', ({ states, selected, container }) => { ... });
   */
  custom = 'selector:custom',

  /**
   * @event `selector` Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
   * @example
   * editor.on('selector', ({ event, selector, changes, ... }) => { ... });
   */
  all = 'selector',
}
/**{END_EVENTS}*/

export type SelectorStringObject = string | { name?: string; label?: string; type?: number };

// need this to avoid the TS documentation generator to break
export default SelectorEvents;
