import { $, View } from '../../common';

/**
 * Base class for managing tree-like structures with sortable nodes.
 *
 * @template T - The type of the model that the tree nodes represent.
 */
export abstract class SortableTreeNode<T> {
  protected _model: T;
  protected _content: any;
  constructor(model: T, content?: any) {
    this._model = model;
    this._content = content;
  }
  /**
   * Get the list of children of this node.
   *
   * @returns {SortableTreeNode<T>[] | null} - List of children or null if no children exist.
   */
  abstract getChildren(): SortableTreeNode<T>[] | null;

  /**
   * Get the parent node of this node, or null if it has no parent.
   *
   * @returns {SortableTreeNode<T> | null} - Parent node or null if it has no parent.
   */
  abstract getParent(): SortableTreeNode<T> | null;

  /**
   * Add a child node at a particular index.
   *
   * @param {SortableTreeNode<T>} node - The node to add.
   * @param {number} index - The position to insert the child node at.
   * @returns {SortableTreeNode<T>} - The added node.
   */
  abstract addChildAt(node: SortableTreeNode<T>, index: number): SortableTreeNode<T>;

  /**
   * Remove a child node at a particular index.
   *
   * @param {number} index - The index to remove the child node from.
   */
  abstract removeChildAt(index: number): void;

  /**
   * Get the index of a child node in the current node's list of children.
   *
   * @param {SortableTreeNode<T>} node - The node whose index is to be found.
   * @returns {number} - The index of the node, or -1 if the node is not a child.
   */
  abstract indexOfChild(node: SortableTreeNode<T>): number;

  /**
   * Determine if a node can be moved to a specific index in another node's children list.
   *
   * @param {SortableTreeNode<T>} source - The node to be moved.
   * @param {number} index - The index at which the node will be inserted.
   * @returns {boolean} - True if the move is allowed, false otherwise.
   */
  abstract canMove(source: SortableTreeNode<T>, index: number): boolean;

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
  abstract get element(): HTMLElement | undefined;

  /**
   * Get the model associated with this node.
   *
   * @returns {T} - The associated model.
   */
  get model(): T {
    return this._model;
  }

  get content(): T {
    return this._content;
  }

  equals(node?: SortableTreeNode<T>): boolean {
    return !!node?._model && this._model === node._model;
  }
}
