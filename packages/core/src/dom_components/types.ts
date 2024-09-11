import { AddOptions, OptionAsDocument, WithHTMLParserOptions } from '../common';
import Component from './model/Component';

export enum ActionLabelComponents {
  remove = 'component:remove',
  add = 'component:add',
  move = 'component:move',
}

export interface SymbolInfo {
  isSymbol: boolean;
  isMain: boolean;
  isInstance: boolean;
  isRoot: boolean;
  main?: Component;
  instances: Component[];
  relatives: Component[];
}

export interface ParseStringOptions extends AddOptions, OptionAsDocument, WithHTMLParserOptions {
  keepIds?: string[];
}

export enum ComponentsEvents {
  /**
   * @event `component:add` New component added.
   * @example
   * editor.on('component:add', (component) => { ... });
   */
  add = 'component:add',

  /**
   * @event `component:remove` Component removed.
   * @example
   * editor.on('component:remove', (component) => { ... });
   */
  remove = 'component:remove',
  removeBefore = 'component:remove:before',

  /**
   * @event `component:create` Component created.
   * @example
   * editor.on('component:create', (component) => { ... });
   */
  create = 'component:create',

  /**
   * @event `component:update` Component is updated, the component is passed as an argument to the callback.
   * @example
   * editor.on('component:update', (component) => { ... });
   */
  update = 'component:update',
  updateInside = 'component:update-inside',

  /**
   * @event `component:select` Component selected.
   * @example
   * editor.on('component:select', (component) => { ... });
   */
  select = 'component:select',
  selectBefore = 'component:select:before',

  /**
   * @event `symbol:main:add` Added new main symbol.
   * @example
   * editor.on('symbol:main:add', ({ component }) => { ... });
   */
  symbolMainAdd = 'symbol:main:add',

  /**
   * @event `symbol:main:update` Main symbol updated.
   * @example
   * editor.on('symbol:main:update', ({ component }) => { ... });
   */
  symbolMainUpdate = 'symbol:main:update',
  symbolMainUpdateDeep = 'symbol:main:update-deep',

  /**
   * @event `symbol:main:remove` Main symbol removed.
   * @example
   * editor.on('symbol:main:remove', ({ component }) => { ... });
   */
  symbolMainRemove = 'symbol:main:remove',

  /**
   * @event `symbol:main` Catch-all event related to main symbol updates.
   * @example
   * editor.on('symbol:main', ({ event, component }) => { ... });
   */
  symbolMain = 'symbol:main',

  /**
   * @event `symbol:instance:add` Added new root instance symbol.
   * @example
   * editor.on('symbol:instance:add', ({ component }) => { ... });
   */
  symbolInstanceAdd = 'symbol:instance:add',

  /**
   * @event `symbol:instance:remove` Root instance symbol removed.
   * @example
   * editor.on('symbol:instance:remove', ({ component }) => { ... });
   */
  symbolInstanceRemove = 'symbol:instance:remove',

  /**
   * @event `symbol:instance` Catch-all event related to instance symbol updates.
   * @example
   * editor.on('symbol:instance', ({ event, component }) => { ... });
   */
  symbolInstance = 'symbol:instance',

  /**
   * @event `symbol` Catch-all event for any symbol update (main or instance).
   * @example
   * editor.on('symbol', () => { ... });
   */
  symbol = 'symbol',
}
