import { $, Model, View } from '../common';

import EditorModel from '../editor/model/Editor';
import { isTextNode, off, on } from './dom';
import { getModel } from './mixins';
import { TreeSorterBase } from './TreeSorterBase';
import { Dimension, Position, PositionOptions, SorterContainerContext, SorterDirection, SorterDragBehaviorOptions, SorterEventHandlers } from './Sorter';
import { bindAll, each } from 'underscore';
import { matches, findPosition, offset, isInFlow, getDim } from './SorterUtils';

interface DropLocationDeterminerOptions<T> {
  em: EditorModel;
  treeClass: (model: any) => TreeSorterBase<T>;
  containerContext: SorterContainerContext;
  positionOptions: PositionOptions;
  dragBehavior: SorterDragBehaviorOptions;
  eventHandlers?: SorterEventHandlers<T>;
}

export class DropLocationDeterminer<T> extends View {
  em?: EditorModel;
  treeClass!: (model: any) => TreeSorterBase<T>;

  positionOptions!: PositionOptions;
  containerContext!: SorterContainerContext;
  dragBehavior!: SorterDragBehaviorOptions;
  eventHandlers?: SorterEventHandlers<T>;

  targetNode!: TreeSorterBase<T>;
  lastPos!: Position;
  targetDimensions?: Dimension[];
  sourceNode!: TreeSorterBase<T>;
  docs!: Document[];
  elT!: number;
  elL!: number;

  constructor(options: DropLocationDeterminerOptions<T>,
    private onDropPositionChange?: (dims: Dimension[], newPosition: Position, targetDimension: Dimension) => void) {
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
  startSort(sourceElement?: HTMLElement, options: { container?: HTMLElement } = {}) {
    this.containerContext.container = options.container!
    const sourceModel = $(sourceElement).data('model')
    const sourceNode = this.treeClass(sourceModel);
    this.sourceNode = sourceNode;

    this.bindDragEventHandlers(this.docs);
  }

  private bindDragEventHandlers(docs: Document[]) {
    on(this.containerContext.container, 'mousemove dragover', this.onMove);
    on(docs, 'mouseup dragend touchend', this.endMove);
  }

  onMove(mouseEvent: MouseEvent): void {
    const customTarget = this.containerContext.customTarget;
    this.cacheContainerPosition();

    const { mouseXRelativeToContainer, mouseYRelativeToContainer } = this.getMousePositionRelativeToContainer(mouseEvent);

    const mouseTargetEl = customTarget ? customTarget({ sorter: this, event: mouseEvent }) : mouseEvent.target;

    const mouseTargetModel = $(mouseTargetEl)?.data("model");
    const mouseTargetNode = this.treeClass(mouseTargetModel);
    let targetNode = this.getValidParentNode(mouseTargetNode);
    // @ts-ignore
    const dims = this.dimsFromTarget(targetNode.getElement(), mouseXRelativeToContainer, mouseYRelativeToContainer, this.targetElement);

    const pos = findPosition(dims, mouseXRelativeToContainer, mouseYRelativeToContainer);
    this.lastPos = pos;

    // @ts-ignore
    this.onDropPositionChange && this.onDropPositionChange(dims, pos, targetNode);
    this.eventHandlers?.onTargetChange && this.eventHandlers?.onTargetChange(this.targetNode, targetNode);
    this.targetNode = targetNode;
  }

  private getValidParentNode(targetNode: TreeSorterBase<T>) {
    let finalNode = targetNode;
    // TODO change the hard coded 0 value
    while (finalNode.getParent() !== null && !finalNode.canMove(this.sourceNode, 0)) {
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
   * @param {HTMLElement} target - The target element.
   * @param {number} [rX=0] - Relative X position.
   * @param {number} [rY=0] - Relative Y position.
   * @return {Dimension[]} - The dimensions array of the target and its valid parents.
   * @private
   */
  private dimsFromTarget(target: HTMLElement, rX = 0, rY = 0, prevTargetElement?: HTMLElement): Dimension[] {
    let dims: Dimension[] = [];

    if (!target) {
      return dims
    };

    this.targetDimensions = this.getChildrenDim(target);

    return this.targetDimensions;
  }

  /**
   * Get children dimensions
   * @param {HTMLELement} el Element root
   * @return {Array}
   * */
  private getChildrenDim(trg: HTMLElement) {
    const dims: Dimension[] = [];
    if (!trg) return dims;

    // @ts-ignore
    if (this.targetModel && this.targetModel.view && !this.dragBehavior.ignoreViewChildren) {
      // @ts-ignore
      const view = this.targetModel.getCurrentView ? this.targetModel.getCurrentView() : trgModel.view;
      trg = view.getChildrenContainer();
    }

    each(trg.children, (ele, i) => {
      const el = ele as HTMLElement;
      const model = getModel(el, $);
      const elIndex = model && model.index ? model.index() : i;

      if (!isTextNode(el) && !matches(el, this.containerContext.itemSel)) {
        return;
      }

      // TODO
      const dim = getDim(el, this.elL, this.elT, this.positionOptions.relative!, !!this.positionOptions.canvasRelative, this.positionOptions.windowMargin!, this.em);
      let dir = this.dragBehavior.dragDirection;
      let dirValue: boolean;

      if (dir === SorterDirection.Vertical) dirValue = true;
      else if (dir === SorterDirection.Horizontal) dirValue = false;
      else dirValue = isInFlow(el, trg);

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
}
