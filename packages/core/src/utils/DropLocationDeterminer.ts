import { $, Model, View } from '../common';

import EditorModel from '../editor/model/Editor';
import { isTextNode, off, on } from './dom';
import { getModel } from './mixins';
import { TreeSorterBase } from './TreeSorterBase';
import { Dimension, Position, PositionOptions, SorterContainerContext, SorterDirection, SorterDragBehaviorOptions, SorterEventHandlers } from './Sorter';
import { bindAll, each, isFunction } from 'underscore';
import { matches, closest, findPosition, offset, nearBorders, isInFlow, getDim } from './SorterUtils';

interface DropLocationDeterminerOptions<T> {
  em: EditorModel;
  treeClass: new (model: any) => TreeSorterBase<T>;
  containerContext: SorterContainerContext;
  positionOptions: PositionOptions;
  dragBehavior: SorterDragBehaviorOptions;
  eventHandlers?: SorterEventHandlers;
}

export class DropLocationDeterminer<T> extends View {
  em?: EditorModel;
  treeClass!: new (model: any) => TreeSorterBase<T>;

  positionOptions!: PositionOptions;
  containerContext!: SorterContainerContext;
  dragBehavior!: SorterDragBehaviorOptions;
  eventHandlers?: SorterEventHandlers;

  dropModel?: Model;
  targetElement?: HTMLElement;
  private sourceElement?: HTMLElement;
  moved?: boolean;
  docs!: Document[];

  elT!: number;
  elL!: number;

  mouseXRelativeToContainer?: number;
  mouseYRelativeToContainer?: number;
  eventMove?: MouseEvent;

  targetModel?: Model;
  targetParent: HTMLElement | undefined;
  lastPos: any;

  sourceModel?: Model;

  targetDim?: Dimension;
  cacheDimsP?: Dimension[];
  cacheDims?: Dimension[];
  lastDims!: Dimension[];
  targetNode!: TreeSorterBase<T>;

