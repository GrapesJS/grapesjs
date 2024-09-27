import { $, View } from '../../common';

import EditorModel from '../../editor/model/Editor';
import { isTextNode, off, on } from '../dom';
import { SortableTreeNode } from './SortableTreeNode';
import { Dimension, Placement, PositionOptions, DragDirection, SorterEventHandlers, CustomTarget } from './types';
import { bindAll, each } from 'underscore';
import { matches, findPosition, offset, isInFlow } from './SorterUtils';

type ContainerContext = {
  container: HTMLElement;
  itemSel: string;
  customTarget?: CustomTarget;
  document: Document;
};

interface DropLocationDeterminerOptions<T, NodeType extends SortableTreeNode<T>> {
  em: EditorModel;
  treeClass: new (model: T, content?: any) => NodeType;
  containerContext: ContainerContext;
  positionOptions: PositionOptions;
  dragDirection: DragDirection;
  eventHandlers: SorterEventHandlers<NodeType>;
}

/**
 * Represents the data related to the last move event during drag-and-drop sorting.
 * This type is discriminated by the presence or absence of a valid target node.
 */
type LastMoveData<NodeType> = {
  /** The target node under the mouse pointer during the last move. */
  lastTargetNode?: NodeType;
  /** The index where the placeholder or dragged element should be inserted. */
  lastIndex?: number;
  /** Placement relative to the target ('before' or 'after'). */
  lastPlacement?: Placement;
  /** The dimensions of the target node. */
  lastTargetDimensions?: Dimension;
  /** The dimensions of the child elements within the target node. */
  lastChildrenDimensions?: Dimension[];
  /** The mouse event, used if we want to move placeholder with scrolling. */
  lastMouseEvent?: MouseEvent;
};

export class DropLocationDeterminer<T, NodeType extends SortableTreeNode<T>> extends View {
  em: EditorModel;
  treeClass: new (model: any) => NodeType;

  positionOptions: PositionOptions;
  containerContext: ContainerContext;
  dragDirection: DragDirection;
  eventHandlers: SorterEventHandlers<NodeType>;

  sourceNodes: NodeType[] = [];
  lastMoveData!: LastMoveData<NodeType>;
  containerOffset = {
    top: 0,
    left: 0,
  };

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
    const { lastTargetNode, lastMouseEvent } = this.lastMoveData;

    // recalculate dimensions when the canvas is scrolled
    this.restLastMoveData();
    this.lastMoveData.lastTargetNode = lastTargetNode;
    if (!lastMouseEvent) {
      return;
    }

