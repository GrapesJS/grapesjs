import Layer from '../../style_manager/model/Layer';
import Layers from '../../style_manager/model/Layers';
import { SortableTreeNode } from './SortableTreeNode';

/**
 * Represents a node in the tree of Layers or Layer components.
 * Extends the SortableTreeNode class for handling tree sorting logic.
 */
export class LayerNode extends SortableTreeNode<Layer | Layers> {
  /**
   * Constructor for creating a new LayerNode instance.
   * @param model - The Layer or Layers model associated with this node.
   */
  constructor(model: Layer | Layers) {
    super(model);
  }

  /**
   * Get the list of children of this Layer or Layers component.
   * @returns An array of LayerNode instances representing the children.
   */
  getChildren(): LayerNode[] | null {
    if (this.model instanceof Layers) {
      return this.model.models.map((model) => new LayerNode(model));
    }

    return null;
  }

  /**
   * Get the parent LayerNode of this component, or null if it has no parent.
   * @returns The parent LayerNode or null.
   */
  getParent(): LayerNode | null {
    const collection = this.model instanceof Layer ? this.model.collection : null;
    return collection ? new LayerNode(collection as Layers) : null;
  }

  /**
   * Add a child LayerNode at a particular index in the Layers model.
   * @param node - The LayerNode to add as a child.
   * @param index - The position to insert the child.
   * @returns The newly added LayerNode.
   * @throws Error if trying to add to a Layer (not a Layers).
   */
  addChildAt(node: LayerNode, index: number) {
    if (this.model instanceof Layer) {
      throw Error('Cannot add a layer model to another layer model');
    }

    const newModel = this.model.add(node.model, { at: index });
    return new LayerNode(newModel);
  }

  /**
   * Remove a child LayerNode at a specified index in the Layers model.
   * @param index - The index of the child to remove.
   * @returns The removed LayerNode.
   * @throws Error if trying to remove from a Layer (not a Layers).
   */
  removeChildAt(index: number) {
    if (this.model instanceof Layer) {
      throw Error('Cannot remove a layer model from another layer model');
    }

    const child = this.model.at(index);
    if (child) {
      this.model.remove(child);
    }
  }

  /**
   * Get the index of a child LayerNode in the current Layers model.
   * @param node - The child LayerNode to find.
   * @returns The index of the child, or -1 if not found.
   */
  indexOfChild(node: LayerNode): number {
    if (!(node.model instanceof Layer) || !(this.model instanceof Layers)) {
      return -1;
    }
    return this.model.indexOf(node.model);
  }

  /**
   * Determine if a source LayerNode can be moved to a specific index.
   * @param source - The source LayerNode to be moved.
   * @param index - The index to move the source to.
   * @returns True if the source can be moved, false otherwise.
   */
  canMove(source: LayerNode, index: number): boolean {
    return this.model instanceof Layers && !!source.model;
  }

  /**
   * Get the view associated with this LayerNode's model.
   * @returns The associated view or undefined if none.
   */
  get view(): any {
    return this.model.view;
  }

  /**
   * Get the DOM element associated with this LayerNode's view.
   * @returns The associated HTMLElement or undefined.
   */
  get element(): HTMLElement | undefined {
    return this.view?.el;
  }

  get model(): Layer | Layers {
    return this._model;
  }
}
