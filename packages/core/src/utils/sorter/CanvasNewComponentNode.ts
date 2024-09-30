import CanvasComponentNode from './CanvasComponentNode';

export default class CanvasNewComponentNode extends CanvasComponentNode {
  /**
   * **Note:** For new components, this method will not directly add them to the target collection.
   * Instead, the adding logic is handled in `Droppable.ts` to accommodate dragging various content types,
   * such as images.
   */
  addChildAt(node: CanvasNewComponentNode, index: number): CanvasNewComponentNode {
    const insertingTextableIntoText = this.isTextNode() && node.isTextable();
    let model;
    if (insertingTextableIntoText) {
      // @ts-ignore
      model = this.model?.getView?.()?.insertComponent?.(node._content, { action: 'add-component' });
    } else {
      model = this.model
        .components()
        .add(node._content, { at: this.getRealIndex(index || -1), action: 'add-component' });
    }

    return new (this.constructor as any)(model);
  }

  set content(content: any) {
    this._content = content;
  }
}
