import CanvasComponentNode from './CanvasComponentNode';

export default class CanvasNewComponentNode extends CanvasComponentNode {
  /**
   * For new components, we will not add it to the target collection.
   */
  addChildAt(node: CanvasNewComponentNode, index: number): CanvasNewComponentNode {
    return new (this.constructor as any)(node.model);
  }
}
