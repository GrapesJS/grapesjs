import { I18nConfig } from './config';

export type Messages = Required<I18nConfig>['messages'];

/**{START_EVENTS}*/
export enum I18nEvents {
  /**
   * @event `i18n:add` New set of messages is added.
   * @example
   * editor.on('i18n:add', (messages) => { ... });
   */
  add = 'i18n:add',

  /**
   * @event `i18n:update` The set of messages is updated.
   * @example
   * editor.on('i18n:update', (messages) => { ... });
   */
  update = 'i18n:update',

  /**
   * @event `i18n:locale` Locale changed.
   * @example
   * editor.on('i18n:locale', ({ value, valuePrev }) => { ... });
   */
  locale = 'i18n:locale',
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default I18nEvents;
