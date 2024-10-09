import { $, View } from '../../common';

import EditorModel from '../../editor/model/Editor';
import { isTextNode, off, on } from '../dom';
import { SortableTreeNode } from './SortableTreeNode';
import { Placement, PositionOptions, DragDirection, SorterEventHandlers, CustomTarget, DragSource } from './types';
import { bindAll, each } from 'underscore';
import { matches, findPosition, offset, isStyleInFlow } from './SorterUtils';
import { RateLimiter } from './RateLimiter';
import Dimension from './Dimension';

type ContainerContext = {
  container: HTMLElement;
  itemSel: string;
  customTarget?: CustomTarget;
  document: Document;
};

interface DropLocationDeterminerOptions<T, NodeType extends SortableTreeNode<T>> {
  em: EditorModel;
  treeClass: new (model: T, dragSource?: DragSource<T>) => NodeType;
  containerContext: ContainerContext;
  positionOptions: PositionOptions;
  dragDirection: DragDirection;
  eventHandlers: SorterEventHandlers<NodeType>;
}

/**
 * Represents the data related to the last move event during drag-and-drop sorting.
 * This type is discriminated by the presence or absence of a valid target node.
 */
type lastMoveData<NodeType> = {
  /** The target node under the mouse pointer during the last move. */
  targetNode?: NodeType;
  /** The node under the mouse pointer during this move*/
  hoveredNode?: NodeType;
  /** The index where the placeholder or dragged element should be inserted. */
  index?: number;
  /** Placement relative to the target ('before' or 'after'). */
  placement?: Placement;
  /** The mouse event, used if we want to move placeholder with scrolling. */
  mouseEvent?: MouseEvent;

  placeholderDimensions?: Dimension;
};

export class DropLocationDeterminer<T, NodeType extends SortableTreeNode<T>> extends View {
  em: EditorModel;
  treeClass: new (model: any, dragSource?: DragSource<T>) => NodeType;

  positionOptions: PositionOptions;
  containerContext: ContainerContext;
  dragDirection: DragDirection;
  eventHandlers: SorterEventHandlers<NodeType>;

  sourceNodes: NodeType[] = [];
  lastMoveData!: lastMoveData<NodeType>;
  containerOffset = {
    top: 0,
    left: 0,
  };
  private moveThreshold: number = 20;
  private rateLimiter: RateLimiter<MouseEvent>; // Rate limiter for onMove

  constructor(options: DropLocationDeterminerOptions<T, NodeType>) {
    super();
    this.treeClass = options.treeClass;
    this.em = options.em;
    this.containerContext = options.containerContext;
    this.positionOptions = options.positionOptions;
    this.dragDirection = options.dragDirection;
    this.eventHandlers = options.eventHandlers;
    bindAll(this, 'endDrag', 'cancelDrag', 'recalculateTargetOnScroll', 'startSort', 'onDragStart', 'onMove');

    this.restLastMoveData();
    this.rateLimiter = new RateLimiter<MouseEvent>(this.moveThreshold);
  }

  /**
   * Picking components to move
   * @param {HTMLElement[]} sourceElements
   * */
  startSort(sourceNodes: NodeType[]) {
    this.sourceNodes = sourceNodes;
    this.bindDragEventHandlers();
  }

  private bindDragEventHandlers() {
    on(this.containerContext.container, 'dragstart', this.onDragStart);
    on(this.containerContext.container, 'mousemove dragover', this.onMove);
    on(this.containerContext.document, 'mouseup dragend touchend', this.endDrag);
  }

  /**
   * Triggers the `onMove` event.
   *
   * This method is should be called when the user scrolls within the container, using the last recorded mouse event
   * to determine the new target.
   */
  recalculateTargetOnScroll(): void {
    const { mouseEvent: lastMouseEvent } = this.lastMoveData;
    if (!lastMouseEvent) {
      return;
    }

    this.onMove(lastMouseEvent);
  }

  private onMove(mouseEvent: MouseEvent): void {
    this.rateLimiter.updateArgs(mouseEvent);
    this.rateLimiter.execute(this.handleMove.bind(this));
  }

