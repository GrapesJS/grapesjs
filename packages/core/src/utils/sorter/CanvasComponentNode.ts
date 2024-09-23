import { BaseComponentNode } from './BaseComponentNode';

export default class CanvasComponentNode extends BaseComponentNode {
  /**
   * Get the associated view of this component.
   * @returns The view associated with the component, or undefined if none.
   */
  get view() {
    return this.model.getView?.();
  }

  /**
   * Get the associated element of this component.
   * @returns The Element associated with the component, or undefined if none.
   */
  get element() {
    return this.model.getEl?.();
  }
}
