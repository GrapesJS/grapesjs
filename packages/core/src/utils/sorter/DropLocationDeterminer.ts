import { $, View } from '../../common';

import EditorModel from '../../editor/model/Editor';
import { isTextNode, off, on } from '../dom';
import { getModel } from '../mixins';
import { SortableTreeNode } from './SortableTreeNode';
import { Dimension, Position, PositionOptions, SorterContainerContext, SorterDirection, SorterDragBehaviorOptions, SorterEventHandlers } from './types';
import { bindAll, each } from 'underscore';
import { matches, findPosition, offset, isInFlow } from './SorterUtils';

interface DropLocationDeterminerOptions<T> {
  em: EditorModel;
  treeClass: new (model: any) => SortableTreeNode<T>;
  containerContext: SorterContainerContext;
  positionOptions: PositionOptions;
  dragBehavior: SorterDragBehaviorOptions;
  eventHandlers?: SorterEventHandlers<T>;
}

export class DropLocationDeterminer<T> extends View {
  em?: EditorModel;
  treeClass!: new (model: any) => SortableTreeNode<T>;

  positionOptions!: PositionOptions;
  containerContext!: SorterContainerContext;
  dragBehavior!: SorterDragBehaviorOptions;
  eventHandlers?: SorterEventHandlers<T>;

  targetNode!: SortableTreeNode<T>;
  lastPos!: Position;
  targetDimensions?: Dimension[];
  sourceNode!: SortableTreeNode<T>;
  docs!: Document[];
  elT!: number;
  elL!: number;

  constructor(options: DropLocationDeterminerOptions<T>) {
    super();
    this.treeClass = options.treeClass;
    this.em = options.em;
    this.containerContext = options.containerContext;
    this.positionOptions = options.positionOptions;
    this.dragBehavior = options.dragBehavior;
    this.eventHandlers = options.eventHandlers;
    bindAll(this, 'startSort', 'onMove', 'endMove');
    this.elT = 0;
    this.elL = 0;
  }

  /**
   * Picking component to move
   * @param {HTMLElement} sourceElement
   * */
  startSort(sourceElement?: HTMLElement) {
    const sourceModel = $(sourceElement).data('model')
    const sourceNode = new this.treeClass(sourceModel);
    this.sourceNode = sourceNode;

    this.bindDragEventHandlers(this.docs);
  }

  private bindDragEventHandlers(docs: Document[]) {
    on(this.containerContext.container, 'dragstart', this.onDragStart);
    on(this.containerContext.container, 'mousemove dragover', this.onMove);
    on(docs, 'mouseup dragend touchend', this.endMove);
  }

  onMove(mouseEvent: MouseEvent): void {
    const customTarget = this.containerContext.customTarget;
    this.cacheContainerPosition();

    const { mouseXRelativeToContainer, mouseYRelativeToContainer } = this.getMousePositionRelativeToContainer(mouseEvent);

    let mouseTargetEl: HTMLElement | null = customTarget ? customTarget({ sorter: this, event: mouseEvent }) : mouseEvent.target;
    mouseTargetEl = this.getFirstElementWithAModel(mouseTargetEl);
    if (!mouseTargetEl) return

    const mouseTargetModel = $(mouseTargetEl)?.data("model");
    const mouseTargetNode = new this.treeClass(mouseTargetModel);
    const targetNode = this.getValidParentNode(mouseTargetNode);
    if (!targetNode) return
    const dims = this.dimsFromTarget(targetNode);
    const pos = findPosition(dims, mouseXRelativeToContainer, mouseYRelativeToContainer);

    this.eventHandlers?.onPlaceholderPositionChange && this.eventHandlers?.onPlaceholderPositionChange(dims, pos);
    this.eventHandlers?.onTargetChange && this.eventHandlers?.onTargetChange(this.targetNode, targetNode);
    this.targetNode = targetNode;
    this.eventHandlers?.onPlaceholderPositionChange && this.eventHandlers?.onPlaceholderPositionChange(dims, pos);
    this.lastPos = pos;
    this.targetDimensions = dims;
  }

  onDragStart(mouseEvent: MouseEvent): void {
    this.eventHandlers?.onDragStart && this.eventHandlers?.onDragStart(mouseEvent);
  }

  /**
   * Retrieves the first element that has a data model associated with it.
   * Traverses up the DOM tree from the given element until it reaches the container
   * or an element with a data model.
   * 
   * @param mouseTargetEl - The element to start searching from.
   * @returns The first element with a data model, or null if not found.
   */
  private getFirstElementWithAModel(mouseTargetEl: HTMLElement | null): HTMLElement | null {
    const isModelPresent = (el: HTMLElement) => $(el).data("model") !== undefined;

    while (mouseTargetEl && mouseTargetEl !== this.containerContext.container) {
      if (isModelPresent(mouseTargetEl)) {
        return mouseTargetEl;
      }

      mouseTargetEl = mouseTargetEl.parentElement;
    }

    return null;
  }

  private getValidParentNode(targetNode: SortableTreeNode<T>) {
    let finalNode = targetNode;
    // TODO change the hard coded 0 value
    while (!finalNode.canMove(this.sourceNode, 0) && finalNode.getParent() !== null) {
      finalNode = finalNode.getParent()!;
    }

    return finalNode;
  }

