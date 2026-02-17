import {
  Collection,
  EventCallbackAdd,
  EventCallbackAll,
  EventCallbackRemove,
  EventCallbackRemoveBefore,
  EventCallbackUpdate,
  ObjectAny,
} from '../common';
import Selector from './model/Selector';
import Selectors from './model/Selectors';
import State from './model/State';

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

export type SelectorEvent = `${SelectorEvents}`;

export type SelectorStringObject = string | { name?: string; label?: string; type?: number };

export type SelectorStateEventData = State | Collection<State> | string;

export interface SelectorStateEventOptions extends ObjectAny {
  event?: string;
}

export interface SelectorCustomEventData {
  states: State[];
  selected: Selector[];
  container: HTMLElement | undefined;
}

export interface SelectorEventCallback {
  [SelectorEvents.add]: EventCallbackAdd<Selector>;
  [SelectorEvents.remove]: EventCallbackRemove<Selector>;
  [SelectorEvents.removeBefore]: EventCallbackRemoveBefore<Selector | undefined>;
  [SelectorEvents.update]: EventCallbackUpdate<Selector>;
  [SelectorEvents.state]: [SelectorStateEventData, SelectorStateEventOptions?];
  [SelectorEvents.custom]: [SelectorCustomEventData];
  [SelectorEvents.all]: EventCallbackAll<SelectorEvent, Selector | Selectors>;
}

// need this to avoid the TS documentation generator to break
export default SelectorEvents;
