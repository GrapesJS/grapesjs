import { View } from '../../common';
import Dimension from './Dimension';
import { DroppableZoneConfig } from './types';
import { DragSource } from './types';

/**
 * Base class for managing tree-like structures with sortable nodes.
 *
 * @template T - The type of the model that the tree nodes represent.
 */
export abstract class SortableTreeNode<T> {
  protected _model: T;
  protected _dragSource: DragSource<T>;
  protected _dropAreaConfig: DroppableZoneConfig = {
    ratio: 1,
    minUndroppableDimension: 0, // In px
    maxUndroppableDimension: 0, // In px
  };
  /** The dimensions of the node. */
  public nodeDimensions?: Dimension;
  /** The dimensions of the child elements within the target node. */
  public childrenDimensions?: Dimension[];
  constructor(model: T, dragSource: DragSource<T> = {}) {
    this._model = model;
    this._dragSource = dragSource;
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

  get dragSource() {
    return this._dragSource;
  }

  get dropArea(): Dimension | undefined {
    // If no parent, there's no reason to reduce the drop zone
    if (!this.getParent()) return this.nodeDimensions?.clone();
    return this.nodeDimensions?.getDropArea(this._dropAreaConfig);
  }

  /**
   * Checks if the given coordinates are within the bounds of this node.
   *
   * @param {number} x - The X coordinate to check.
   * @param {number} y - The Y coordinate to check.
   * @returns {boolean} - True if the coordinates are within bounds, otherwise false.
   */
  public isWithinDropBounds(x: number, y: number): boolean {
    return !!this.dropArea && this.dropArea.isWithinBounds(x, y);
  }

  equals(node?: SortableTreeNode<T>): node is SortableTreeNode<T> {
    return !!node?._model && this._model === node._model;
  }

  adjustDimensions(diff: { topDifference: number; leftDifference: number }) {
    if (diff.topDifference === 0 && diff.leftDifference === 0) return;

    this.nodeDimensions?.adjustDimensions(diff);
    this.childrenDimensions?.forEach((dims) => dims.adjustDimensions(diff));
  }
}