  /**
 * End the move action.
 * Handles the cleanup and final steps after an item is moved.
 */
  endMove(): void {
    let index = this.lastPos.method === 'after' ? this.lastPos.indexEl + 1 : this.lastPos.indexEl;
    // TODO fix the index for same collection dropping
    this.eventHandlers?.onDrop?.(this.targetNode, this.sourceNode, index)
    this.cleanupEventListeners();
  }

  /**
   * Clean up event listeners that were attached during the move.
  *
  * @param {HTMLElement} container - The container element.
  * @param {Document[]} docs - List of documents.
  * @private
  */
  private cleanupEventListeners(): void {
    const container = this.containerContext.container;
    const docs = this.docs;
    off(container, 'mousemove dragover', this.onMove);
    off(docs, 'mouseup dragend touchend', this.endMove);
  }

  /**
   * Get dimensions of nodes relative to the coordinates.
   *
   * @param {SortableTreeNode<T>} targetNode - The target node.
   * @private
   */
  private dimsFromTarget(targetNode: SortableTreeNode<T>): Dimension[] {
    return this.getChildrenDim(targetNode);
  }

  /**
   * Get children dimensions
   * @param {SortableTreeNode<T>} el Element root
   * @return {Array}
   * */
  private getChildrenDim(targetNode: SortableTreeNode<T>) {
    const dims: Dimension[] = [];
    const targetElement = targetNode.element;
    if (!!!targetElement) {
      return []
    };

    const children = targetNode.getChildren();
    // If no children, just use the dimensions of the target element
    if (!children || children.length === 0) {
      const targetDimensions = this.getDim(targetElement, this.elL, this.elT, this.positionOptions.relative!, !!this.positionOptions.canvasRelative, this.positionOptions.windowMargin!, this.em)
      return [targetDimensions]
    }

    each(children, (sortableTreeNode, i) => {
      const el = sortableTreeNode.element;
      if (!el) return
      const model = getModel(el, $);
      const elIndex = model && model.index ? model.index() : i;

      if (!isTextNode(el) && !matches(el, this.containerContext.itemSel)) {
        return;
      }

      // TODO
      const dim = this.getDim(el, this.elL, this.elT, this.positionOptions.relative!, !!this.positionOptions.canvasRelative, this.positionOptions.windowMargin!, this.em);
      let dir = this.dragBehavior.dragDirection;
      let dirValue: boolean;

      if (dir === SorterDirection.Vertical) dirValue = true;
      else if (dir === SorterDirection.Horizontal) dirValue = false;
      else dirValue = isInFlow(el, targetElement);

      dim.dir = dirValue;
      dim.el = el;
      dim.indexEl = elIndex;
      dims.push(dim);
    });

    return dims;
  }

  /**
 * Gets the mouse position relative to the container, adjusting for scroll and canvas relative options.
 *
 * @param {MouseEvent} mouseEvent - The current mouse event.
 * @return {{ mouseXRelativeToContainer: number, mouseYRelativeToContainer: number }} - The mouse X and Y positions relative to the container.
 * @private
 */
  private getMousePositionRelativeToContainer(mouseEvent: MouseEvent): { mouseXRelativeToContainer: number, mouseYRelativeToContainer: number } {
    const { em } = this;
    let mouseYRelativeToContainer = mouseEvent.pageY - this.elT + this.containerContext.container.scrollTop;
    let mouseXRelativeToContainer = mouseEvent.pageX - this.elL + this.containerContext.container.scrollLeft;

    if (this.positionOptions.canvasRelative && !!em) {
      const mousePos = em.Canvas.getMouseRelativeCanvas(mouseEvent, { noScroll: 1 });
      mouseXRelativeToContainer = mousePos.x;
      mouseYRelativeToContainer = mousePos.y;
    }

    return { mouseXRelativeToContainer, mouseYRelativeToContainer };
  }

  /**
 * Caches the container position and updates relevant variables for position calculation.
 *
 * @private
 */
  private cacheContainerPosition(): void {
    const containerOffset = offset(this.containerContext.container);
    this.elT = this.positionOptions.windowMargin ? Math.abs(containerOffset.top) : containerOffset.top;
    this.elL = this.positionOptions.windowMargin ? Math.abs(containerOffset.left) : containerOffset.left;
  }

  updateContainer(container: HTMLElement) {
    this.containerContext.container = container;
  }

  updateDocs(docs: Document[]) {
    this.docs = docs;
  }

  /**
 * Returns dimensions and positions about the element
 * @param {HTMLElement} el
 * @return {Dimension}
 */
  getDim(el: HTMLElement,
    elL: number,
    elT: number,
    relative: boolean,
    canvasRelative: boolean,
    windowMargin: number,
    em?: EditorModel
  ): Dimension {
    const canvas = em?.Canvas;
    const offsets = canvas ? canvas.getElementOffsets(el) : {};
    let top, left, height, width;

    if (canvasRelative && em) {
      const pos = canvas!.getElementPos(el, { noScroll: 1 })!;
      top = pos.top; // - offsets.marginTop;
      left = pos.left; // - offsets.marginLeft;
      height = pos.height; // + offsets.marginTop + offsets.marginBottom;
      width = pos.width; // + offsets.marginLeft + offsets.marginRight;
    } else {
      var o = offset(el);
      top = relative ? el.offsetTop : o.top - (windowMargin ? -1 : 1) * elT;
      left = relative ? el.offsetLeft : o.left - (windowMargin ? -1 : 1) * elL;
      height = el.offsetHeight;
      width = el.offsetWidth;
    }

    return { top, left, height, width, offsets };
  }
}