  private handleMove(mouseEvent: MouseEvent): void {
    this.adjustForScroll();

    const { targetNode: lastTargetNode } = this.lastMoveData;
    this.eventHandlers.onMouseMove?.(mouseEvent);
    const { mouseXRelative: mouseX, mouseYRelative: mouseY } = this.getMousePositionRelativeToContainer(
      mouseEvent.clientX,
      mouseEvent.clientY,
    );
    const targetNode = this.getTargetNode(mouseEvent);
    const targetChanged = !targetNode?.equals(lastTargetNode);
    if (targetChanged) {
      this.eventHandlers.onTargetChange?.(lastTargetNode, targetNode);
    }
    if (!targetNode) {
      this.triggerLegacyOnMoveCallback(mouseEvent, 0);
      this.triggerMoveEvent(mouseX, mouseY);
      this.restLastMoveData();

      return;
    }

    // Handle movement over the valid target node
    const { index, placement, placeholderDimensions } = this.getDropPosition(targetNode, mouseX, mouseY);

    const placeHolderMoved =
      !placeholderDimensions.equals(this.lastMoveData.placeholderDimensions) ||
      placement !== this.lastMoveData.placement;
    if (placeHolderMoved) {
      this.eventHandlers.onPlaceholderPositionChange?.(placeholderDimensions!, placement!);
    }

    this.lastMoveData = {
      ...this.lastMoveData,
      targetNode,
      mouseEvent,
      index,
      placement,
      placeholderDimensions,
    };

    this.triggerMoveEvent(mouseX, mouseY);
    this.triggerLegacyOnMoveCallback(mouseEvent, index);
  }

  private adjustForScroll() {
    const lastTargetNode = this.lastMoveData.targetNode;
    if (lastTargetNode?.element) {
      const dims = this.getDim(lastTargetNode?.element);
      const diff = lastTargetNode.nodeDimensions?.calculateDimensionDifference(dims);
      if (diff) {
        lastTargetNode.adjustDimensions(diff);
      }
    }

    const lastHoveredNode = this.lastMoveData.hoveredNode;
    if (lastHoveredNode?.element) {
      const dims = this.getDim(lastHoveredNode?.element);
      const diff = lastHoveredNode.nodeDimensions?.calculateDimensionDifference(dims);
      if (diff) {
        lastHoveredNode.adjustDimensions(diff);
      }
    }
  }

  private restLastMoveData() {
    this.lastMoveData = {
      targetNode: undefined,
      index: undefined,
      placement: undefined,
      mouseEvent: undefined,
    };
  }

  private triggerLegacyOnMoveCallback(mouseEvent: MouseEvent, index?: number) {
    // For backward compatibility, leave it to a single node
    const model = this.sourceNodes[0]?.model;
    this.eventHandlers.legacyOnMoveClb?.({
      event: mouseEvent,
      target: model,
      parent: this.lastMoveData.targetNode?.model,
      index: index,
    });
  }

  private triggerMoveEvent(mouseX: number, mouseY: number) {
    const { targetNode: targetNode, placement: placement, index: index } = this.lastMoveData;
    const legacyIndex = index ? index + (placement === 'after' ? -1 : 0) : 0;

    this.em.trigger('sorter:drag', {
      target: targetNode?.element || null,
      targetModel: this.lastMoveData.targetNode?.model,
      sourceModel: this.sourceNodes[0].model,
      dims: targetNode?.childrenDimensions || [],
      pos: {
        index: legacyIndex,
        indexEl: legacyIndex,
        placement,
      },
      x: mouseX,
      y: mouseY,
    });
  }

