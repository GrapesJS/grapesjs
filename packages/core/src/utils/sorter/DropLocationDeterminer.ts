import { $, View } from '../../common';

import EditorModel from '../../editor/model/Editor';
import { isTextNode, off, on } from '../dom';
import { getModel } from '../mixins';
import { SortableTreeNode } from './SortableTreeNode';
import { Dimension, Position, PositionOptions, SorterContainerContext, SorterDirection, SorterDragBehaviorOptions, SorterEventHandlers } from './types';
import { bindAll, each } from 'underscore';
import { matches, findPosition, offset, isInFlow } from './SorterUtils';

interface DropLocationDeterminerOptions<T, NodeType extends SortableTreeNode<T>> {
  em: EditorModel;
  treeClass: new (model: T) => NodeType;
  containerContext: SorterContainerContext;
  positionOptions: PositionOptions;
  dragBehavior: SorterDragBehaviorOptions;
  eventHandlers: SorterEventHandlers<NodeType>;
}

export class DropLocationDeterminer<T, NodeType extends SortableTreeNode<T>> extends View {
  em: EditorModel;
  treeClass: new (model: any) => NodeType;

  positionOptions: PositionOptions;
  containerContext: SorterContainerContext;
  dragBehavior: SorterDragBehaviorOptions;
  eventHandlers: SorterEventHandlers<NodeType>;

  targetNode?: NodeType;
  lastPos?: Position;
  targetDimensions?: Dimension[];
  sourceNodes!: NodeType[];
  docs!: Document[];
  containerOffset: {
    top: number;
    left: number;
  }

  constructor(options: DropLocationDeterminerOptions<T, NodeType>) {
    super();
    this.treeClass = options.treeClass;
    this.em = options.em;
    this.containerContext = options.containerContext;
    this.positionOptions = options.positionOptions;
    this.dragBehavior = options.dragBehavior;
    this.eventHandlers = options.eventHandlers || {};
    bindAll(this, 'startSort', 'onMove', 'endMove', 'onDragStart');
    this.containerOffset = {
      top: 0,
      left: 0
    };
  }

  /**
   * Picking components to move
   * @param {HTMLElement[]} sourceElements
   * */
  startSort(sourceNodes: NodeType[]) {
    this.sourceNodes = sourceNodes;
    this.bindDragEventHandlers(this.docs);
  }

  private bindDragEventHandlers(docs: Document[]) {
    on(this.containerContext.container, 'dragstart', this.onDragStart);
    on(this.containerContext.container, 'mousemove dragover', this.onMove);
    on(docs, 'mouseup dragend touchend', this.endMove);
  }

  onMove(mouseEvent: MouseEvent): void {
    this.eventHandlers.onMouseMove?.(mouseEvent);
    const customTarget = this.containerContext.customTarget;
    this.cacheContainerPosition(this.containerContext.container);
    const { mouseXRelativeToContainer, mouseYRelativeToContainer } = this.getMousePositionRelativeToContainer(mouseEvent);

    let mouseTargetEl: HTMLElement | null = customTarget ? customTarget({ event: mouseEvent }) : mouseEvent.target as HTMLElement;
    const targetEl = this.getFirstElementWithAModel(mouseTargetEl);
    if (!targetEl) return

    const targetModel = $(targetEl)?.data("model");
    const mouseTargetNode = new this.treeClass(targetModel);
    const targetNode = this.getValidParentNode(mouseTargetNode);
    if (!targetNode) return
    const dims = this.dimsFromTarget(targetNode);
    const pos = findPosition(dims, mouseXRelativeToContainer, mouseYRelativeToContainer);

    this.eventHandlers.onPlaceholderPositionChange?.(dims, pos);
    this.eventHandlers.onTargetChange?.(this.targetNode, targetNode);
    this.targetNode = targetNode;
    this.lastPos = pos;
    this.targetDimensions = dims;

    // For compatibility with old sorter
    this.eventHandlers.legacyOnMoveClb?.({
      event: mouseEvent,
      target: this.sourceNodes.map(node => node.model),
      parent: this.targetNode.model,
      index: pos.index + (pos.method == 'after' ? 1 : 0),
    });

    this.em.trigger('sorter:drag', {
      target: targetEl,
      targetModel,
      sourceModel: this.sourceNodes.map(node => node.model),
      dims,
      pos,
      x: mouseXRelativeToContainer,
      y: mouseYRelativeToContainer,
    });
  }

