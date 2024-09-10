import { bindAll, each, isArray, isFunction, isUndefined, result } from 'underscore';
import { BlockProperties } from '../block_manager/model/Block';
import CanvasModule from '../canvas';
import { CanvasSpotBuiltInTypes } from '../canvas/model/CanvasSpot';
import { $, Model, View } from '../common';
import EditorModel from '../editor/model/Editor';
import { getPointerEvent, isTextNode, off, on } from './dom';
import { getElement, getModel, matches } from './mixins';
import { TreeSorterBase } from './TreeSorterBase';

type DropContent = BlockProperties['content'];

interface Dim {
  top: number;
  left: number;
  height: number;
  width: number;
  offsets: ReturnType<CanvasModule['getElementOffsets']>;
  dir?: boolean;
  el?: HTMLElement;
  indexEl?: number;
}

interface Pos {
  index: number;
  indexEl: number;
  method: string;
}

export interface SorterOptions<T> {
  em?: EditorModel;
  treeClass: new (model: T) => TreeSorterBase<T>;
  pfx?: string;
  ppfx?: string;
  container?: HTMLElement;
  containerSel?: string;
  itemSel?: string;
  wmargin?: number;
  borderOffset?: number;
  offsetTop?: number;
  offsetLeft?: number;
  canvasRelative?: boolean;
  scale?: number;
  relative?: boolean;
  direction?: 'v' | 'h' | 'a';
  nested?: boolean;
  freezeClass?: string;
  onStart?: Function;
  onMove?: Function;
  onEndMove?: Function;
  onEnd?: Function;
  customTarget?: Function;
  ignoreViewChildren?: boolean;
  placeholderElement?: HTMLElement;
  document?: Document;
  avoidSelectOnEnd?: boolean;
}

const noop = () => { };

const targetSpotType = CanvasSpotBuiltInTypes.Target;

const spotTarget = {
  id: 'sorter-target',
  type: targetSpotType,
};

export default class Sorter<T> extends View {
  treeClass!: new (model: any) => TreeSorterBase<T>;
  options!: SorterOptions<T>;
  elT!: number;
  elL!: number;
  borderOffset!: number;
  containerSel!: string;
  itemSel!: string;
  nested!: boolean;
  pfx!: string;
  ppfx?: string;

  onStart!: Function;
  onEndMove?: Function;
  customTarget?: Function;
  onEnd?: Function;
  onMoveClb?: Function;
  dragDirection!: 'v' | 'h' | 'a';
  relative!: boolean;
  ignoreViewChildren!: boolean;
  placeholderElement?: HTMLElement;
  document!: Document;
  wmargin!: number;
  offTop!: number;
  offLeft!: number;
  dropContent?: DropContent;
  em?: EditorModel;
  dropTargetIndicator?: HTMLElement;
  canvasRelative!: boolean;
  selectOnEnd!: boolean;
  scale?: number;
  activeTextModel?: Model;
  dropModel?: Model;

  targetElement?: HTMLElement;
  prevTargetElement?: HTMLElement;
  sourceElement?: HTMLElement;
  moved?: boolean;
  sourceModel?: Model;
  targetModel?: Model;
  mouseXRelativeToContainer?: number;
  mouseYRelativeToContainer?: number;
  eventMove?: MouseEvent;
  prevTargetDim?: Dim;
  cacheDimsP?: Dim[];
  cacheDims?: Dim[];
  targetP?: HTMLElement;
  targetPrev?: HTMLElement;
  lastPos?: Pos;
  lastDims?: Dim[];
  $placeholderElement?: any;
  toMove?: Model | Model[];

  /** @ts-ignore */
  initialize(opt: SorterOptions = {}) {
    this.options = opt || {};
    bindAll(this, 'startSort', 'onMove', 'endMove', 'rollback', 'updateOffset', 'moveDragHelper');
    var o = opt || {};
    this.elT = 0;
    this.elL = 0;
    this.borderOffset = o.borderOffset || 10;

    var el = o.container;
    this.el = typeof el === 'string' ? document.querySelector(el)! : el!;
    this.$el = $(this.el); // TODO check if necessary
    this.treeClass = o.treeClass;

    this.containerSel = o.containerSel || 'div';
    this.itemSel = o.itemSel || 'div';
    this.nested = !!o.nested;
    this.pfx = o.pfx || '';
    this.ppfx = o.ppfx || '';
    this.onStart = o.onStart || noop;
    this.onEndMove = o.onEndMove;
    this.customTarget = o.customTarget;
    this.onEnd = o.onEnd;
    this.dragDirection = o.direction || 'v'; // v (vertical), h (horizontal), a (auto)
    this.onMoveClb = o.onMove;
    this.relative = o.relative || false;
    this.ignoreViewChildren = !!o.ignoreViewChildren;
    this.placeholderElement = o.placer;
    // Frame offset
    this.wmargin = o.wmargin || 0;
    this.offTop = o.offsetTop || 0;
    this.offLeft = o.offsetLeft || 0;
    this.document = o.document || document;
    this.em = o.em;
    this.canvasRelative = !!o.canvasRelative;
    this.selectOnEnd = !o.avoidSelectOnEnd;
    this.scale = o.scale;
    const { em } = this;

    if (em?.on) {
      em.on(em.Canvas.events.refresh, this.updateOffset);
      this.updateOffset();
    }
  }