  /**
   * Handles the movement of the dragged element over a target node.
   * Updates the placeholder position and triggers relevant events when necessary.
   *
   * @param node - The node currently being hovered over.
   * @param mouseX - The x-coordinate of the mouse relative to the container.
   * @param mouseY - The y-coordinate of the mouse relative to the container.
   */
  private getDropPosition(node: NodeType, mouseX: number, mouseY: number) {
    let { nodeDimensions, childrenDimensions } = node;
    const children = node.getChildren();
    const nodeHasChildren = children && children.length > 0;

    nodeDimensions = !nodeDimensions ? this.getDim(node.element!) : nodeDimensions;
    node.nodeDimensions = nodeDimensions;

    childrenDimensions = !childrenDimensions ? this.getChildrenDim(node) : childrenDimensions;
    node.childrenDimensions = childrenDimensions;
    let placeholderDimensions = nodeDimensions.clone(),
      index = 0,
      placement = 'inside' as Placement;
    if (nodeHasChildren) {
      ({ index, placement } = findPosition(childrenDimensions, mouseX, mouseY));
      placeholderDimensions = childrenDimensions[index].clone();
      index = index + (placement == 'after' ? 1 : 0);
    }

    return {
      index,
      placement,
      placeholderDimensions,
    };
  }

  /**
   * Retrieves the target node based on the mouse event.
   * Determines the element being hovered, its corresponding model, and
   * calculates the valid parent node to use as the target node.
   *
   * @param mouseEvent - The mouse event containing the cursor position and target element.
   * @returns The target node if a valid one is found, otherwise undefined.
   */
  private getTargetNode(mouseEvent: MouseEvent): NodeType | undefined {
    this.cacheContainerPosition(this.containerContext.container);
    const { mouseXRelative, mouseYRelative } = this.getMousePositionRelativeToContainer(
      mouseEvent.clientX,
      mouseEvent.clientY,
    );

    // Get the element under the mouse
    const mouseTargetEl = this.getMouseTargetElement(mouseEvent);
    const targetEl = this.getFirstElementWithAModel(mouseTargetEl);
    if (!targetEl) return;
    const hoveredModel = $(targetEl)?.data('model');
    if (!hoveredModel) return;

    let hoveredNode = this.getOrCreateHoveredNode(hoveredModel);

    // Get the drop position index based on the mouse position
    const { index } = this.getDropPosition(hoveredNode, mouseXRelative, mouseYRelative);

    // Determine the valid target node (or its valid parent)
    let targetNode = this.getValidParent(hoveredNode, index, mouseXRelative, mouseYRelative);

    return this.getOrReuseTargetNode(targetNode);
  }

  /**
   * Creates a new hovered node or reuses the last hovered node if it is the same.
   *
   * @param hoveredModel - The model corresponding to the hovered element.
   * @returns The new or reused hovered node.
   */
  private getOrCreateHoveredNode(hoveredModel: T): NodeType {
    const lastHoveredNode = this.lastMoveData.hoveredNode;
    const hoveredNode = new this.treeClass(hoveredModel);
    const newHoveredNode = hoveredNode.equals(lastHoveredNode) ? lastHoveredNode : hoveredNode;
    this.lastMoveData.hoveredNode = newHoveredNode;

    return newHoveredNode;
  }

  /**
   * Checks if the target node has changed and returns the last one if they are identical.
   *
   * @param targetNode - The newly calculated target node.
   * @returns The new or reused target node.
   */
  private getOrReuseTargetNode(targetNode?: NodeType): NodeType | undefined {
    const lastTargetNode = this.lastMoveData.targetNode;
    return targetNode?.equals(lastTargetNode) ? lastTargetNode : targetNode;
  }

  private getMouseTargetElement(mouseEvent: MouseEvent) {
    const customTarget = this.containerContext.customTarget;
    let mouseTarget = this.containerContext.document.elementFromPoint(
      mouseEvent.clientX,
      mouseEvent.clientY,
    ) as HTMLElement;
    let mouseTargetEl: HTMLElement | null = customTarget ? customTarget({ event: mouseEvent }) : mouseTarget;

    return mouseTargetEl;
  }

  private onDragStart(mouseEvent: MouseEvent): void {
    this.eventHandlers.onDragStart && this.eventHandlers.onDragStart(mouseEvent);
  }

  endDrag(): void {
    this.dropDragged();
  }

  cancelDrag() {
    const { targetNode: lastTargetNode } = this.lastMoveData;
    this.eventHandlers.onTargetChange?.(lastTargetNode, undefined);
    this.finalizeMove();
  }

