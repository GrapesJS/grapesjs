import ComponentTextView from '../dom_components/view/ComponentTextView';

export interface ModelRTE {
  currentView?: ComponentTextView;
}

export type RichTextEditorEvent = `${RichTextEditorEvents}`;

export interface RteDisableResult {
  forceSync?: boolean;
}

/**{START_EVENTS}*/
export enum RichTextEditorEvents {
  /**
   * @event `rte:enable` RTE enabled. The view, on which RTE is enabled, and the RTE instance are passed as arguments.
   * @example
   * editor.on('rte:enable', (view, rte) => { ... });
   */
  enable = 'rte:enable',

  /**
   * @event `rte:disable` RTE disabled. The view, on which RTE is disabled, and the RTE instance are passed as arguments.
   * @example
   * editor.on('rte:disable', (view, rte) => { ... });
   */
  disable = 'rte:disable',

  /**
   * @event `rte:custom` Custom RTE event. Object with enabled status, container, and actions is passed as an argument.
   * @example
   * editor.on('rte:custom', ({ enabled, container, actions }) => { ... });
   */
  custom = 'rte:custom',
}
/**{END_EVENTS}*/

// need this to avoid the TS documentation generator to break
export default RichTextEditorEvents;
