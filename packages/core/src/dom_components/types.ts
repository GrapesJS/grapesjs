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
  cloneRules?: boolean;
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
  removed = 'component:removed',

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
   * @event `component:styleUpdate` Component related styles are updated, the component is passed as an argument to the callback.
   * @example
   * editor.on('component:styleUpdate', (component) => { ... });
   */
  styleUpdate = 'component:styleUpdate',
  styleUpdateProperty = 'component:styleUpdate:',

  /**
   * @event `component:select` Component selected.
   * @example
   * editor.on('component:select', (component) => { ... });
   */
  select = 'component:select',
  selectBefore = 'component:select:before',

  /**
   * @event `component:mount` Component is mounted in the canvas.
   * @example
   * editor.on('component:mount', (component) => { ... });
   */
  mount = 'component:mount',

  /**
   * @event `component:script:mount` Component with script is mounted.
   * @example
   * editor.on('component:script:mount', ({ component, view, el }) => { ... });
   */
  scriptMount = 'component:script:mount',
  scriptMountBefore = 'component:script:mount:before',

  /**
   * @event `component:script:unmount` Component with script is unmounted. This is triggered when the component is removed or the script execution has to be refreshed. This event might be useful to clean up resources.
   * @example
   * editor.on('component:script:unmount', ({ component, view, el }) => { ... });
   */
  scriptUnmount = 'component:script:unmount',

  /**
   * @event `component:render` Component rendered in the canvas. This event could be triggered multiple times for the same component (eg. undo/redo, explicit rerender).
   * @example
   * editor.on('component:render', ({ component, view, el }) => { ... });
   */
  render = 'component:render',

  /**
   * @event `component:input` Event triggered on `input` DOM event. This is useful to catch direct input changes in the component (eg. Text component).
   * @example
   * editor.on('component:input', (component) => { ... });
   */
  input = 'component:input',

  /**
   * @event `component:resize` Component resized. This event is triggered when the component is resized in the canvas.
   * @example
   * editor.on('component:resize', ({ component, type }) => {
   *  // type can be 'start', 'move', or 'end'
   * });
   */
  resize = 'component:resize',

  /**
   * @event `component:resize:start` Component resize started. This event is triggered when the component starts being resized in the canvas.
   * @example
   * editor.on('component:resize:start', ({ component, event, ... }) => {})
   */
  resizeStart = 'component:resize:start',

  /**
   * @event `component:resize:move` Component resize in progress. This event is triggered while the component is being resized in the canvas.
   * @example
   * editor.on('component:resize:move', ({ component, event, ... }) => {})
   */
  resizeMove = 'component:resize:move',

  /**
   * @event `component:resize:end` Component resize ended. This event is triggered when the component stops being resized in the canvas.
   * @example
   * editor.on('component:resize:end', ({ component, event, ... }) => {})
   */
  resizeEnd = 'component:resize:end',

  /**
   * @event `component:resize:update` Component resize style update. This event is triggered when the component is resized in the canvas and the size is updated.
   * @example
   * editor.on('component:resize:update', ({ component, style, updateStyle, ... }) => {
   *  // If updateStyle is triggered during the event, the default style update will be skipped.
   *  updateStyle({ ...style, width: '...' })
   * })
   */
  resizeUpdate = 'component:resize:update',

  /**
   * @event `component:resize:init` Component resize init. This event allows you to control the resizer options dinamically.
   * @example
   * editor.on('component:resize:init', (opts) => {
   *  if (opts.component.is('someType')) {
   *   opts.resizable = true; // Update resizable options
   *  }
   * });
   */
  resizeInit = 'component:resize:init',

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
