import { $, Model, View } from '../common';
import EditorModel from '../editor/model/Editor';
import { isTextNode, on } from './dom';
import { getModel, matches } from './mixins';
import { TreeSorterBase } from './TreeSorterBase';
import { Dimension, Position, PositionOptions, SorterContainerContext, SorterDirection, SorterDragBehaviorOptions, SorterEventHandlers } from './Sorter';
import { each } from 'underscore';
interface DropLocationDeterminerOptions {
  containerContext: SorterContainerContext;
  positionOptions: PositionOptions;
  dragBehavior: SorterDragBehaviorOptions;
  eventHandlers?: SorterEventHandlers;
}

export class DropLocationDeterminer<T> extends View{
  em?: EditorModel;
  treeClass!: new (model: any) => TreeSorterBase<T>;

  positionOptions!: PositionOptions;
  containerContext!: SorterContainerContext;
  dragBehavior!: SorterDragBehaviorOptions;
  eventHandlers?: SorterEventHandlers;

  dropModel?: Model;
  targetElement?: HTMLElement;
  prevTargetElement?: HTMLElement;
  sourceElement?: HTMLElement;
  moved?: boolean;
  docs!: Document[];

  elT!: number;
  elL!: number;

  mouseXRelativeToContainer?: number;
  mouseYRelativeToContainer?: number;
  eventMove?: MouseEvent;

  targetModel?: Model;
  targetP: HTMLElement | undefined;
  lastPos: any;

  sourceModel?: Model;

  prevTargetDim?: Dimension;
  cacheDimsP?: Dimension[];
  cacheDims?: Dimension[];
  lastDims!: Dimension[];

  constructor(options: DropLocationDeterminerOptions, private onMoveCallback?: (model: any, index: any) => void) {
    super();
    this.containerContext = options.containerContext;
    this.positionOptions = options.positionOptions;
    this.dragBehavior = options.dragBehavior;
    this.eventHandlers = options.eventHandlers;
    this.onMoveCallback = onMoveCallback;
  }

  /**
   * Picking component to move
   * @param {HTMLElement} src
   * */
  startSort(src?: HTMLElement, opts: { container?: HTMLElement; } = {}) {
    const { itemSel } = this.containerContext;
    this.resetDragStates();
    src = src ? this.closest(src, itemSel) : src;
    this.bindDragEventHandlers(this.docs);
  }

  private bindDragEventHandlers(docs: Document[]) {
    on(this.containerContext.container, 'mousemove dragover', this.onMove.bind(this));
    // on(docs, 'mouseup dragend touchend', this.endMove);
    // on(docs, 'keydown', this.rollback);
  }

  private onMove(mouseEvent: MouseEvent): void {
    this.moved = true;
    this.cacheContainerPosition(mouseEvent);
    const { mouseXRelativeToContainer, mouseYRelativeToContainer } = this.getMousePositionRelativeToContainer(mouseEvent);
    this.mouseXRelativeToContainer = mouseXRelativeToContainer;
    this.mouseYRelativeToContainer = mouseYRelativeToContainer;
    this.eventMove = mouseEvent;

    const targetEl = this.containerContext.customTarget ? this.containerContext.customTarget({ sorter: this, event: mouseEvent }) : mouseEvent.target;
    const dims = this.dimsFromTarget(targetEl as HTMLElement, mouseXRelativeToContainer, mouseYRelativeToContainer);
    this.lastDims = dims;
    const pos = this.findPosition(dims, mouseXRelativeToContainer, mouseYRelativeToContainer);

    // Call the onMoveCallback with (targetModel, Index)
    this.onMoveCallback && this.onMoveCallback(this.targetModel, 0)
  }