  getScale() {
    return result(this, 'scale') || 1;
  }

  getContainerEl(elem?: HTMLElement) {
    if (elem) this.el = elem;

    if (!this.el) {
      var el = this.options.container;
      this.el = typeof el === 'string' ? document.querySelector(el)! : el!;
      this.$el = $(this.el); // TODO check if necessary
    }

    return this.el;
  }

  getDocuments(el?: HTMLElement) {
    const em = this.em;
    const elDoc = el ? el.ownerDocument : em?.Canvas.getBody().ownerDocument;
    const docs = [document];
    elDoc && docs.push(elDoc);
    return docs;
  }

  /**
   * Triggered when the offset of the editor is changed
   */
  updateOffset() {
    const offset = this.em?.get('canvasOffset') || {};
    this.offTop = offset.top;
    this.offLeft = offset.left;
  }

  /**
   * Set content to drop
   * @param {String|Object} content
   */
  setDropContent(content: DropContent) {
    delete this.dropModel;
    this.dropContent = content;
  }

  updateTextViewCursorPosition(e: any) {
    const { em } = this;
    if (!em) return;
    const Canvas = em.Canvas;
    const targetDoc = Canvas.getDocument();
    let range = null;

    if (targetDoc.caretRangeFromPoint) {
      // Chrome
      const poiner = getPointerEvent(e);
      range = targetDoc.caretRangeFromPoint(poiner.clientX, poiner.clientY);
    } else if (e.rangeParent) {
      // Firefox
      range = targetDoc.createRange();
      range.setStart(e.rangeParent, e.rangeOffset);
    }

    const sel = Canvas.getWindow().getSelection();
    Canvas.getFrameEl().focus();
    sel?.removeAllRanges();
    range && sel?.addRange(range);
    this.setContentEditable(this.activeTextModel, true);
  }

  setContentEditable(model?: Model, mode?: boolean) {
    if (model) {
      // @ts-ignore
      const el = model.getEl();
      if (el.contentEditable != mode) el.contentEditable = mode;
    }
  }

  /**
   * Toggle cursor while sorting
   * @param {Boolean} active
   */
  toggleSortCursor(active?: boolean) {
    const { em } = this;
    const cv = em?.Canvas;

    // Avoid updating body className as it causes a huge repaint
    // Noticeable with "fast" drag of blocks
    cv && (active ? cv.startAutoscroll() : cv.stopAutoscroll());
  }

  /**
   * Set drag helper
   * @param {HTMLElement} el
   * @param {Event} event
   */
  setDragHelper(el: HTMLElement, event: Event) {
    const ev = event || '';
    const clonedEl = el.cloneNode(true) as HTMLElement;
    const rect = el.getBoundingClientRect();
    const computed = getComputedStyle(el);
    let style = '';

    for (var i = 0; i < computed.length; i++) {
      const prop = computed[i];
      style += `${prop}:${computed.getPropertyValue(prop)};`;
    }

    document.body.appendChild(clonedEl);
    clonedEl.className += ` ${this.pfx}bdrag`;
    clonedEl.setAttribute('style', style);
    this.dropTargetIndicator = clonedEl;
    clonedEl.style.width = `${rect.width}px`;
    clonedEl.style.height = `${rect.height}px`;
    ev && this.moveDragHelper(ev);

    // Listen mouse move events
    if (this.em) {
      const $doc = $(this.em.Canvas.getBody().ownerDocument);
      $doc.off('mousemove', this.moveDragHelper).on('mousemove', this.moveDragHelper);
    }
    $(document).off('mousemove', this.moveDragHelper).on('mousemove', this.moveDragHelper);
  }

