import Component from '../../dom_components/model/Component';
import { SortableTreeNode } from './SortableTreeNode';

/**
 * BaseComponentNode is an abstract class that provides basic operations
 * for managing component nodes in a tree structure. It extends
 * SortableTreeNode to handle sorting behavior for components.
 * Subclasses must implement the `view` and `element` methods.
 */
export abstract class BaseComponentNode extends SortableTreeNode<Component> {
  private displayCache: Map<Component, boolean> = new Map();

  /**
   * Get the list of child components.
   * @returns {BaseComponentNode[] | null} - The list of children wrapped in
   * BaseComponentNode, or null if there are no children.
   */
  getChildren(): BaseComponentNode[] | null {
    return this.getDisplayedChildren();
  }

  /**
   * Get the list of displayed children, i.e., components that have a valid HTML element.
   * Cached values are used to avoid recalculating the display status unnecessarily.
   * @returns {BaseComponentNode[] | null} - The list of displayed children wrapped in
   * BaseComponentNode, or null if there are no displayed children.
   */
  private getDisplayedChildren(): BaseComponentNode[] | null {
    const children = this.model.components();
    const displayedChildren = children.filter((child) => this.isChildDisplayed(child));

    return displayedChildren.map((comp: Component) => new (this.constructor as any)(comp));
  }

  /**
   * Check if a child is displayed, using cached value if available.
   * @param {Component} child - The child component to check.
   * @returns {boolean} - Whether the child is displayed.
   */
  private isChildDisplayed(child: Component): boolean {
    // Check if display status is cached
    if (this.displayCache.has(child)) {
      return this.displayCache.get(child)!;
    }

    const element = child.getEl();
    const displayed = isDisplayed(element);

    // Cache the display status
    this.displayCache.set(child, displayed);

    return displayed;
  }

  /**
   * Get the parent component of this node.
   * @returns {BaseComponentNode | null} - The parent wrapped in BaseComponentNode,
   * or null if no parent exists.
   */
  getParent(): BaseComponentNode | null {
    const parent = this.model.parent();
    return parent ? new (this.constructor as any)(parent) : null;
  }

  /**
   * Add a child component to this node at the specified index.
   * @param {BaseComponentNode} node - The child node to add.
   * @param {number} displayIndex - The visual index at which to insert the child.
   * @param {{ action: string }} options - Options for the operation, with the default action being 'add-component'.
   * @returns {BaseComponentNode} - The newly added child node wrapped in BaseComponentNode.
   */
  addChildAt(
    node: BaseComponentNode,
    displayIndex: number,
    options: { action: string } = { action: 'add-component' },
  ): BaseComponentNode {
    const insertingTextableIntoText = this.model?.isInstanceOf?.('text') && node?.model?.get?.('textable');

    if (insertingTextableIntoText) {
      // @ts-ignore: Handle inserting textable components
      return this.model?.getView?.()?.insertComponent?.(node?.model, { action: options.action });
    }

    const newModel = this.model.components().add(node.model, {
      at: this.getRealIndex(displayIndex),
      action: options.action,
    });

    return new (this.constructor as any)(newModel);
  }

  /**
   * Remove a child component at the specified index.
   * @param {number} displayIndex - The visual index of the child to remove.
   * @param {{ temporary: boolean }} options - Whether to temporarily remove the child.
   */
  removeChildAt(displayIndex: number, options: { temporary: boolean } = { temporary: false }): void {
    const child = this.model.components().at(this.getRealIndex(displayIndex));
    if (child) {
      this.model.components().remove(child, options as any);
    }
  }

  /**
   * Get the visual index of a child node within the displayed children.
   * @param {BaseComponentNode} node - The child node to locate.
   * @returns {number} - The index of the child node, or -1 if not found.
   */
  indexOfChild(node: BaseComponentNode): number {
    return this.getDisplayIndex(node);
  }

  /**
   * Get the index of the given node within the displayed children.
   * @param {BaseComponentNode} node - The node to find.
   * @returns {number} - The display index of the node, or -1 if not found.
   */
  private getDisplayIndex(node: BaseComponentNode): number {
    const displayedChildren = this.getDisplayedChildren();
    return displayedChildren ? displayedChildren.findIndex((displayedNode) => displayedNode.model === node.model) : -1;
  }

  /**
   * Convert a display index to the actual index within the component's children array.
   * @param {number} index - The display index to convert.
   * @returns {number} - The corresponding real index, or -1 if not found.
   */
  getRealIndex(index: number): number {
    if (index === -1) return -1;

    let displayedCount = 0;
    const children = this.model.components();

    for (let i = 0; i < children.length; i++) {
      const child = children.at(i);
      const displayed = this.isChildDisplayed(child);

      if (displayed) displayedCount++;
      if (displayedCount === index + 1) return i;
    }

    return -1;
  }

  /**
   * Check if a source node can be moved to a specified index within this component.
   * @param {BaseComponentNode} source - The source node to move.
   * @param {number} index - The display index to move the source to.
   * @returns {boolean} - True if the move is allowed, false otherwise.
   */
  canMove(source: BaseComponentNode, index: number): boolean {
    return this.model.em.Components.canMove(this.model, source.model, this.getRealIndex(index)).result;
  }

  /**
   * Abstract method to get the view associated with this component.
   * Subclasses must implement this method.
   * @abstract
   */
  abstract get view(): any;

  /**
   * Abstract method to get the DOM element associated with this component.
   * Subclasses must implement this method.
   * @abstract
   */
  abstract get element(): HTMLElement | undefined;

  /**
   * Reset the state of the node by clearing its status and disabling editing.
   */
  restNodeState(): void {
    this.clearState();
    const { model } = this;
    this.setContentEditable(false);
    model.em.getEditing() === model && this.disableEditing();
  }

  /**
   * Set the contentEditable property of the node's DOM element.
   * @param {boolean} value - True to make the content editable, false to disable editing.
   */
  setContentEditable(value: boolean): void {
    if (this.element && this.isTextNode()) {
      this.element.contentEditable = value ? 'true' : 'false';
    }
  }

  /**
   * Disable editing capabilities for the component's view.
   * This method depends on the presence of the `disableEditing` method in the view.
   */
  private disableEditing(): void {
    // @ts-ignore
    this.view?.disableEditing?.();
  }

  /**
   * Clear the current state of the node by resetting its status.
   */
  private clearState(): void {
    this.model.set?.('status', '');
  }

  /**
   * Set the state of the node to 'selected-parent'.
   */
  setSelectedParentState(): void {
    this.model.set?.('status', 'selected-parent');
  }

  /**
   * Determine if the component is a text node.
   * @returns {boolean} - True if the component is a text node, false otherwise.
   */
  isTextNode(): boolean {
    return this.model.isInstanceOf?.('text');
  }

  /**
   * Determine if the component is textable.
   * @returns {boolean} - True if the component is textable, false otherwise.
   */
  isTextable(): boolean {
    return this.model.get?.('textable');
  }
}

/**
 * Function to check if an element is displayed in the DOM.
 * @param {HTMLElement | undefined} element - The element to check.
 * @returns {boolean} - Whether the element is displayed.
 */
function isDisplayed(element: HTMLElement | undefined): boolean {
  if (!element) return false;
  return (
    element instanceof HTMLElement &&
    window.getComputedStyle(element).display !== 'none' &&
    element.offsetWidth > 0 &&
    element.offsetHeight > 0
  );
}