  /**
 * Find the position based on passed dimensions and coordinates
 * @param {Array<Array>} dims Dimensions of nodes to parse
 * @param {number} posX X coordindate
 * @param {number} posY Y coordindate
 * @return {Object}
 * */
   findPosition(dims: Dimension[], posX: number, posY: number): Position {
    const result: Position = { index: 0, indexEl: 0, method: 'before' };
    let leftLimit = 0;
    let xLimit = 0;
    let dimRight = 0;
    let yLimit = 0;
    let xCenter = 0;
    let yCenter = 0;
    let dimDown = 0;
    let dim: Dimension;

    // Each dim is: Top, Left, Height, Width
    for (var i = 0, len = dims.length; i < len; i++) {
      dim = dims[i];
      const { top, left, height, width } = dim;
      // Right position of the element. Left + Width
      dimRight = left + width;
      // Bottom position of the element. Top + Height
      dimDown = top + height;
      // X center position of the element. Left + (Width / 2)
      xCenter = left + width / 2;
      // Y center position of the element. Top + (Height / 2)
      yCenter = top + height / 2;
      // Skip if over the limits
      if (
        (xLimit && left > xLimit) ||
        (yLimit && yCenter >= yLimit) || // >= avoid issue with clearfixes
        (leftLimit && dimRight < leftLimit)
      )
        continue;
      result.index = i;
      result.indexEl = dim.indexEl!;
      // If it's not in flow (like 'float' element)
      if (!dim.dir) {
        if (posY < dimDown) yLimit = dimDown;
        //If x lefter than center
        if (posX < xCenter) {
          xLimit = xCenter;
          result.method = 'before';
        } else {
          leftLimit = xCenter;
          result.method = 'after';
        }
      } else {
        // If y upper than center
        if (posY < yCenter) {
          result.method = 'before';
          break;
        } else result.method = 'after'; // After last element
      }
    }

    return result;
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
  private dimsFromTarget(target: HTMLElement, rX = 0, rY = 0): Dimension[] {
    const em = this.em;
    let dims: Dimension[] = [];

    if (!target) return dims;

    target = this.getValidTarget(target)!;

    if (!target) return dims;

    if (this.isNewTarget(target)) {
      this.handleNewTarget(target, rX, rY);
    }

    dims = this.getTargetDimensions(target, rX, rY);

    this.clearLastPosition();

    return dims;
  }

  /**
 * Retrieve and return the dimensions for the target, considering any potential
 * parent element dimensions if necessary.
 *
 * @param {HTMLElement} target - The target element.
 * @param {number} rX - Relative X position.
 * @param {number} rY - Relative Y position.
 * @return {Dimension[]} - The dimensions array of the target.
 * @private
 */
  private getTargetDimensions(target: HTMLElement, rX: number, rY: number): Dimension[] {
    let dims = this.cacheDims!;

    if (this.nearBorders(this.prevTargetDim!, rX, rY) || (!this.dragBehavior.nested && !this.cacheDims!.length)) {
      const targetParent = this.targetP;

      if (targetParent && this.validTarget(targetParent).valid) {
        dims = this.cacheDimsP!;
        this.targetElement = targetParent;
      }
    }

    this.targetElement = this.prevTargetElement;

    return dims;
  }

  /**
 * Check if the coordinates are near to the borders
 * @param {Array<number>} dim
 * @param {number} rX Relative X position
 * @param {number} rY Relative Y position
 * @return {Boolean}
 * */
  nearBorders(dim: Dimension, rX: number, rY: number) {
    let result = false;
    const off = this.positionOptions.borderOffset;
    const x = rX || 0;
    const y = rY || 0;
    const t = dim.top;
    const l = dim.left;
    const h = dim.height;
    const w = dim.width;
    if (t + off > y || y > t + h - off || l + off > x || x > l + w - off) result = true;

    return result;
  }

  /**
   * Clears the last known position data.
   *
   * @private
   */
  private clearLastPosition(): void {
    delete this.lastPos;
  }

  /**
 * Get a valid target by checking if the target matches specific selectors
 * and if not, find the closest valid target.
 *
 * @param {HTMLElement} target - The target element.
 * @return {HTMLElement | null} - The valid target element or null if none found.
 * @private
 */
  private getValidTarget(target: HTMLElement): HTMLElement | null {
    if (!this.matches(target, `${this.containerContext.itemSel}, ${this.containerContext.containerSel}`)) {
      target = this.closest(target, this.containerContext.itemSel)!;
    }

    return target;
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

    this.targetP = this.closest(target, this.containerContext.containerSel);

    const validResult = this.validTarget(target);
    em && em.trigger('sorter:drag:validation', validResult);

    if (!validResult.valid && this.targetP) {
      this.dimsFromTarget(this.targetP, rX, rY);
      return;
    }

    this.prevTargetElement = target;
    this.prevTargetDim = this.getDim(target);
    this.cacheDimsP = this.getChildrenDim(this.targetP!);
    this.cacheDims = this.getChildrenDim(target);
  }

  /**
 * Returns dimensions and positions about the element
 * @param {HTMLElement} el
 * @return {Array<number>}
 */
  getDim(el: HTMLElement): Dimension {
    const { em } = this;
    const canvasRelative = this.positionOptions.canvasRelative;
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
      var o = this.offset(el);
      top = this.positionOptions.relative ? el.offsetTop : o.top - (this.positionOptions.windowMargin ? -1 : 1) * this.elT;
      left = this.positionOptions.relative ? el.offsetLeft : o.left - (this.positionOptions.windowMargin ? -1 : 1) * this.elL;
      height = el.offsetHeight;
      width = el.offsetWidth;
    }

    return { top, left, height, width, offsets };
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

      if (!isTextNode(el) && !this.matches(el, this.containerContext.itemSel)) {
        return;
      }

      const dim = this.getDim(el);
      let dir = this.dragBehavior.dragDirection;
      let dirValue: boolean;

      if (dir === SorterDirection.Vertical) dirValue = true;
      else if (dir === SorterDirection.Horizontal) dirValue = false;
      else dirValue = this.isInFlow(el, trg);

      dim.dir = dirValue;
      dim.el = el;
      dim.indexEl = elIndex;
      dims.push(dim);
    });

    return dims;
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
  private isInFlow(el: HTMLElement, parent: HTMLElement = document.body): boolean {
    if (!el) return false;

    const elementHeight = el.offsetHeight;
    if (!this.isStyleInFlow(el, parent)) return false;

    return true;
  }

  /**
   * Checks if an element has styles that keep it in the document flow.
   * Considers properties like `float`, `position`, and certain display types.
   *
   * @param  {HTMLElement} el - The element to check.
   * @param  {HTMLElement} parent - The parent element for additional style checks.
   * @return {boolean} Returns `true` if the element is styled to be in flow, otherwise `false`.
   * @private
   */
  private isStyleInFlow(el: HTMLElement, parent: HTMLElement): boolean {
    if (this.isTextNode(el)) return false;

    const elementStyles = el.style || {};
    const $el = $(el);
    const $parent = $(parent);

    // Check overflow property
    if (elementStyles.overflow && elementStyles.overflow !== 'visible') return false;

    // Check float property
    const elementFloat = $el.css('float');
    if (elementFloat && elementFloat !== 'none') return false;

    // Check parent for flexbox display and non-column flex-direction
    if ($parent.css('display') === 'flex' && $parent.css('flex-direction') !== 'column') return false;

    // Check position property
    if (!this.isInFlowPosition(elementStyles.position)) return false;

    // Check tag and display properties
    return this.isFlowElementTag(el) || this.isFlowElementDisplay($el);
  }

  /**
 * Determines if the element's `position` style keeps it in the flow.
 *
 * @param {string} position - The position style of the element.
 * @return {boolean} Returns `true` if the position keeps the element in flow.
 * @private
 */
  private isInFlowPosition(position: string): boolean {
    switch (position) {
      case 'static':
      case 'relative':
      case '':
        return true;
      default:
        return false;
    }
  }

  /**
   * Checks if the element's tag name represents an element typically in flow.
   *
   * @param {HTMLElement} el - The element to check.
   * @return {boolean} Returns `true` if the tag name represents a flow element.
   * @private
   */
  private isFlowElementTag(el: HTMLElement): boolean {
    const flowTags = ['TR', 'TBODY', 'THEAD', 'TFOOT'];
    return flowTags.includes(el.tagName);
  }

  /**
   * Checks if the element's display style keeps it in flow.
   *
   * @param {JQuery} $el - The jQuery-wrapped element to check.
   * @return {boolean} Returns `true` if the display style represents a flow element.
   * @private
   */
  private isFlowElementDisplay($el: JQuery): boolean {
    const display = $el.css('display');
    const flowDisplays = ['block', 'list-item', 'table', 'flex', 'grid'];
    return flowDisplays.includes(display);
  }

  /**
   * Checks if the node is a text node.
   *
   * @param {Node} node - The node to check.
   * @return {boolean} Returns `true` if the node is a text node, otherwise `false`.
   * @private
   */
  private isTextNode(node: Node): boolean {
    return node.nodeType === Node.TEXT_NODE;
  }

  /**
 * Check if the target is valid with the actual source
 * @param  {HTMLElement} trg
 * @return {Boolean}
 */
  validTarget(trg: HTMLElement, src?: HTMLElement) {
    const pos = this.lastPos;
    const trgModel = this.targetModel;
    const srcModel = this.sourceModel;
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
    // @ts-ignore
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
 * Checks if the provided target is different from the previous one.
 *
 * @param {HTMLElement} target - The target element.
 * @return {boolean} - Whether the target is a new one.
 * @private
 */
  private isNewTarget(target: HTMLElement): boolean {
    if (this.prevTargetElement && this.prevTargetElement !== target) {
      delete this.prevTargetElement;
    }

    return !this.prevTargetElement;
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

    if (this.positionOptions.canvasRelative && em) {
      const mousePos = em.Canvas.getMouseRelativeCanvas(mouseEvent, { noScroll: 1 });
      mouseXRelativeToContainer = mousePos.x;
      mouseYRelativeToContainer = mousePos.y;
    }

    return { mouseXRelativeToContainer, mouseYRelativeToContainer };
  }


  /**
 * Caches the container position and updates relevant variables for position calculation.
 *
 * @param {MouseEvent} mouseEvent - The current mouse event.
 * @private
 */
  private cacheContainerPosition(mouseEvent: MouseEvent): void {
    const containerOffset = this.offset(this.containerContext.container);
    this.elT = this.positionOptions.windowMargin ? Math.abs(containerOffset.top) : containerOffset.top;
    this.elL = this.positionOptions.windowMargin ? Math.abs(containerOffset.left) : containerOffset.left;
  }

  /**
   * Get the offset of the element
   * @param  {HTMLElement} el
   * @return {Object}
   */
  private offset(el: HTMLElement) {
    const rect = el.getBoundingClientRect();

    return {
      top: rect.top + document.body.scrollTop,
      left: rect.left + document.body.scrollLeft,
    };
  }

  private resetDragStates() {
    delete this.dropModel;
    delete this.targetElement;
    delete this.prevTargetElement;
    this.moved = false;
  }

  updateContainer(container: HTMLElement) {
    this.containerContext.container = container;
  }

  updateDocs(docs: Document[]) {
    this.docs = docs;
  }

  /**
 * Returns true if the element matches with selector
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 */
  matches(el: HTMLElement, selector: string): boolean {
    return matches.call(el, selector);
  }

  /**
   * Closest parent
   * @param {Element} el
   * @param {String} selector
   * @return {Element|null}
   */
  closest(el: HTMLElement, selector: string): HTMLElement | undefined {
    if (!el) return;
    let elem = el.parentNode;

    while (elem && elem.nodeType === 1) {
      if (this.matches(elem as HTMLElement, selector)) return elem as HTMLElement;
      elem = elem.parentNode;
    }
  }
}