  /**
   * Update the position of the helper
   * @param  {Event} e
   */
  moveDragHelper(e: any) {
    const doc = (e.target as HTMLElement).ownerDocument;

    if (!this.dropTargetIndicator || !doc) {
      return;
    }

    let posY = e.pageY;
    let posX = e.pageX;
    let addTop = 0;
    let addLeft = 0;
    // @ts-ignore
    const window = doc.defaultView || (doc.parentWindow as Window);
    const frame = window.frameElement;
    const dragHelperStyle = this.dropTargetIndicator.style;

    // If frame is present that means mouse has moved over the editor's canvas,
    // which is rendered inside the iframe and the mouse move event comes from
    // the iframe, not the parent window. Mouse position relative to the frame's
    // parent window needs to account for the frame's position relative to the
    // parent window.
    if (frame) {
      const frameRect = frame.getBoundingClientRect();
      addTop = frameRect.top + document.documentElement.scrollTop;
      addLeft = frameRect.left + document.documentElement.scrollLeft;
      posY = e.clientY;
      posX = e.clientX;
    }

    dragHelperStyle.top = posY + addTop + 'px';
    dragHelperStyle.left = posX + addLeft + 'px';
  }

  /**
   * Returns true if the element matches with selector
   * @param {Element} el
   * @param {String} selector
   * @return {Boolean}
   */
  matches(el: HTMLElement, selector: string) {
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

  /**
   * Get the offset of the element
   * @param  {HTMLElement} el
   * @return {Object}
   */
  offset(el: HTMLElement) {
    const rect = el.getBoundingClientRect();

    return {
      top: rect.top + document.body.scrollTop,
      left: rect.left + document.body.scrollLeft,
    };
  }

  /**
   * Create placeholder
   * @return {HTMLElement}
   */
  createPlaceholder() {
    const { pfx } = this;
    const el = document.createElement('div');
    const ins = document.createElement('div');
    el.className = pfx + 'placeholder';
    el.style.display = 'none';
    el.style.pointerEvents = 'none';
    ins.className = pfx + 'placeholder-int';
    el.appendChild(ins);
    return el;
  }

  /**
   * Picking component to move
   * @param {HTMLElement} src
   * */
  startSort(src?: HTMLElement, opts: { container?: HTMLElement } = {}) {
    const { em, itemSel, containerSel, placeholderElement: plh } = this;
    const container = this.getContainerEl(opts.container);
    const docs = this.getDocuments(src);
    let srcModel;
    delete this.dropModel;
    delete this.targetElement;
    delete this.prevTargetElement;
    this.moved = false;

    // Check if the start element is a valid one, if not, try the closest valid one
    if (src && !this.matches(src, `${itemSel}, ${containerSel}`)) {
      src = this.closest(src, itemSel)!;
    }

    this.sourceElement = src;

    // Create placeholder if doesn't exist yet
    if (!plh) {
      this.placeholderElement = this.createPlaceholder();
      container.appendChild(this.placeholderElement);
    }

    if (src) {
      srcModel = this.getSourceModel(src);
      srcModel?.set && srcModel.set('status', 'freezed');
      this.sourceModel = srcModel;
    }

    on(container, 'mousemove dragover', this.onMove as any);
    on(docs, 'mouseup dragend touchend', this.endMove);
    on(docs, 'keydown', this.rollback);
    this.onStart({
      sorter: this,
      target: srcModel,
      // @ts-ignore
      parent: srcModel && srcModel.parent?.(),
      // @ts-ignore
      index: srcModel && srcModel.index?.(),
    });

    // Avoid strange effects on dragging
    em?.clearSelection();
    this.toggleSortCursor(true);
    em?.trigger('sorter:drag:start', src, srcModel);
  }

  /**
   * Get the model from HTMLElement target
   * @return {Model|null}
   */
  getTargetModel(el: HTMLElement) {
    const elem = el || this.targetElement;
    return $(elem).data('model');
  }

  getTargetNode(el: HTMLElement) {
    return new this.treeClass(this.getTargetModel(el));
  }

  getSourceNode(el: HTMLElement) {
    return new this.treeClass(this.getTargetModel(el));
  }

  /**
   * Get the model of the current source element (element to drag)
   * @return {Model}
   */
  getSourceModel(source?: HTMLElement, { target, avoidChildren = 1 }: any = {}): Model {
    const { em, sourceElement: sourceEl } = this;
    const src = source || sourceEl;
    let { dropModel, dropContent } = this;
    const isTextable = (src: any) =>
      src && target && src.opt && src.opt.avoidChildren && this.isTextableActive(src, target);

    if (dropContent && em) {
      if (isTextable(dropModel)) {
        dropModel = undefined;
      }

      if (!dropModel) {
        const comps = em.Components.getComponents();
        const opts = {
          avoidChildren,
          avoidStore: 1,
          avoidUpdateStyle: 1,
        };
        const tempModel = comps.add(dropContent, { ...opts, temporary: true });
        // @ts-ignore
        dropModel = comps.remove(tempModel, opts as any);
        dropModel = dropModel instanceof Array ? dropModel[0] : dropModel;
        this.dropModel = dropModel;

        if (isTextable(dropModel)) {
          return this.getSourceModel(src, { target, avoidChildren: 0 });
        }
      }

      return dropModel!;
    }

    return src && $(src).data('model');
  }

  /**
   * Highlight target
   * @param  {Model|null} model
   */
  selectTargetModel(model?: Model, source?: Model) {
    // if (model instanceof Collection) {
    //   return;
    // }

    // Prevents loops in Firefox
    // https://github.com/GrapesJS/grapesjs/issues/2911
    if (source && source === model) return;

    const { targetModel } = this;

    // Reset the previous model but not if it's the same as the source
    // https://github.com/GrapesJS/grapesjs/issues/2478#issuecomment-570314736
    if (targetModel && targetModel !== this.sourceModel) {
      targetModel.set && targetModel.set('status', '');
    }

    if (model?.set) {
      const cv = this.em!.Canvas;
      const { Select, Hover, Spacing } = CanvasSpotBuiltInTypes;
      [Select, Hover, Spacing].forEach((type) => cv.removeSpots({ type }));
      cv.addSpot({ ...spotTarget, component: model as any });
      model.set('status', 'selected-parent');
      this.targetModel = model;
    }
  }

  /**
   * During move
   * @param {Event} e
   * */
  onMove(e: MouseEvent) {
    const ev = e;
    const { em, onMoveClb, placeholderElement: plh, customTarget } = this;
    this.moved = true;

    // Turn placeholder visibile
    const dsp = plh!.style.display;
    if (!dsp || dsp === 'none') plh!.style.display = 'block';

    // Cache all necessary positions
    var eO = this.offset(this.el);
    this.elT = this.wmargin ? Math.abs(eO.top) : eO.top;
    this.elL = this.wmargin ? Math.abs(eO.left) : eO.left;
    var rY = e.pageY - this.elT + this.el.scrollTop;
    var rX = e.pageX - this.elL + this.el.scrollLeft;

    if (this.canvasRelative && em) {
      const mousePos = em.Canvas.getMouseRelativeCanvas(e, { noScroll: 1 });
      rX = mousePos.x;
      rY = mousePos.y;
    }

    this.mouseXRelativeToContainer = rX;
    this.mouseYRelativeToContainer = rY;
    this.eventMove = e;

    //var targetNew = this.getTargetFromEl(e.target);
    const sourceModel = this.getSourceModel();
    const targetEl = customTarget ? customTarget({ sorter: this, event: e }) : e.target;
    const dims = this.dimsFromTarget(targetEl as HTMLElement, rX, rY);
    const target = this.targetElement;
    const targetModel = target && this.getTargetModel(target);
    this.selectTargetModel(targetModel, sourceModel);
    if (!targetModel) plh!.style.display = 'none';
    if (!target) return;
    this.lastDims = dims;
    const pos = this.findPosition(dims, rX, rY);

    if (this.isTextableActive(sourceModel, targetModel)) {
      this.activeTextModel = targetModel;
      plh!.style.display = 'none';
      this.lastPos = pos;
      this.updateTextViewCursorPosition(ev);
    } else {
      this.disableTextable();
      delete this.activeTextModel;

      // If there is a significant changes with the pointer
      if (!this.lastPos || this.lastPos.index != pos.index || this.lastPos.method != pos.method) {
        this.movePlaceholder(this.placeholderElement!, dims, pos, this.prevTargetDim);
        if (!this.$placeholderElement) this.$placeholderElement = $(this.placeholderElement!);

        // With canvasRelative the offset is calculated automatically for
        // each element
        if (!this.canvasRelative) {
          if (this.offTop) this.$placeholderElement.css('top', '+=' + this.offTop + 'px');
          if (this.offLeft) this.$placeholderElement.css('left', '+=' + this.offLeft + 'px');
        }

        this.lastPos = pos;
      }
    }

    isFunction(onMoveClb) &&
      onMoveClb({
        event: e,
        target: sourceModel,
        parent: targetModel,
        index: pos.index + (pos.method == 'after' ? 1 : 0),
      });

    em &&
      em.trigger('sorter:drag', {
        target,
        targetModel,
        sourceModel,
        dims,
        pos,
        x: rX,
        y: rY,
      });
  }

  isTextableActive(src: any, trg: any): boolean {
    return !!(src?.get?.('textable') && trg?.isInstanceOf('text'));
  }

  disableTextable() {
    const { activeTextModel } = this;
    // @ts-ignore
    activeTextModel?.getView().disableEditing();
    this.setContentEditable(activeTextModel, false);
  }

  /**
   * Returns true if the elements is in flow, so is not in flow where
   * for example the component is with float:left
   * @param  {HTMLElement} el
   * @param  {HTMLElement} parent
   * @return {Boolean}
   * @private
   * */
  isInFlow(el: HTMLElement, parent?: HTMLElement) {
    if (!el) return false;

    parent = parent || document.body;
    var ch = -1,
      h;
    var elem = el;
    h = elem.offsetHeight;
    if (/*h < ch || */ !this.styleInFlow(elem, parent)) return false;
    else return true;
  }

  /**
   * Check if el has style to be in flow
   * @param  {HTMLElement} el
   * @param  {HTMLElement} parent
   * @return {Boolean}
   * @private
   */
  styleInFlow(el: HTMLElement, parent: HTMLElement) {
    if (isTextNode(el)) return;
    const style = el.style || {};
    const $el = $(el);
    const $parent = parent && $(parent);

    if (style.overflow && style.overflow !== 'visible') return;
    const propFloat = $el.css('float');
    if (propFloat && propFloat !== 'none') return;
    if ($parent && $parent.css('display') == 'flex' && $parent.css('flex-direction') !== 'column') return;
    switch (style.position) {
      case 'static':
      case 'relative':
      case '':
        break;
      default:
        return;
    }
    switch (el.tagName) {
      case 'TR':
      case 'TBODY':
      case 'THEAD':
      case 'TFOOT':
        return true;
    }
    switch ($el.css('display')) {
      case 'block':
      case 'list-item':
      case 'table':
      case 'flex':
      case 'grid':
        return true;
    }
    return;
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
   * Get dimensions of nodes relative to the coordinates
   * @param  {HTMLElement} target
   * @param {number} rX Relative X position
   * @param {number} rY Relative Y position
   * @return {Array<Array>}
   */
  dimsFromTarget(target: HTMLElement, rX = 0, rY = 0): Dim[] {
    const em = this.em;
    let dims: Dim[] = [];

    if (!target) {
      return dims;
    }

    // Select the first valuable target
    if (!this.matches(target, `${this.itemSel}, ${this.containerSel}`)) {
      target = this.closest(target, this.itemSel)!;
    }

    if (!target) {
      return dims;
    }

    // Check if the target is different from the previous one
    if (this.prevTargetElement && this.prevTargetElement != target) {
      delete this.prevTargetElement;
    }

    // New target found
    if (!this.prevTargetElement) {
      this.targetP = this.closest(target, this.containerSel);

      // Check if the source is valid with the target
      let validResult = this.validTarget(target);
      em && em.trigger('sorter:drag:validation', validResult);

      if (!validResult.valid && this.targetP) {
        return this.dimsFromTarget(this.targetP, rX, rY);
      }

      this.prevTargetElement = target;
      this.prevTargetDim = this.getDim(target);
      this.cacheDimsP = this.getChildrenDim(this.targetP!);
      this.cacheDims = this.getChildrenDim(target);
    }

    // If the target is the previous one will return the cached dims
    if (this.prevTargetElement == target) dims = this.cacheDims!;

    // Target when I will drop element to sort
    this.targetElement = this.prevTargetElement;

    // Generally, on any new target the poiner enters inside its area and
    // triggers nearBorders(), so have to take care of this
    if (this.nearBorders(this.prevTargetDim!, rX, rY) || (!this.nested && !this.cacheDims!.length)) {
      const targetParent = this.targetP;

      if (targetParent && this.validTarget(targetParent).valid) {
        dims = this.cacheDimsP!;
        this.targetElement = targetParent;
      }
    }

    delete this.lastPos;
    return dims;
  }

  /**
   * Get valid target from element
   * This method should replace dimsFromTarget()
   * @param  {HTMLElement} el
   * @return {HTMLElement}
   */
  getTargetFromEl(el: HTMLElement): HTMLElement {
    let target = el;
    let targetParent;
    let targetPrev = this.targetPrev;
    const em = this.em;
    const containerSel = this.containerSel;
    const itemSel = this.itemSel;

    // Select the first valuable target
    if (!this.matches(target, `${itemSel}, ${containerSel}`)) {
      target = this.closest(target, itemSel)!;
    }

    // Check if the target is different from the previous one
    if (targetPrev && targetPrev != target) {
      delete this.targetPrev;
    }

    // New target found
    if (!this.targetPrev) {
      targetParent = this.closest(target, containerSel);

      // If the current target is not valid (src/trg reasons) try with
      // the parent one (if exists)
      const validResult = this.validTarget(target);
      em && em.trigger('sorter:drag:validation', validResult);

      if (!validResult.valid && targetParent) {
        return this.getTargetFromEl(targetParent);
      }

      this.targetPrev = target;
    }

    // Generally, on any new target the poiner enters inside its area and
    // triggers nearBorders(), so have to take care of this
    if (this.nearElBorders(target)) {
      targetParent = this.closest(target, containerSel);

      if (targetParent && this.validTarget(targetParent).valid) {
        target = targetParent;
      }
    }

    return target;
  }

  /**
   * Check if the current pointer is neare to element borders
   * @return {Boolen}
   */
  nearElBorders(el: HTMLElement) {
    const off = 10;
    const rect = el.getBoundingClientRect();
    const body = el.ownerDocument.body;
    const { x, y } = this.getCurrentPos();
    const top = rect.top + body.scrollTop;
    const left = rect.left + body.scrollLeft;
    const width = rect.width;
    const height = rect.height;

    if (
      y < top + off || // near top edge
      y > top + height - off || // near bottom edge
      x < left + off || // near left edge
      x > left + width - off // near right edge
    ) {
      return 1;
    }
  }

  getCurrentPos() {
    const ev = this.eventMove;
    const x = ev?.pageX || 0;
    const y = ev?.pageY || 0;
    return { x, y };
  }

  /**
   * Returns dimensions and positions about the element
   * @param {HTMLElement} el
   * @return {Array<number>}
   */
  getDim(el: HTMLElement): Dim {
    const { em, canvasRelative } = this;
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
      top = this.relative ? el.offsetTop : o.top - (this.wmargin ? -1 : 1) * this.elT;
      left = this.relative ? el.offsetLeft : o.left - (this.wmargin ? -1 : 1) * this.elL;
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
    const dims: Dim[] = [];
    if (!trg) return dims;

    // Get children based on getChildrenContainer
    const trgModel = this.getTargetModel(trg);
    if (trgModel && trgModel.view && !this.ignoreViewChildren) {
      const view = trgModel.getCurrentView ? trgModel.getCurrentView() : trgModel.view;
      trg = view.getChildrenContainer();
    }

    each(trg.children, (ele, i) => {
      const el = ele as HTMLElement;
      const model = getModel(el, $);
      const elIndex = model && model.index ? model.index() : i;

      if (!isTextNode(el) && !this.matches(el, this.itemSel)) {
        return;
      }

      const dim = this.getDim(el);
      let dir = this.dragDirection;
      let dirValue: boolean;

      if (dir == 'v') dirValue = true;
      else if (dir == 'h') dirValue = false;
      else dirValue = this.isInFlow(el, trg);

      dim.dir = dirValue;
      dim.el = el;
      dim.indexEl = elIndex;
      dims.push(dim);
    });

    return dims;
  }

  /**
   * Check if the coordinates are near to the borders
   * @param {Array<number>} dim
   * @param {number} rX Relative X position
   * @param {number} rY Relative Y position
   * @return {Boolean}
   * */
  nearBorders(dim: Dim, rX: number, rY: number) {
    let result = false;
    const off = this.borderOffset;
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
   * Find the position based on passed dimensions and coordinates
   * @param {Array<Array>} dims Dimensions of nodes to parse
   * @param {number} posX X coordindate
   * @param {number} posY Y coordindate
   * @return {Object}
   * */
  findPosition(dims: Dim[], posX: number, posY: number): Pos {
    const result: Pos = { index: 0, indexEl: 0, method: 'before' };
    let leftLimit = 0;
    let xLimit = 0;
    let dimRight = 0;
    let yLimit = 0;
    let xCenter = 0;
    let yCenter = 0;
    let dimDown = 0;
    let dim: Dim;

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
   * Updates the position of the placeholder
   * @param {HTMLElement} phl
   * @param {Array<Array>} dims
   * @param {Object} pos Position object
   * @param {Array<number>} trgDim target dimensions ([top, left, height, width])
   * */
  movePlaceholder(plh: HTMLElement, dims: Dim[], pos: Pos, trgDim?: Dim) {
    let marg = 0;
    let t = 0;
    let l = 0;
    let w = '';
    let h = '';
    let un = 'px';
    let margI = 5;
    let method = pos.method;
    const elDim = dims[pos.index];

    // Placeholder orientation
    plh.classList.remove('vertical');
    plh.classList.add('horizontal');

    if (elDim) {
      // If it's not in flow (like 'float' element)
      const { top, left, height, width } = elDim;
      if (!elDim.dir) {
        w = 'auto';
        h = height - marg * 2 + un;
        t = top + marg;
        l = method == 'before' ? left - marg : left + width - marg;

        plh.classList.remove('horizontal');
        plh.classList.add('vertical');
      } else {
        w = width + un;
        h = 'auto';
        t = method == 'before' ? top - marg : top + height - marg;
        l = left;
      }
    } else {
      // Placeholder inside the component
      if (!this.nested) {
        plh.style.display = 'none';
        return;
      }
      if (trgDim) {
        const offset = trgDim.offsets || {};
        const pT = offset.paddingTop || margI;
        const pL = offset.paddingLeft || margI;
        const bT = offset.borderTopWidth || 0;
        const bL = offset.borderLeftWidth || 0;
        const bR = offset.borderRightWidth || 0;
        const bWidth = bL + bR;
        t = trgDim.top + pT + bT;
        l = trgDim.left + pL + bL;
        w = parseInt(`${trgDim.width}`) - pL * 2 - bWidth + un;
        h = 'auto';
      }
    }
    plh.style.top = t + un;
    plh.style.left = l + un;
    if (w) plh.style.width = w;
    if (h) plh.style.height = h;
  }

  /**
   * Build an array of all the parents, including the component itself
   * @return {Model|null}
   */
  parents(model: any): any[] {
    return model ? [model].concat(this.parents(model.parent())) : [];
  }

  /**
   * Sort according to the position in the dom
   * @param {Object} obj1 contains {model, parents}
   * @param {Object} obj2 contains {model, parents}
   */
  sort(obj1: any, obj2: any) {
    // common ancesters
    const ancesters = obj1.parents.filter((p: any) => obj2.parents.includes(p));
    const ancester = ancesters[0];
    if (!ancester) {
      // this is never supposed to happen
      return obj2.model.index() - obj1.model.index();
    }
    // find siblings in the common ancester
    // the sibling is the element inside the ancester
    const s1 = obj1.parents[obj1.parents.indexOf(ancester) - 1];
    const s2 = obj2.parents[obj2.parents.indexOf(ancester) - 1];
    // order according to the position in the DOM
    return s2.index() - s1.index();
  }

  /**
   * Leave item
   * @param event
   *
   * @return void
   * */
  endMove() {
    console.trace("here")
    const src = this.sourceElement;
    const moved = [];
    const docs = this.getDocuments();
    const container = this.getContainerEl();
    const onEndMove = this.onEndMove;
    const onEnd = this.onEnd;
    const { targetElement: target, lastPos } = this;
    let srcModel;
    off(container, 'mousemove dragover', this.onMove as any);
    off(docs, 'mouseup dragend touchend', this.endMove);
    off(docs, 'keydown', this.rollback);
    this.placeholderElement!.style.display = 'none';

    if (src) {
      srcModel = this.getSourceModel();
    }

    if (this.moved && target) {
      const toMove = this.toMove;
      const toMoveArr = isArray(toMove) ? toMove : toMove ? [toMove] : [src];
      let domPositionOffset = 0;
      if (toMoveArr.length === 1) {
        // do not sort the array in this case
        // there are cases for the sorter where toMoveArr is [undefined]
        // which allows the drop from blocks, native D&D and sort of layers in Style Manager
        moved.push(this.move(target, toMoveArr[0]!, lastPos!));
      } else {
        toMoveArr
          // add the model's parents
          .map((model) => ({
            model,
            parents: this.parents(model),
          }))
          // sort based on elements positions in the dom
          .sort(this.sort)
          // move each component to the new parent and position
          .forEach(({ model }) => {
            // @ts-ignore store state before move
            const index = model.index();
            // @ts-ignore
            const parent = model.parent().getEl();
            // move the component to the desired position
            moved.push(
              this.move(target, model!, {
                ...lastPos!,
                indexEl: lastPos!.indexEl - domPositionOffset,
                index: lastPos!.index - domPositionOffset,
              }),
            );
            // when the element is dragged to the same parent and after its position
            //  it will be removed from the children list
            //  in that case we need to adjust the following elements target position
            if (parent === target && index <= lastPos!.index) {
              // the next elements will be inserted 1 element before this one
              domPositionOffset++;
            }
          });
      }
    }

    if (this.placeholderElement) this.placeholderElement.style.display = 'none';
    const dragHelper = this.dropTargetIndicator;

    if (dragHelper) {
      dragHelper.parentNode!.removeChild(dragHelper);
      delete this.dropTargetIndicator;
    }

    this.disableTextable();
    this.selectTargetModel();
    this.toggleSortCursor();
    this.em?.Canvas.removeSpots(spotTarget);

    delete this.toMove;
    delete this.eventMove;
    delete this.dropModel;

    if (isFunction(onEndMove)) {
      const data = {
        target: srcModel,
        // @ts-ignore
        parent: srcModel && srcModel.parent(),
        // @ts-ignore
        index: srcModel && srcModel.index(),
      };
      moved.length ? moved.forEach((m) => onEndMove(m, this, data)) : onEndMove(null, this, { ...data, cancelled: 1 });
    }

    isFunction(onEnd) && onEnd({ sorter: this });
  }

  /**
   * Move component to new position
   * @param {HTMLElement} dst Destination target
   * @param {HTMLElement} src Element to move
   * @param {Object} pos Object with position coordinates
   * */
  move(dst: HTMLElement, src: HTMLElement | Model, pos: Pos) {
    const { em, dropContent } = this;
    const srcEl = getElement(src as HTMLElement);
    const warns: string[] = [];
    const index = pos.method === 'after' ? pos.indexEl + 1 : pos.indexEl;
    const validResult = this.validTarget(dst, srcEl);
    const { trgModel, srcModel } = validResult;
    const targetNode = new this.treeClass(trgModel);
    const sourceNode = new this.treeClass(srcModel);
    const targetCollection = targetNode.getChildren();
    const sourceParent = sourceNode.getParent();
    let modelToDrop, created;

    if (!targetCollection && em) {
      // const dropInfo = validResult.dropInfo || trgModel?.get('droppable');
      // const dragInfo = validResult.dragInfo || srcModel?.get('draggable');

      !targetCollection && warns.push('Target collection not found');
      // !droppable && dropInfo && warns.push(`Target is not droppable, accepts [${dropInfo}]`);
      // !draggable && dragInfo && warns.push(`Component not draggable, acceptable by [${dragInfo}]`);
      em.logWarning('Invalid target position', {
        errors: warns,
        model: srcModel,
        context: 'sorter',
        target: trgModel,
      });

      em?.trigger('sorter:drag:end', {
        targetCollection,
        modelToDrop,
        warns,
        validResult,
        dst,
        srcEl,
      });

      return
    }

    const opts: any = { at: index, action: 'move-component' };
    const isTextable = this.isTextableActive(srcModel, trgModel);

    if (!dropContent) {
      const srcIndex = sourceParent?.indexOfChild(sourceNode);
      const trgIndex = targetNode?.indexOfChild(sourceNode);
      const isDraggingIntoSameCollection = trgIndex !== -1;
      if (isUndefined(srcIndex)) {
        return;
      }

      if (isDraggingIntoSameCollection && index > srcIndex) {
        opts.at = index - 1;
      }
      modelToDrop = sourceParent?.removeChildAt(srcIndex)
    } else {
      // @ts-ignore
      modelToDrop = isFunction(dropContent) ? dropContent() : dropContent;
      opts.avoidUpdateStyle = true;
      opts.action = 'add-component';
    }

    if (modelToDrop) {
      if (isTextable) {
        delete opts.at;
        created = trgModel.getView().insertComponent(modelToDrop, opts);
      } else {
        created = targetNode.addChildAt(modelToDrop, opts.at).model;
      }
    }

    delete this.dropContent;
    delete this.prevTargetElement; // This will recalculate children dimensions
    em?.trigger('sorter:drag:end', {
      targetCollection,
      modelToDrop,
      warns,
      validResult,
      dst,
      srcEl,
    });

    return created;
  }

  /**
   * Rollback to previous situation
   * @param {Event}
   * @param {Bool} Indicates if rollback in anycase
   * */
  rollback(e: any) {
    off(this.getDocuments(), 'keydown', this.rollback);
    const key = e.which || e.keyCode;

    if (key == 27) {
      this.moved = false;
      this.endMove();
    }
  }
}
