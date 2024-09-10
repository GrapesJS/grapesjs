import Component from '../../dom_components/model/Component';
import { TreeSorterBase } from '../../utils/TreeSorterBase';

export class ComponentTreeSorter extends TreeSorterBase<Component> {
  constructor(model: Component) {
    super(model);
  }

  /**
   * Get the list of children of this component.
   */
  getChildren(): ComponentTreeSorter[] {
    return this.model.components().map((comp: Component) => new ComponentTreeSorter(comp));
  }

  /**
   * Get the parent component of this component, or null if it has no parent.
   */
  getParent(): ComponentTreeSorter | null {
    const parent = this.model.parent();
    return parent ? new ComponentTreeSorter(parent) : null;
  }

  /**
   * Add a child component at a particular index.
   * @param node - The child component to add.
   * @param index - The position to insert the child at.
   */
  addChildAt(node: ComponentTreeSorter, index: number): ComponentTreeSorter {
    const newModel = this.model.components().add(node.model, { at: index });
    return new ComponentTreeSorter(newModel);
  }

  /**
   * Remove a child component at a particular index.
   * @param index - The index to remove the child component from.
   */
  removeChildAt(index: number): ComponentTreeSorter {
    const child = this.model.components().at(index);
    if (child) {
      this.model.components().remove(child);
    }
    return new ComponentTreeSorter(child);
  }

  /**
   * Get the index of a child component in the current component's list of children.
   * @param node - The child component to find.
   * @returns The index of the child component, or -1 if not found.
   */
  indexOfChild(node: ComponentTreeSorter): number {
    return this.model.components().indexOf(node.model);
  }

  /**
   * Determine if a source component can be moved to a specific index in the current component's list of children.
   * @param source - The source component to be moved.
   * @param index - The index at which the source component will be moved.
   * @returns True if the source component can be moved, false otherwise.
   */
  canMove(source: ComponentTreeSorter, index: number): boolean {
    return this.model.em.Components.canMove(this.model, source.model, index).result;
  }

  /**
   * Get the associated view of this component.
   * @returns The view associated with the component, or undefined if none.
   */
  getView(): any {
    return this.model.getView();
  }

  /**
   * Get the associated DOM element of this component.
   * @returns The DOM element associated with the component, or undefined if none.
   */
  getEl(): HTMLElement | undefined {
    return this.model.getEl();
  }
}
