import { isFunction } from 'underscore';
import CanvasComponentNode from './CanvasComponentNode';

export default class CanvasNewComponentNode extends CanvasComponentNode {
  /**
   * **Note:** For new components, this method will not directly add them to the target collection.
   * Instead, the adding logic is handled in `Droppable.ts` to accommodate dragging various content types,
   * such as images.
   */
  addChildAt(node: CanvasNewComponentNode, index: number): CanvasNewComponentNode {
    const insertingTextableIntoText = this.isTextNode() && node.isTextable();
    const content = isFunction(node._content) ? node._content() : node._content;
    let model;
    if (insertingTextableIntoText) {
      // @ts-ignore
      model = this.model?.getView?.()?.insertComponent?.(content, { action: 'add-component' });
    } else {
      model = this.model.components().add(content, { at: this.getRealIndex(index || -1), action: 'add-component' });
    }

    return new (this.constructor as any)(model);
  }

  set content(content: any) {
    this._content = content;
  }
}
