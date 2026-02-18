import {
  AddOptions,
  EventCallbackRemove,
  EventCallbackRemoveBefore,
  EventCallbackUpdate,
  ObjectAny,
  SetOptions,
} from '../common';
import { ModuleConfig } from '../abstract/Module';
import Page from './model/Page';
import { PageProperties } from './model/Page';

export interface PageManagerConfig extends ModuleConfig {
  /**
   * Default pages.
   */
  pages?: PageProperties[];

  /**
   * ID of the page to select on editor load.
   */
  selected?: string;
}

export interface SelectableOption {
  /**
   * Select the page.
   */
  select?: boolean;
}

export interface AbortOption {
  abort?: boolean;
}

/**{START_EVENTS}*/
export enum PagesEvents {
  /**
   * @event `page:add` Added new page. The page is passed as an argument to the callback.
   * @example
   * editor.on('page:add', (page) => { ... });
   */
  add = 'page:add',
  addBefore = 'page:add:before',

  /**
   * @event `page:remove` Page removed. The page is passed as an argument to the callback.
   * @example
   * editor.on('page:remove', (page) => { ... });
   */
  remove = 'page:remove',
  removeBefore = 'page:remove:before',

  /**
   * @event `page:select` New page selected. The newly selected page and the previous one, are passed as arguments to the callback.
   * @example
   * editor.on('page:select', (page, previousPage) => { ... });
   */
  select = 'page:select',
  selectBefore = 'page:select:before',

  /**
   * @event `page:update` Page updated. The updated page and the object containing changes are passed as arguments to the callback.
   * @example
   * editor.on('page:update', (page, changes) => { ... });
   */
  update = 'page:update',

  /**
   * @event `page` Catch-all event for all the events mentioned above. An object containing all the available data about the triggered event is passed as an argument to the callback.
   * @example
   * editor.on('page', ({ event, model, ... }) => { ... });
   */
  all = 'page',
}
/**{END_EVENTS}*/

export type PageEvent = `${PagesEvents}`;

export interface PagesEventCallback {
  [PagesEvents.add]: [Page, AddOptions];
  [PagesEvents.addBefore]: [
    PageProperties,
    AddPage: () => Page | undefined,
    AddOptions & SelectableOption & AbortOption,
  ];
  [PagesEvents.remove]: EventCallbackRemove<Page>;
  [PagesEvents.removeBefore]: EventCallbackRemoveBefore<Page | undefined>;
  [PagesEvents.select]: [Page, Page | undefined];
  [PagesEvents.selectBefore]: [Page, SetOptions];
  [PagesEvents.update]: EventCallbackUpdate<Page>;
  [PagesEvents.all]: [{ event: string; page: Page; options: ObjectAny }];
}

// need this to avoid the TS documentation generator to break
export default PagesEvents;
