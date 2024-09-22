import { View } from '../../common';
import Component from '../../dom_components/model/Component';
import { SortableTreeNode } from './SortableTreeNode';

/**
 * Abstract class that defines the basic structure for a ComponentNode.
 * This class cannot be instantiated directly, and requires subclasses
 * to implement the `view` and `element` methods.
 */
export abstract class BaseComponentNode extends SortableTreeNode<Component> {
  constructor(model: Component) {
    super(model);
  }

  /**
   * Get the list of children of this component.
   */
  getChildren(): BaseComponentNode[] | null {
    return this.model.components().map((comp: Component) => new (this.constructor as any)(comp));
  }

  /**
   * Get the parent component of this component, or null if it has no parent.
   */
  getParent(): BaseComponentNode | null {
    const parent = this.model.parent();
    return parent ? new (this.constructor as any)(parent) : null;
  }

  /**
   * Add a child component at a particular index.
   * @param node - The child component to add.
   * @param index - The position to insert the child at.
   */
  addChildAt(node: BaseComponentNode, index: number): BaseComponentNode {
    const insertingTextableIntoText = this.model?.isInstanceOf?.('text') && node?.model?.get?.('textable');
    if (insertingTextableIntoText) {
      // @ts-ignore
      return this.model?.getView?.()?.insertComponent?.(node?.model, { action: "add-component" });
    }

    const newModel = this.model.components().add(node.model, { at: index });
    return new (this.constructor as any)(newModel);
  }

  /**
   * Remove a child component at a particular index.
   * @param index - The index to remove the child component from.
   */
  removeChildAt(index: number): void {
    const child = this.model.components().at(index);
    if (child) {
      this.model.components().remove(child);
    }
  }

  /**
   * Get the index of a child component in the current component's list of children.
   * @param node - The child component to find.
   * @returns The index of the child component, or -1 if not found.
   */
  indexOfChild(node: BaseComponentNode): number {
    return this.model.components().indexOf(node.model);
  }

  /**
   * Determine if a source component can be moved to a specific index in the current component's list of children.
   * @param source - The source component to be moved.
   * @param index - The index at which the source component will be moved.
   * @returns True if the source component can be moved, false otherwise.
   */
  canMove(source: BaseComponentNode, index: number): boolean {
    return this.model.em.Components.canMove(this.model, source.model, index).result;
  }

  /**
   * Abstract method to get the associated view of the component.
   * Subclasses must implement this method.
   */
  abstract get view(): View<any, any>;

  /**
   * Abstract method to get the associated element of the component.
   * Subclasses must implement this method.
   */
  abstract get element(): HTMLElement | undefined;

  setContentEditable(value: boolean) {
    if (!this.element) return
    this.element.contentEditable = value ? 'true' : 'false';
  }

  disableEditing() {
    // @ts-ignore
    this.view?.disableEditing?.();
  }

  clearState() {
    this.model.set?.('status', '')
  }

  setSelectedParentState() {
    this.model.set?.('status', 'selected-parent')
  }

  isTextNode() {
    return this.model.isInstanceOf?.('text');
  }

  isTextable() {
    return this.model.get?.('textable');
  }
}
