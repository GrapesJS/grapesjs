import { ObjectAny } from '../common';

/**{START_EVENTS}*/
export enum ModalEvents {
  /**
   * @event `modal:open` Modal is opened
   * @example
   * editor.on('modal:open', () => { ... });
   */
  open = 'modal:open',

  /**
   * @event `modal:close` Modal is closed
   * @example
   * editor.on('modal:close', () => { ... });
   */
  close = 'modal:close',

  /**
   * @event `modal` Event triggered on any change related to the modal. An object containing all the available data about the triggered event is passed as an argument to the callback.
   * @example
   * editor.on('modal', ({ open, title, content, ... }) => { ... });
   */
  all = 'modal',
}
/**{END_EVENTS}*/

export type ModalEvent = `${ModalEvents}`;

export interface ModalEventData {
  open: boolean;
  attributes: ObjectAny;
  title: Node;
  content: Node;
  close: () => void;
}

export interface ModalEventCallback {
  [ModalEvents.open]: [];
  [ModalEvents.close]: [];
  [ModalEvents.all]: [ModalEventData];
}

// need this to avoid the TS documentation generator to break
export default ModalEvents;
