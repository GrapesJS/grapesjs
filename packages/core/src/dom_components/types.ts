import type {
  AddOptions,
  EventCallbackAdd,
  EventCallbackRemoveBefore,
  ObjectAny,
  OptionAsDocument,
  WithHTMLParserOptions,
} from '../common';
import type CssRule from '../css_composer/model/CssRule';
import type {
  ComponentResizeEventEndProps,
  ComponentResizeEventMoveProps,
  ComponentResizeEventStartProps,
  ComponentResizeEventUpdateProps,
} from '../commands/view/Resize';
import type { DataBindingImportPolicy, DataBindingImportSource } from '../data_sources/types';
import type { StyleProps } from '../domain_abstract/model/StyleableModel';
import type Selector from '../selector_manager/model/Selector';
import type Component from './model/Component';
import type { ResetFromStringOptions } from './model/Components';
import type { ComponentOptions, ComponentStackItem } from './model/types';
import type ComponentView from './view/ComponentView';

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
  parsedImportSource?: DataBindingImportSource;
  dataBindingImportPolicy?: DataBindingImportPolicy;
}

export enum ComponentsEvents {
  /**
   * @event `component:add` Component added. The callback receives the component and the options object.
   * This can also be triggered on component moves and clones, so you can check
   * `options.action` (`add-component`, `move-component`, `clone-component`) to distinguish the case.
   * @example
   * editor.on('component:add', (component, options) => {
   *  console.log(options.action);
   * });
   */
  add = 'component:add',

