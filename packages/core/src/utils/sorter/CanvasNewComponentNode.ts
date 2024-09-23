import CanvasComponentNode from './CanvasComponentNode';

export default class CanvasNewComponentNode extends CanvasComponentNode {
  /**
   * **Note:** For new components, this method will not directly add them to the target collection.
   * Instead, the adding logic is handled in `Droppable.ts` to accommodate dragging various content types,
   * such as images.
   */
  addChildAt(node: CanvasNewComponentNode, index: number): CanvasNewComponentNode {
    return new (this.constructor as any)(node.model);
  }
}