  private onDragStart(mouseEvent: MouseEvent): void {
    this.eventHandlers.onDragStart && this.eventHandlers.onDragStart(mouseEvent);
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

  private getValidParentNode(targetNode: NodeType) {
    let finalNode = targetNode;
    // TODO change the hard coded values
    while (finalNode.getParent() !== null) {
      const canMove = this.sourceNodes.some(node => finalNode.canMove(node, 0));
      if (canMove) break
      finalNode = finalNode.getParent()! as NodeType;
    }

    return finalNode;
  }

  /**
   * End the move action.
   * Handles the cleanup and final steps after an item is moved.
  */
  endMove(): void {
    const targetNode = this.targetNode;
    const lastPos = this.lastPos;
    let index = -1;
    if (lastPos) {
      index = lastPos.method === 'after' ? lastPos.indexEl + 1 : lastPos.indexEl
    }
    this.eventHandlers.onDrop?.(targetNode, this.sourceNodes, index)
    this.eventHandlers.onEndMove?.()
    this.cleanupEventListeners();
    this.triggerOnDragEndEvent();
  }

  private triggerOnDragEndEvent() {
    const targetNode = this.targetNode;
    const lastPos = this.lastPos;
    this.em.trigger('sorter:drag:end', {
      targetCollection: this.targetNode ? this.targetNode.getChildren() : null,
      modelToDrop: this.sourceNodes.map(node => node.model),
      warns: [''],
      validResult: {
        result: true,
        src: this.sourceNodes.map(node => node.element),
        srcModel: this.sourceNodes.map(node => node.model),
        trg: targetNode?.element,
        trgModel: targetNode?.model,
        draggable: true,
        droppable: true,
      },
      dst: targetNode?.element,
      srcEl: this.sourceNodes.map(node => node.element),
    });
    return { lastPos, targetNode };
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
    off(container, 'dragstart', this.onDragStart);
    off(container, 'mousemove dragover', this.onMove);
    off(docs, 'mouseup dragend touchend', this.endMove);
  }

  /**
   * Get dimensions of nodes relative to the coordinates.
   *
   * @param {NodeType} targetNode - The target node.
   * @private
   */
  private dimsFromTarget(targetNode: NodeType): Dimension[] {
    return this.getChildrenDim(targetNode);
  }

  /**
   * Get children dimensions
   * @param {NodeType} el Element root
   * @return {Array}
   * */
  private getChildrenDim(targetNode: NodeType) {
    const dims: Dimension[] = [];
    const containerOffset = this.containerOffset;
    const targetElement = targetNode.element;
    if (!!!targetElement) {
      return []
    };

    const children = targetNode.getChildren();
    // If no children, just use the dimensions of the target element
    if (!children || children.length === 0) {
      const targetDimensions = this.getDim(targetElement, containerOffset.left, containerOffset.top, this.positionOptions.relative!, !!this.positionOptions.canvasRelative, this.positionOptions.windowMargin!, this.em)
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
      const dim = this.getDim(el, containerOffset.left, containerOffset.top, this.positionOptions.relative!, !!this.positionOptions.canvasRelative, this.positionOptions.windowMargin!, this.em);
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
    let mouseYRelativeToContainer = mouseEvent.pageY - this.containerOffset.top + this.containerContext.container.scrollTop;
    let mouseXRelativeToContainer = mouseEvent.pageX - this.containerOffset.left + this.containerContext.container.scrollLeft;

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
  private cacheContainerPosition(container: HTMLElement): void {
    const containerOffset = offset(container);
    const containerOffsetTop = this.positionOptions.windowMargin ? Math.abs(containerOffset.top) : containerOffset.top;
    const containerOffsetLeft = this.positionOptions.windowMargin ? Math.abs(containerOffset.left) : containerOffset.left;

    this.containerOffset = {
      top: containerOffsetTop,
      left: containerOffsetLeft
    }
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
  private getDim(el: HTMLElement,
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