  /**
   * @event `component:remove` Component removed from the editor. This can also happen as part of a component move.
   * @example
   * editor.on('component:remove', (component) => { ... });
   */
  remove = 'component:remove',
  removeBefore = 'component:remove:before',
  removed = 'component:removed',
  clone = 'component:clone',

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
  updateProperty = 'component:update:',
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
  selected = 'component:selected',
  deselected = 'component:deselected',
  toggled = 'component:toggled',
  hover = 'component:hover',
  hoverBefore = 'component:hover:before',
  hovered = 'component:hovered',
  unhovered = 'component:unhovered',
  paste = 'component:paste',
  syncStyle = 'component:sync-style',
  typeAdd = 'component:type:add',
  typeUpdate = 'component:type:update',
  dragStart = 'component:drag:start',
  drag = 'component:drag',
  dragEnd = 'component:drag:end',

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
  content = 'component:content',

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

type ComponentEventStatic = Exclude<
  `${ComponentsEvents}`,
  `${ComponentsEvents.updateProperty}` | `${ComponentsEvents.styleUpdateProperty}`
>;

type SymbolMainEvent =
  | ComponentsEvents.symbolMainAdd
  | ComponentsEvents.symbolMainUpdate
  | ComponentsEvents.symbolMainUpdateDeep
  | ComponentsEvents.symbolMainRemove;

type SymbolInstanceEvent = ComponentsEvents.symbolInstanceAdd | ComponentsEvents.symbolInstanceRemove;

export type ComponentEvent =
  | ComponentEventStatic
  | `${ComponentsEvents.updateProperty}${string}`
  | `${ComponentsEvents.styleUpdateProperty}${string}`;

export interface ComponentScriptEventData {
  component: Component;
  view: ComponentView;
  el: HTMLElement;
}

export interface ComponentStyleUpdateEventData {
  style: StyleProps;
}

export interface ComponentUpdateEventData {
  component: Component;
  changed: ObjectAny;
  options: ObjectAny;
}

export interface ComponentTypeEventData extends Partial<Omit<ComponentStackItem, 'id'>> {
  id: string;
  [key: string]: any;
}

export interface ComponentDragEventData {
  target?: Component;
  parent?: Component;
  index?: number;
  cancelled?: boolean;
  [key: string]: unknown;
}

export interface ComponentResizeEventEndData {
  type: 'end';
  component: Component;
  el: HTMLElement;
}

export type ComponentResizeEventData =
  | ({ type: 'start' } & ComponentResizeEventStartProps)
  | ({ type: 'move' } & ComponentResizeEventMoveProps)
  | ComponentResizeEventEndData;

export interface ComponentResizeInitEventData {
  component: Component;
  hasCustomResize: boolean;
  resizable: Component['resizable'];
}

export interface ComponentRemovedEventData {
  removeOptions: ObjectAny;
}

export interface ComponentSyncStyleEventData {
  component: Component | undefined;
  selectors: Selector[];
  mediaText: string;
  rule: CssRule;
  ruleComponents: CssRule[];
  state: string;
}

export interface SymbolEventData {
  component: Component;
  changed?: ObjectAny;
  options?: ObjectAny;
}

export interface SymbolMainEventData extends SymbolEventData {
  event: SymbolMainEvent;
}

export interface SymbolInstanceEventData extends SymbolEventData {
  event: SymbolInstanceEvent;
}

export interface ComponentsEventCallback {
  [ComponentsEvents.add]: EventCallbackAdd<Component>;
  [ComponentsEvents.remove]: [Component];
  [ComponentsEvents.removeBefore]: EventCallbackRemoveBefore<Component>;
  [ComponentsEvents.removed]: [Component, ComponentRemovedEventData | undefined];
  [ComponentsEvents.clone]: [Component];
  [ComponentsEvents.create]: [Component, ComponentOptions];
  [ComponentsEvents.update]: [Component, ...any[]];
  [ComponentsEvents.updateInside]: [ComponentUpdateEventData];
  [ComponentsEvents.styleUpdate]: [Component, ComponentStyleUpdateEventData];
  [ComponentsEvents.select]: [Component, ObjectAny];
  [ComponentsEvents.selectBefore]: [Component, ObjectAny];
  [ComponentsEvents.selected]: [Component, ObjectAny];
  [ComponentsEvents.deselected]: [Component, ObjectAny];
  [ComponentsEvents.toggled]: [Component?, ObjectAny?];
  [ComponentsEvents.hover]: [Component | undefined, ObjectAny];
  [ComponentsEvents.hoverBefore]: [Component, ObjectAny];
  [ComponentsEvents.hovered]: [Component, ObjectAny];
  [ComponentsEvents.unhovered]: [Component, ObjectAny];
  [ComponentsEvents.paste]: [Component];
  [ComponentsEvents.syncStyle]: [ComponentSyncStyleEventData];
  [ComponentsEvents.typeAdd]: [ComponentTypeEventData];
  [ComponentsEvents.typeUpdate]: [ComponentTypeEventData];
  [ComponentsEvents.dragStart]: [ComponentDragEventData];
  [ComponentsEvents.drag]: [ComponentDragEventData];
  [ComponentsEvents.dragEnd]: [ComponentDragEventData];
  [ComponentsEvents.mount]: [Component];
  [ComponentsEvents.scriptMount]: [ComponentScriptEventData];
  [ComponentsEvents.scriptMountBefore]: [ComponentScriptEventData];
  [ComponentsEvents.scriptUnmount]: [ComponentScriptEventData];
  [ComponentsEvents.render]: [ComponentScriptEventData];
  [ComponentsEvents.input]: [Component];
  [ComponentsEvents.content]: [Component | undefined, ResetFromStringOptions, string];
  [ComponentsEvents.resize]: [ComponentResizeEventData];
  [ComponentsEvents.resizeStart]: [ComponentResizeEventStartProps | ComponentResizeEventMoveProps];
  [ComponentsEvents.resizeMove]: [ComponentResizeEventMoveProps];
  [ComponentsEvents.resizeEnd]: [ComponentResizeEventEndProps];
  [ComponentsEvents.resizeUpdate]: [ComponentResizeEventUpdateProps];
  [ComponentsEvents.resizeInit]: [ComponentResizeInitEventData];
  [ComponentsEvents.symbolMainAdd]: [SymbolEventData];
  [ComponentsEvents.symbolMainUpdate]: [ComponentUpdateEventData];
  [ComponentsEvents.symbolMainUpdateDeep]: [ComponentUpdateEventData];
  [ComponentsEvents.symbolMainRemove]: [SymbolEventData];
  [ComponentsEvents.symbolMain]: [SymbolMainEventData];
  [ComponentsEvents.symbolInstanceAdd]: [SymbolEventData];
  [ComponentsEvents.symbolInstanceRemove]: [SymbolEventData];
  [ComponentsEvents.symbolInstance]: [SymbolInstanceEventData];
  [ComponentsEvents.symbol]: [];
  [key: `${ComponentsEvents.updateProperty}${string}`]: [Component, ...any[]];
  [key: `${ComponentsEvents.styleUpdateProperty}${string}`]: [Component, ComponentStyleUpdateEventData];
}

// need this to avoid the TS documentation generator to break
export default ComponentsEvents;
