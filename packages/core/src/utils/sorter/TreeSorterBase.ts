import { $, View } from '../../common';

/**
 * Base class for managing tree-like structures with sortable nodes.
 * 
 * @template T - The type of the model that the tree nodes represent.
 */
export abstract class TreeSorterBase<T> {
  protected _model: T;
  constructor(model: T) {
    this._model = model;
  }
  /**
   * Get the list of children of this node.
   * 
   * @returns {TreeSorterBase<T>[] | null} - List of children or null if no children exist.
   */
  abstract getChildren(): TreeSorterBase<T>[] | null;

  /**
   * Get the parent node of this node, or null if it has no parent.
   * 
   * @returns {TreeSorterBase<T> | null} - Parent node or null if it has no parent.
   */
  abstract getParent(): TreeSorterBase<T> | null;

  /**
   * Add a child node at a particular index.
   * 
   * @param {TreeSorterBase<T>} node - The node to add.
   * @param {number} index - The position to insert the child node at.
   * @returns {TreeSorterBase<T>} - The added node.
   */
  abstract addChildAt(node: TreeSorterBase<T>, index: number): TreeSorterBase<T>;

  /**
   * Remove a child node at a particular index.
   * 
   * @param {number} index - The index to remove the child node from.
   */
  abstract removeChildAt(index: number): void;

  /**
   * Get the index of a child node in the current node's list of children.
   * 
   * @param {TreeSorterBase<T>} node - The node whose index is to be found.
   * @returns {number} - The index of the node, or -1 if the node is not a child.
   */
  abstract indexOfChild(node: TreeSorterBase<T>): number;

  /**
   * Determine if a node can be moved to a specific index in another node's children list.
   * 
   * @param {TreeSorterBase<T>} source - The node to be moved.
   * @param {number} index - The index at which the node will be inserted.
   * @returns {boolean} - True if the move is allowed, false otherwise.
   */
  abstract canMove(source: TreeSorterBase<T>, index: number): boolean;

  /**
   * Get the view associated with this node, if any.
   * 
   * @returns {View | undefined} - The view associated with this node, or undefined if none.
   */
  abstract get view(): View | undefined;

  /**
   * Get the HTML element associated with this node.
   * 
   * @returns {HTMLElement} - The associated HTML element.
   */
  abstract get element(): HTMLElement | undefined

  /**
   * Get the model associated with this node.
   * 
   * @returns {T} - The associated model.
   */
  get model(): T {
    return this._model;
  }
}
