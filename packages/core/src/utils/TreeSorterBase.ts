export abstract class TreeSorterBase<T> {
  model: T;
  constructor(model: T) {
    this.model = model;
  }
  /**
   * Get the list of children of this node.
   */
  abstract getChildren(): TreeSorterBase<T>[] | null;

  /**
   * Get the parent node of this node, or null if it has no parent.
   */
  abstract getParent(): TreeSorterBase<T> | null;

  /**
   * Add a child node at a particular index.
   * @param node - The node to add.
   * @param index - The position to insert the child node at.
   */
  abstract addChildAt(node: TreeSorterBase<T>, index: number): TreeSorterBase<T>;

  /**
   * Remove a child node at a particular index.
   * @param index - The index to remove the child node from.
   */
  abstract removeChildAt(index: number): TreeSorterBase<T>;

  /**
   * Get the index of a child node in the current node's list of children.
   * @param node - The node whose index is to be found.
   * @returns The index of the node, or -1 if the node is not a child.
   */
  abstract indexOfChild(node: TreeSorterBase<T>): number;

  /**
   * Method to determine if a node can be moved to a specific index in another node's children list.
   * @param node - The node to be moved.
   * @param target - The target node where the node will be moved.
   * @param index - The index at which the node will be inserted.
   * @returns CanMoveResult<T> - Result of whether the move is allowed and the reason.
   */
  abstract canMove(source: TreeSorterBase<T>, index: number): Boolean;
}
