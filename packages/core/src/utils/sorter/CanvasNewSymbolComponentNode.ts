import { isFunction } from 'underscore';
import CanvasComponentNode from './CanvasComponentNode';
import Component from '../../dom_components/model/Component';
import { isSymbol, getSymbolTop, isSymbolMain, getSymbolMain } from '../../dom_components/model/SymbolUtils';

/**
 * Extends `CanvasComponentNode` to handle symbol-based components within the canvas.
 */
export default class CanvasNewSymbolComponentNode extends CanvasComponentNode {
  private content: any;
  private dragSource: any;

  /**
   * @param rootSymbol - The root symbol component for this node.
   * @param content - Optional content associated with this node.
   * @param dragSource - Optional source for dragging operations.
   */
  constructor(rootSymbol: Component, content?: any, dragSource?: any) {
    super(rootSymbol);
    this.content = content;
    this.dragSource = dragSource;
  }

  /**
   * @param source - The source node to be moved.
   * @param index - The index where the node will be moved.
   * @returns `true` if the node can be moved, `false` otherwise.
   */
  canMove(source: CanvasNewSymbolComponentNode, index: number): boolean {
    // If the current target model is a symbol, check the target's root symbols
    if (isSymbol(this.model)) {
      const targetRootSymbol = getSymbolTop(this.model);
      const targetMainSymbol = isSymbolMain(targetRootSymbol) ? targetRootSymbol : getSymbolMain(targetRootSymbol);

      if (targetMainSymbol === source.model) {
        return false;
      }
    }

    return this.model.em.Components.canMove(this.model, source.dragSource, this.getRealIndex(index)).result;
  }

  /**
   * Adds a child node at the specified index. For text nodes, special logic is applied
   * to insert the node content into the text.
   *
   * @param node - The node to be added.
   * @param index - The position at which to add the node.
   * @returns The newly created `CanvasNewSymbolComponentNode`.
   */
  addChildAt(node: CanvasNewSymbolComponentNode, index: number): CanvasNewSymbolComponentNode {
    const insertingTextableIntoText = this.isTextNode() && node.isTextable();
    const content = isFunction(node.content) ? node.content() : node.content;

    let model;
    if (insertingTextableIntoText) {
      // @ts-ignore
      model = this.model?.getView?.()?.insertComponent?.(content, { action: 'add-component' });
    } else {
      model = this.model.components().add(content, {
        at: this.getRealIndex(index || -1),
        action: 'add-component',
      });
    }

    return new (this.constructor as any)(model);
  }
}
