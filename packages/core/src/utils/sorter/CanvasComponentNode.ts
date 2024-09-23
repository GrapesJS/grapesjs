import { BaseComponentNode } from './BaseComponentNode';

export default class CanvasComponentNode extends BaseComponentNode {
  /**
   * Get the associated view of this component.
   * @returns The view associated with the component, or undefined if none.
   */
  // TODO add the correct type
  get view(): any {
    return this.model.getView?.();
  }

  /**
   * Get the associated element of this component.
   * @returns The Element associated with the component, or undefined if none.
   */
  get element(): HTMLElement | undefined {
    return this.model.getEl?.();
  }
}
