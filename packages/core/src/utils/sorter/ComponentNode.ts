import Component from '../../dom_components/model/Component';
import { TreeSorterBase } from './TreeSorterBase';

export class ComponentNode extends TreeSorterBase<Component> {
  constructor(model: Component) {
    super(model);
  }

  /**
   * Get the list of children of this component.
   */
  getChildren(): ComponentNode[] {
    return this.model.components().map((comp: Component) => new ComponentNode(comp));
  }

  /**
   * Get the parent component of this component, or null if it has no parent.
   */
  getParent(): ComponentNode | null {
    const parent = this.model.parent();
    return parent ? new ComponentNode(parent) : null;
  }

  /**
   * Add a child component at a particular index.
   * @param node - The child component to add.
   * @param index - The position to insert the child at.
   */
  addChildAt(node: ComponentNode, index: number): ComponentNode {
    const newModel = this.model.components().add(node.model, { at: index });
    return new ComponentNode(newModel);
  }

  /**
   * Remove a child component at a particular index.
   * @param index - The index to remove the child component from.
   */
  removeChildAt(index: number): ComponentNode {
    const child = this.model.components().at(index);
    if (child) {
      this.model.components().remove(child);
    }
    return new ComponentNode(child);
  }

  /**
   * Get the index of a child component in the current component's list of children.
   * @param node - The child component to find.
   * @returns The index of the child component, or -1 if not found.
   */
  indexOfChild(node: ComponentNode): number {
    return this.model.components().indexOf(node.model);
  }

  /**
   * Determine if a source component can be moved to a specific index in the current component's list of children.
   * @param source - The source component to be moved.
   * @param index - The index at which the source component will be moved.
   * @returns True if the source component can be moved, false otherwise.
   */
  canMove(source: ComponentNode, index: number): boolean {
    return this.model.em.Components.canMove(this.model, source.model, index).result;
  }

  /**
   * Get the associated view of this component.
   * @returns The view associated with the component, or undefined if none.
   */
  // TODO add the correct type
  getView(): any {
    return this.model.getView();
  }

  getElement(): HTMLElement | undefined {
    return this.model.getEl();
  }
}