  constructor(options: DropLocationDeterminerOptions<T>,
    private onMoveCallback?: (...args: any) => void,
    private onDropPositionChange?: (dims: Dimension[], newPosition: Position, targetDimension: Dimension) => void,
    private onDrop?: (node: TreeSorterBase<T>, index: number) => void) {
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
  startSort(src?: HTMLElement, options: { container?: HTMLElement; } = {}) {
    this.containerContext.container = options.container!
    this.sourceElement = src;
    this.resetDragStates();
    this.bindDragEventHandlers(this.docs);
  }

  private bindDragEventHandlers(docs: Document[]) {
    on(this.containerContext.container, 'mousemove dragover', this.onMove);
    on(docs, 'mouseup dragend touchend', this.endMove);
  }

  onMove(mouseEvent: MouseEvent): void {
    const customTarget = this.containerContext.customTarget;
    this.moved = true;
    this.cacheContainerPosition();

    const { mouseXRelativeToContainer, mouseYRelativeToContainer } = this.getMousePositionRelativeToContainer(mouseEvent);
    this.mouseXRelativeToContainer = mouseXRelativeToContainer;
    this.mouseYRelativeToContainer = mouseYRelativeToContainer;

    const targetEl = customTarget ? customTarget({ sorter: this, event: mouseEvent }) : mouseEvent.target;

    const targetModel = $(targetEl)?.data("model");
    const targetNode = new this.treeClass(targetModel);
    if (!this.sourceElement || !targetModel) {
      return
    }
    // @ts-ignore
    const sourceModel = $(this.sourceElement).data('model')
    const sourceNode = new this.treeClass(sourceModel);
    let finalNode = targetNode;
    // TODO change the hard coded 0 value
    while (finalNode.getParent() !== null && !finalNode.canMove(sourceNode, 0)) {
      finalNode = finalNode.getParent()!;
    }
    try {
      // @ts-ignore
      this.targetNode.model.view.el.style.border = 'none'
      // @ts-ignore
      finalNode.model.view.el.style.border = '1px red solid'
    } catch {}
    // @ts-ignore
    const dims = this.dimsFromTarget(targetNode.model.view.el as HTMLElement, mouseXRelativeToContainer, mouseYRelativeToContainer, this.targetElement);

    const pos = findPosition(dims, mouseXRelativeToContainer, mouseYRelativeToContainer);

    // @ts-ignore
    this.onDropPositionChange && this.onDropPositionChange(dims, pos, finalNode);
    this.lastPos = pos;

    this.lastDims = dims;
    this.targetNode = finalNode;
  }

  /**
 * End the move action.
 * Handles the cleanup and final steps after an item is moved.
 */
  endMove(): void {
    let index = this.lastPos.method === 'after' ? this.lastPos.indexEl + 1 : this.lastPos.indexEl;
    // TODO fix the index for same collection dropping
    isFunction(this.onDrop) && this.onDrop(this.targetNode, index)
    this.cleanupEventListeners();
    delete this.eventMove;
    delete this.dropModel;
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
  private dimsFromTarget(target: HTMLElement, rX = 0, rY = 0, prevTargetElement: any): Dimension[] {
    let dims: Dimension[] = [];

    if (!target) {
      return dims
    };

    if (this.isNewTarget(target, prevTargetElement)) {
      this.handleNewTarget(target, rX, rY);
    }

    dims = this.cacheDims!;

    return dims;
  }

  /**
   * Checks if the provided target is different from the previous one.
   *
   * @param {HTMLElement} target - The target element.
   * @return {boolean} - Whether the target is a new one.
   * @private
   */
  private isNewTarget(target: HTMLElement, prevTargetElement: any): boolean {
    // if (prevTargetElement && prevTargetElement !== target) {
    //   delete this.prevTargetElement;
    // }

    return (prevTargetElement && prevTargetElement !== target) || !prevTargetElement;
  }

  /**
   * Handle the initialization of a new target, caching dimensions and validating
   * if the target is valid for sorting.
   *
   * @param {HTMLElement} target - The new target element.
   * @param {number} rX - Relative X position.
   * @param {number} rY - Relative Y position.
   * @private
   */
  private handleNewTarget(target: HTMLElement, rX: number, rY: number): void {
    const em = this.em;

    this.targetParent = closest(target, this.containerContext.containerSel);

    const validResult = this.validTarget(target);
    em && em.trigger('sorter:drag:validation', validResult);

    if (!validResult.valid && this.targetParent) {
      this.dimsFromTarget(this.targetParent, rX, rY, this.targetElement);
      return;
    }

    this.targetElement = target;
    this.targetDim = getDim(target, this.elL, this.elT, this.positionOptions.relative, !!this.positionOptions.canvasRelative, this.positionOptions.windowMargin, this.em);
    this.cacheDimsP = this.getChildrenDim(this.targetParent!);
    this.cacheDims = this.getChildrenDim(target);
  }

  /**
   * Get children dimensions
   * @param {HTMLELement} el Element root
   * @return {Array}
   * */
  getChildrenDim(trg: HTMLElement) {
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

      const dim = getDim(el, this.elL, this.elT, this.positionOptions.relative, !!this.positionOptions.canvasRelative, this.positionOptions.windowMargin, this.em);
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
   * Check if the target is valid with the actual source
   * @param  {HTMLElement} trg
   * @return {Boolean}
   */
  validTarget(trg: HTMLElement, src?: HTMLElement) {
    const pos = this.lastPos;
    const trgModel = this.getTargetModel(trg);
    const srcModel = this.getSourceModel(src, { target: trgModel });
    // @ts-ignore
    if (!trgModel?.view?.el || !srcModel?.view?.el) {
      return {
        valid: false,
        src,
        srcModel,
        trg,
        trgModel
      };
    }

    // @ts-ignore
    src = srcModel?.view?.el;
    trg = trgModel.view.el;
    const targetNode = new this.treeClass(trgModel);
    const sourceNode = new this.treeClass(srcModel);

    const targetChildren = targetNode.getChildren();
    if (!targetChildren) {
      return {
        valid: false,
        src,
        srcModel,
        trg,
        trgModel
      };
    }
    const length = targetChildren.length;
    const index = pos ? (pos.method === 'after' ? pos.indexEl + 1 : pos.indexEl) : length;
    const canMove = targetNode.canMove(sourceNode, index);

    return {
      valid: canMove,
      src,
      srcModel,
      trg,
      trgModel
    };
  }

  /**
 * Get the model of the current source element (element to drag)
 * @return {Model}
 */
  getSourceModel(source?: HTMLElement, { target, avoidChildren = 1 }: any = {}): Model {
    const { sourceElement } = this;
    const src = source || sourceElement;
    return src && $(src).data('model');
  }

  /**
 * Get the model from HTMLElement target
 * @return {Model|null}
 */
  getTargetModel(el: HTMLElement) {
    const elem = el || this.targetElement;
    return $(elem).data('model');
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

  private resetDragStates() {
    delete this.dropModel;
    delete this.targetElement;
    this.moved = false;
  }

  updateContainer(container: HTMLElement) {
    this.containerContext.container = container;
  }

  updateDocs(docs: Document[]) {
    this.docs = docs;
  }
}
