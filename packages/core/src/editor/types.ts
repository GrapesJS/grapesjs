import { AssetEvent, AssetsEventCallback } from '../asset_manager/types';
import { BlockEvent, BlocksEventCallback } from '../block_manager/types';
import type { LiteralUnion, ObjectAny } from '../common';
import { CanvasEvent, CanvasEventCallback } from '../canvas/types';
import { CommandEvent, CommandsEventCallback } from '../commands/types';
import { DataSourceEvent, DataSourcesEventCallback } from '../data_sources/types';
import { DeviceEvent, DevicesEventCallback } from '../device_manager/types';
import { ComponentEvent, ComponentsEventCallback } from '../dom_components/types';
import { I18nEvent, I18nEventCallback } from '../i18n/types';
import { KeymapEvent, KeymapsEventCallback } from '../keymaps/types';
import { ModalEvent, ModalEventCallback } from '../modal_dialog/types';
import { LayerEvent, LayerEventCallback } from '../navigator/types';
import { PageEvent, PagesEventCallback } from '../pages/types';
import { ParserEvent, ParserEventCallback } from '../parser/types';
import { PluginEvent, PluginsEventCallback } from '../plugin_manager/types';
import { RichTextEditorEvent, RichTextEditorEventCallback } from '../rich_text_editor';
import { SelectorEvent, SelectorEventCallback } from '../selector_manager/types';
import type { ProjectData } from '../storage_manager';
import { StorageEvent, StorageEventCallback } from '../storage_manager/types';
import { StyleManagerEvent, StyleManagerEventCallback } from '../style_manager/types';
import { TraitEvent, TraitEventCallback } from '../trait_manager/types';
import { EditorConfig } from './config/config';
import type EditorModel from './model/Editor';
import type { EditorLoadOptions } from './model/Editor';

type EditorLogEvent =
  | `${EditorEvents.log}:${string}`
  | `${EditorEvents.log}-${string}`
  | `${EditorEvents.log}-${string}:${string}`;

type EditorCoreEvent = `${EditorEvents}` | EditorLogEvent | 'canvasScroll';

type EditorBuiltInEvents =
  | EditorCoreEvent
  | DataSourceEvent
  | DeviceEvent
  | I18nEvent
  | ComponentEvent
  | BlockEvent
  | AssetEvent
  | KeymapEvent
  | LayerEvent
  | PageEvent
  | ParserEvent
  | PluginEvent
  | StyleManagerEvent
  | StorageEvent
  | CanvasEvent
  | SelectorEvent
  | RichTextEditorEvent
  | TraitEvent
  | ModalEvent
  | CommandEvent;

export type EditorEvent = LiteralUnion<EditorBuiltInEvents, string>;

export type EditorConfigType = EditorConfig & { pStylePrefix?: string };

export type EditorModelParam<T extends keyof EditorModel, N extends number> = Parameters<EditorModel[T]>[N];

export interface EditorProjectEventData {
  project: ProjectData;
  options: EditorLoadOptions;
  initial: boolean;
}

export interface EditorProjectLoadEventData extends EditorProjectEventData {
  loaded: boolean;
}

export interface EditorProjectGetEventData {
  project: ProjectData;
}

export interface EditorLogEventOptions extends ObjectAny {
  ns?: string;
  level?: string;
}

export interface EditorEventCoreCallbacks {
  [EditorEvents.update]: [];
  [EditorEvents.updateBefore]: [Record<string, any>];
  [EditorEvents.undo]: [];
  [EditorEvents.redo]: [];
  [EditorEvents.load]: [EditorModel['Editor']];
  [EditorEvents.projectLoad]: [EditorProjectLoadEventData];
  [EditorEvents.projectLoaded]: [EditorProjectEventData];
  [EditorEvents.projectGet]: [EditorProjectGetEventData];
  [EditorEvents.log]: [string, EditorLogEventOptions];
  [EditorEvents.telemetryInit]: [];
  [EditorEvents.destroy]: [];
  [EditorEvents.destroyed]: [];
  [key: `log:${string}`]: [string, EditorLogEventOptions];
  [key: `log-${string}`]: [string, EditorLogEventOptions];
  [key: `log-${string}:${string}`]: [string, EditorLogEventOptions];
  canvasScroll: [];
}

export interface EditorEventCallbacks
  extends EditorEventCoreCallbacks,
    AssetsEventCallback,
    BlocksEventCallback,
    CanvasEventCallback,
    CommandsEventCallback,
    DataSourcesEventCallback,
    DevicesEventCallback,
    ComponentsEventCallback,
    I18nEventCallback,
    KeymapsEventCallback,
    LayerEventCallback,
    ModalEventCallback,
    PagesEventCallback,
    ParserEventCallback,
    PluginsEventCallback,
    RichTextEditorEventCallback,
    SelectorEventCallback,
    StorageEventCallback,
    StyleManagerEventCallback,
    TraitEventCallback {
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