    this.onMove(lastMouseEvent);
    this.lastMoveData.lastMouseEvent = lastMouseEvent;
  }

  private onMove(mouseEvent: MouseEvent): void {
    this.eventHandlers.onMouseMove?.(mouseEvent);
    const { mouseXRelativeToContainer: mouseX, mouseYRelativeToContainer: mouseY } =
      this.getMousePositionRelativeToContainer(mouseEvent);
    const targetNode = this.getTargetNode(mouseEvent);
    if (!targetNode) {
      this.triggerLegacyOnMoveCallback(mouseEvent, 0);
      this.triggerMoveEvent(mouseX, mouseY);

      return;
    }

    // Handle movement over the valid target node
    const index = this.handleMovementOnTarget(targetNode, mouseX, mouseY);

    this.triggerMoveEvent(mouseX, mouseY);
    this.triggerLegacyOnMoveCallback(mouseEvent, index);
    this.lastMoveData.lastMouseEvent = mouseEvent;
  }

  private restLastMoveData() {
    this.lastMoveData = {
      lastTargetNode: undefined,
      lastIndex: undefined,
      lastPlacement: undefined,
      lastTargetDimensions: undefined,
      lastChildrenDimensions: undefined,
      lastMouseEvent: undefined,
    };
  }

  private triggerLegacyOnMoveCallback(mouseEvent: MouseEvent, index: number) {
    // For backward compatibility, leave it to a single node
    const model = this.sourceNodes[0]?.model;
    this.eventHandlers.legacyOnMoveClb?.({
      event: mouseEvent,
      target: model,
      parent: this.lastMoveData.lastTargetNode?.model,
      index: index,
    });
  }

  private triggerMoveEvent(mouseX: number, mouseY: number) {
    const {
      lastTargetNode: targetNode,
      lastPlacement: placement,
      lastIndex: index,
      lastChildrenDimensions: childrenDimensions,
    } = this.lastMoveData;
    const legacyIndex = index ? index + (placement === 'after' ? -1 : 0) : 0;

    this.em.trigger('sorter:drag', {
      target: targetNode?.element || null,
      targetModel: this.lastMoveData.lastTargetNode?.model,
      sourceModel: this.sourceNodes[0].model,
      dims: childrenDimensions || [],
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
   * @param hoveredNode - The node currently being hovered over.
   * @param mouseX - The x-coordinate of the mouse relative to the container.
   * @param mouseY - The y-coordinate of the mouse relative to the container.
   * @returns The index at which the placeholder should be positioned.
   */
  private handleMovementOnTarget(hoveredNode: NodeType, mouseX: number, mouseY: number): number {
    const { lastTargetNode, lastChildrenDimensions } = this.lastMoveData;

    const targetChanged = !hoveredNode.equals(lastTargetNode);
    if (targetChanged) {
      this.eventHandlers.onTargetChange?.(lastTargetNode, hoveredNode);
    }

    let placeholderDimensions, index, placement: Placement;
    const children = hoveredNode.getChildren();
    const nodeHasChildren = children && children.length > 0;

    const hoveredNodeDimensions = this.getDim(hoveredNode.element!);
    const childrenDimensions =
      targetChanged || !!!lastChildrenDimensions ? this.getChildrenDim(hoveredNode) : lastChildrenDimensions;
    if (nodeHasChildren) {
      ({ index, placement } = findPosition(childrenDimensions, mouseX, mouseY));
      placeholderDimensions = childrenDimensions[index];
    } else {
      placeholderDimensions = hoveredNodeDimensions;
      index = 0;
      placement = 'inside';
    }
    index = index + (placement == 'after' ? 1 : 0);

    this.eventHandlers.onPlaceholderPositionChange?.(placeholderDimensions, placement);

    this.lastMoveData = {
      lastTargetNode: hoveredNode,
      lastTargetDimensions: hoveredNodeDimensions,
      lastChildrenDimensions: childrenDimensions,
      lastIndex: index,
      lastPlacement: placement,
    };

    return index;
  }

  private getTargetNode(mouseEvent: MouseEvent) {
    const customTarget = this.containerContext.customTarget;
    this.cacheContainerPosition(this.containerContext.container);

    let mouseTarget = this.containerContext.document.elementFromPoint(
      mouseEvent.clientX,
      mouseEvent.clientY,
    ) as HTMLElement;
    let mouseTargetEl: HTMLElement | null = customTarget ? customTarget({ event: mouseEvent }) : mouseTarget;
    const targetEl = this.getFirstElementWithAModel(mouseTargetEl);
    if (!targetEl) return;
    const targetModel = $(targetEl)?.data('model');
    const mouseTargetNode = new this.treeClass(targetModel);
    const targetNode = this.getValidParentNode(mouseTargetNode);
    return targetNode;
  }

  private onDragStart(mouseEvent: MouseEvent): void {
    this.eventHandlers.onDragStart && this.eventHandlers.onDragStart(mouseEvent);
  }

  endDrag(): void {
    this.dropDragged();
  }

  cancelDrag() {
    const { lastTargetNode } = this.lastMoveData;
    this.eventHandlers.onTargetChange?.(lastTargetNode, undefined);
    this.finalizeMove();
  }

  private finalizeMove() {
    this.cleanupEventListeners();
    this.triggerOnDragEndEvent();
    this.eventHandlers.onEnd?.();
    this.eventHandlers.legacyOnEnd?.();
    this.restLastMoveData();
  }

  private dropDragged() {
    const { lastTargetNode, lastIndex } = this.lastMoveData;
    this.eventHandlers.onDrop?.(lastTargetNode, this.sourceNodes, lastIndex);
    this.finalizeMove();
  }

  private triggerOnDragEndEvent() {
    const { lastTargetNode: targetNode } = this.lastMoveData;

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

  private getValidParentNode(targetNode: NodeType) {
    let finalNode = targetNode;
    while (finalNode !== null) {
      const canMove = this.sourceNodes.some((node) => finalNode.canMove(node, 0));

      // For backward compatibility, leave it to a single node
      const firstSource = this.sourceNodes[0];
      this.em.trigger('sorter:drag:validation', {
        valid: canMove,
        src: firstSource?.element,
        srcModel: firstSource?.model,
        trg: finalNode.element,
        trgModel: finalNode.model,
      });
      if (canMove) break;
      finalNode = finalNode.getParent()! as NodeType;
    }

    return finalNode;
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
      let dir = this.dragDirection;
      let dirValue: boolean;

      if (dir === DragDirection.Vertical) dirValue = true;
      else if (dir === DragDirection.Horizontal) dirValue = false;
      else dirValue = isInFlow(el, targetElement);

      dim.dir = dirValue;
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
  private getMousePositionRelativeToContainer(mouseEvent: MouseEvent): {
    mouseXRelativeToContainer: number;
    mouseYRelativeToContainer: number;
  } {
    const { em } = this;
    let mouseYRelativeToContainer =
      mouseEvent.pageY - this.containerOffset.top + this.containerContext.container.scrollTop;
    let mouseXRelativeToContainer =
      mouseEvent.pageX - this.containerOffset.left + this.containerContext.container.scrollLeft;

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

    return { top, left, height, width, offsets };
  }
}