  private finalizeMove() {
    this.cleanupEventListeners();
    this.triggerOnDragEndEvent();
    this.eventHandlers.onEnd?.();
    this.eventHandlers.legacyOnEnd?.();
    this.restLastMoveData();
    this.rateLimiter.clearTimeout();
  }

  private dropDragged() {
    const { targetNode: lastTargetNode, index: lastIndex } = this.lastMoveData;
    this.eventHandlers.onDrop?.(lastTargetNode, this.sourceNodes, lastIndex);
    this.finalizeMove();
  }

  private triggerOnDragEndEvent() {
    const { targetNode: targetNode } = this.lastMoveData;

    // For backward compatibility, leave it to a single node
    const firstSourceNode = this.sourceNodes[0];
    this.em.trigger('sorter:drag:end', {
      targetCollection: targetNode ? targetNode.getChildren() : null,
      modelToDrop: firstSourceNode?.model,
      warns: [''],
      validResult: {
        result: true,
        src: this.sourceNodes.map((node) => node.element),
        srcModel: firstSourceNode?.model,
        trg: targetNode?.element,
        trgModel: targetNode?.model,
        draggable: true,
        droppable: true,
      },
      dst: targetNode?.element,
      srcEl: firstSourceNode?.element,
    });
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
    const isModelPresent = (el: HTMLElement) => $(el).data('model') !== undefined;

    while (mouseTargetEl && this.containerContext.container.contains(mouseTargetEl)) {
      if (isModelPresent(mouseTargetEl)) {
        return mouseTargetEl;
      }

      mouseTargetEl = mouseTargetEl.parentElement;
    }

    return null;
  }

  private getValidParent(targetNode: NodeType, index: number, mouseX: number, mouseY: number): NodeType | undefined {
    if (!targetNode) return;

    const lastTargetNode = this.lastMoveData.targetNode;
    const targetNotChanged = targetNode.equals(lastTargetNode);
    targetNode.nodeDimensions = targetNotChanged ? lastTargetNode.nodeDimensions! : this.getDim(targetNode.element!);
    if (!targetNode.isWithinDropBounds(mouseX, mouseY)) {
      return this.handleParentTraversal(targetNode, mouseX, mouseY);
    }

    const positionNotChanged = targetNotChanged && index === this.lastMoveData.index;
    if (positionNotChanged) return lastTargetNode;

    const canMove = this.sourceNodes.some((node) => targetNode.canMove(node, index));
    this.triggerDragValidation(canMove, targetNode);
    if (canMove) return targetNode;

    return this.handleParentTraversal(targetNode, mouseX, mouseY);
  }

  private handleParentTraversal(targetNode: NodeType, mouseX: number, mouseY: number): NodeType | undefined {
    const parent = targetNode.getParent() as NodeType;
    if (!parent) return;

    const indexInParent = this.getIndexInParent(parent, targetNode, targetNode.nodeDimensions!, mouseX, mouseY);
    return this.getValidParent(parent, indexInParent, mouseX, mouseY);
  }

  private getIndexInParent(
    parent: NodeType,
    targetNode: NodeType,
    nodeDimensions: Dimension,
    mouseX: number,
    mouseY: number,
  ) {
    let indexInParent = parent?.indexOfChild(targetNode);
    nodeDimensions.dir = this.getDirection(targetNode.element!, parent.element!);

    indexInParent = indexInParent + (nodeDimensions.determinePlacement(mouseX, mouseY) == 'after' ? 1 : 0);
    return indexInParent;
  }

  private triggerDragValidation(canMove: boolean, targetNode: NodeType) {
    const firstSource = this.sourceNodes[0];
    this.em.trigger('sorter:drag:validation', {
      valid: canMove,
      src: firstSource?.element,
      srcModel: firstSource?.model,
      trg: targetNode.element,
      trgModel: targetNode.model,
    });

    return firstSource;
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
    off(container, 'dragstart', this.onDragStart);
    off(container, 'mousemove dragover', this.onMove);
    off(this.containerContext.document, 'mouseup dragend touchend', this.endDrag);
  }

