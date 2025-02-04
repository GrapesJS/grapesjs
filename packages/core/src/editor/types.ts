/**{START_EVENTS}*/
export enum EditorEvents {
  /**
   * @event `update` Event triggered on any change of the project (eg. component added/removed, style changes, etc.)
   * @example
   * editor.on('update', () => { ... });
   */
  update = 'update',

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
