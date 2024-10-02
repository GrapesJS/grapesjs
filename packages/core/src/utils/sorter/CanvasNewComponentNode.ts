import { isFunction } from 'underscore';
import CanvasComponentNode from './CanvasComponentNode';
import { getSymbolMain, getSymbolTop, isSymbol, isSymbolMain } from '../../dom_components/model/SymbolUtils';
import Component from '../../dom_components/model/Component';

export default class CanvasNewComponentNode extends CanvasComponentNode {
  canMove(source: CanvasNewComponentNode, index: number): boolean {
    const realIndex = this.getRealIndex(index);
    const { symbolModel, content, definition } = source._dragSource;

    const canMoveSymbol = !symbolModel || !this.isSourceSameSymbol(symbolModel);

    const sourceContent = isFunction(content) ? definition : content || source.model;
    const canMoveComponent = this.model.em.Components.canMove(this.model, sourceContent, realIndex).result;

    return canMoveComponent && canMoveSymbol;
  }

  addChildAt(node: CanvasNewComponentNode, index: number): CanvasNewComponentNode {
    const dragSource = node._dragSource;
    const insertingTextableIntoText = this.isTextNode() && node.isTextable();
    const content = isFunction(dragSource.content) ? dragSource.content() : dragSource.content;
    let model;
    if (insertingTextableIntoText) {
      // @ts-ignore
      model = this.model?.getView?.()?.insertComponent?.(content, { action: 'add-component' });
    } else {
      model = this.model.components().add(content, { at: this.getRealIndex(index), action: 'add-component' });
    }

    return new (this.constructor as any)(model);
  }

  private isSourceSameSymbol(symbolModel: Component | undefined) {
    if (isSymbol(this.model)) {
      const targetRootSymbol = getSymbolTop(this.model);
      const targetMainSymbol = isSymbolMain(targetRootSymbol) ? targetRootSymbol : getSymbolMain(targetRootSymbol);

      if (targetMainSymbol === symbolModel) {
        return true;
      }
    }

    return false;
  }

  set content(content: any) {
    this._dragSource.content = content;
  }
}
