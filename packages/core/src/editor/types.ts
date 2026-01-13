import { AssetEvent, AssetsEventCallback } from '../asset_manager/types';
import { BlockEvent, BlocksEventCallback } from '../block_manager/types';
import { CanvasEvent } from '../canvas';
import { CommandEvent } from '../commands';
import { LiteralUnion } from '../common';
import { DataSourceEvent, DataSourcesEventCallback } from '../data_sources/types';
import { ComponentEvent } from '../dom_components';
import { KeymapEvent } from '../keymaps';
import { ModalEvent } from '../modal_dialog';
import { RichTextEditorEvent } from '../rich_text_editor';
import { SelectorEvent } from '../selector_manager';
import { StyleManagerEvent } from '../style_manager';
import { EditorConfig } from './config/config';
import EditorModel from './model/Editor';

type GeneralEvent = 'canvasScroll' | 'undo' | 'redo' | 'load' | 'update';

type EditorBuiltInEvents =
  | DataSourceEvent
  | ComponentEvent
  | BlockEvent
  | AssetEvent
  | KeymapEvent
  | StyleManagerEvent
  | StorageEvent
  | CanvasEvent
  | SelectorEvent
  | RichTextEditorEvent
  | ModalEvent
  | CommandEvent
  | GeneralEvent;

export type EditorEvent = LiteralUnion<EditorBuiltInEvents, string>;

export type EditorConfigType = EditorConfig & { pStylePrefix?: string };

export type EditorModelParam<T extends keyof EditorModel, N extends number> = Parameters<EditorModel[T]>[N];

export interface EditorEventCallbacks extends AssetsEventCallback, BlocksEventCallback, DataSourcesEventCallback {
  [key: string]: any[];
}

export type EditorEventHandler<E extends EditorEvent> = E extends keyof EditorEventCallbacks
  ? (...args: EditorEventCallbacks[E]) => void
  : (...args: any[]) => void;

/**{START_EVENTS}*/
export enum EditorEvents {
  /**
   * @event `update` Event triggered on any change of the project (eg. component added/removed, style changes, etc.)
   * @example
   * editor.on('update', () => { ... });
   */
  update = 'update',
  updateBefore = 'updateBefore',

  /**
   * @event `undo` Undo executed.
   * @example
   * editor.on('undo', () => { ... });
   */
  undo = 'undo',

  /**
   * @event `redo` Redo executed.
   * @example
   * editor.on('redo', () => { ... });
   */
  redo = 'redo',

  /**
   * @event `load` Editor is loaded. At this stage, the project is loaded in the editor and elements in the canvas are rendered.
   * @example
   * editor.on('load', () => { ... });
   */
  load = 'load',

  /**
   * @event `project:load` Project JSON loaded in the editor. The event is triggered on the initial load and on the `editor.loadProjectData` method.
   * @example
   * editor.on('project:load', ({ project, initial }) => { ... });
   */
  projectLoad = 'project:load',

  /**
   * @event `project:loaded` Similar to `project:load`, but triggers only if the project is loaded successfully.
   * @example
   * editor.on('project:loaded', ({ project, initial }) => { ... });
   *
   * // Loading an empty project, won't trigger this event.
   * editor.loadProjectData({});
   */
  projectLoaded = 'project:loaded',

  /**
   * @event `project:get` Event triggered on request of the project data. This can be used to extend the project with custom data.
   * @example
   * editor.on('project:get', ({ project }) => { project.myCustomKey = 'value' });
   */
  projectGet = 'project:get',

  /**
   * @event `log` Log message triggered.
   * @example
   * editor.on('log', (msg, opts) => { ... });
   */
  log = 'log',

  /**
   * @event `telemetry:init` Initial telemetry data are sent.
   * @example
   * editor.on('telemetry:init', () => { ... });
   */
  telemetryInit = 'telemetry:init',

  /**
   * @event `destroy` Editor started destroy (on `editor.destroy()`).
   * @example
   * editor.on('destroy', () => { ... });
   */
  destroy = 'destroy',

  /**
   * @event `destroyed` Editor destroyed.
   * @example
   * editor.on('destroyed', () => { ... });
   */
  destroyed = 'destroyed',
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default EditorEvents;

export interface SelectComponentOptions {
  scroll?: boolean;
  activate?: boolean;
  event?: PointerEvent | MouseEvent | KeyboardEvent;
  abort?: boolean;
  useValid?: boolean;
  forceChange?: boolean;
}
