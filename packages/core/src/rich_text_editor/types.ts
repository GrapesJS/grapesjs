import type ComponentTextView from '../dom_components/view/ComponentTextView';
import type RichTextEditor from './model/RichTextEditor';
import type { RichTextEditorAction } from './model/RichTextEditor';

export interface ModelRTE {
  currentView?: ComponentTextView;
}

export type RichTextEditorEvent = `${RichTextEditorEvents}`;

export interface RteDisableResult {
  forceSync?: boolean;
}

export interface RichTextEditorCustomEventProps {
  enabled: boolean;
  container: HTMLElement;
  actions: RichTextEditorAction[];
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

export interface RichTextEditorEventCallback {
  [RichTextEditorEvents.enable]: [ComponentTextView, RichTextEditor];
  [RichTextEditorEvents.disable]: [ComponentTextView, RichTextEditor | undefined];
  [RichTextEditorEvents.custom]: [RichTextEditorCustomEventProps];
}

// need this to avoid the TS documentation generator to break
export default RichTextEditorEvents;