  /**
   * Determines if an element is in the normal flow of the document.
   * This checks whether the element is not floated or positioned in a way that removes it from the flow.
   *
   * @param  {HTMLElement} el - The element to check.
   * @param  {HTMLElement} [parent=document.body] - The parent element for additional checks (defaults to `document.body`).
   * @return {boolean} Returns `true` if the element is in flow, otherwise `false`.
   * @private
   */
  private getDirection(el: HTMLElement, parent: HTMLElement): boolean {
    let dirValue: boolean;

    if (this.dragDirection === DragDirection.Vertical) dirValue = true;
    else if (this.dragDirection === DragDirection.Horizontal) dirValue = false;
    else dirValue = isStyleInFlow(el, parent);

    return dirValue;
  }

  /**
   * Get children dimensions
   * @param {NodeType} el Element root
   * @return {Array}
   * */
  private getChildrenDim(targetNode: NodeType) {
    const dims: Dimension[] = [];
    const targetElement = targetNode.element;
    if (!!!targetElement) {
      return [];
    }

    const children = targetNode.getChildren();
    if (!children || children.length === 0) {
      return [];
    }

    each(children, (sortableTreeNode, i) => {
      const el = sortableTreeNode.element;
      if (!el) return;

      if (!isTextNode(el) && !matches(el, this.containerContext.itemSel)) {
        return;
      }

      const dim = this.getDim(el);
      dim.dir = this.getDirection(el, targetElement);
      dims.push(dim);
    });

    return dims;
  }

  /**
   * Gets the mouse position relative to the container, adjusting for scroll and canvas relative options.
   *
   * @return {{ mouseXRelativeToContainer: number, mouseYRelativeToContainer: number }} - The mouse X and Y positions relative to the container.
   * @private
   */
  private getMousePositionRelativeToContainer(
    mouseX: number,
    mouseY: number,
  ): {
    mouseXRelative: number;
    mouseYRelative: number;
  } {
    let mouseYRelative = mouseY - this.containerOffset.top + this.containerContext.container.scrollTop;
    let mouseXRelative = mouseX - this.containerOffset.left + this.containerContext.container.scrollLeft;

    if (this.positionOptions.canvasRelative) {
      const mousePos = this.em.Canvas.getMouseRelativeCanvas({ clientX: mouseX, clientY: mouseY }, { noScroll: 1 });
      mouseXRelative = mousePos.x;
      mouseYRelative = mousePos.y;
    }

    return { mouseXRelative, mouseYRelative };
  }

  /**
   * Caches the container position and updates relevant variables for position calculation.
   *
   * @private
   */
  private cacheContainerPosition(container: HTMLElement): void {
    const containerOffset = offset(container);
    const containerOffsetTop = this.positionOptions.windowMargin ? Math.abs(containerOffset.top) : containerOffset.top;
    const containerOffsetLeft = this.positionOptions.windowMargin
      ? Math.abs(containerOffset.left)
      : containerOffset.left;

    this.containerOffset = {
      top: containerOffsetTop,
      left: containerOffsetLeft,
    };
  }

  /**
   * Returns dimensions and positions about the element
   * @param {HTMLElement} el
   * @return {Dimension}
   */
  private getDim(el: HTMLElement): Dimension {
    const em = this.em;
    const relative = this.positionOptions.relative;
    const windowMargin = this.positionOptions.windowMargin;
    const canvas = em?.Canvas;
    const offsets = canvas ? canvas.getElementOffsets(el) : {};
    let top, left, height, width;

    if (this.positionOptions.canvasRelative && this.em) {
      const pos = canvas!.getElementPos(el, { noScroll: 1 })!;
      top = pos.top; // - offsets.marginTop;
      left = pos.left; // - offsets.marginLeft;
      height = pos.height; // + offsets.marginTop + offsets.marginBottom;
      width = pos.width; // + offsets.marginLeft + offsets.marginRight;
    } else {
      var o = offset(el);
      top = relative ? el.offsetTop : o.top - (windowMargin ? -1 : 1) * this.containerOffset.top;
      left = relative ? el.offsetLeft : o.left - (windowMargin ? -1 : 1) * this.containerOffset.left;
      height = el.offsetHeight;
      width = el.offsetWidth;
    }

    return new Dimension({ top, left, height, width, offsets });
  }
}
