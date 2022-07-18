import Backbone from 'backbone';
import { isString, isFunction, isArray, result, each, bindAll } from 'underscore';
import { on, off, matches, getElement, getPointerEvent, isTextNode, getModel } from 'utils/mixins';
import { getComponentIds } from '../dom_components/model/Components';

const $ = Backbone.$;

const noop = () => {};

export default Backbone.View.extend({
  initialize(opt) {
    this.opt = opt || {};
    bindAll(this, 'startSort', 'onMove', 'endMove', 'rollback', 'updateOffset', 'moveDragHelper');
    var o = opt || {};
    this.elT = 0;
    this.elL = 0;
    this.borderOffset = o.borderOffset || 10;

    var el = o.container;
    this.el = typeof el === 'string' ? document.querySelector(el) : el;
    this.$el = $(this.el);

    this.containerSel = o.containerSel || 'div';
    this.itemSel = o.itemSel || 'div';
    this.draggable = o.draggable || true;
    this.nested = o.nested || 0;
    this.pfx = o.pfx || '';
    this.ppfx = o.ppfx || '';
    this.freezeClass = o.freezeClass || this.pfx + 'freezed';
    this.onStart = o.onStart || noop;
    this.onEndMove = o.onEndMove || '';
    this.customTarget = o.customTarget;
    this.onEnd = o.onEnd;
    this.direction = o.direction || 'v'; // v (vertical), h (horizontal), a (auto)
    this.onMoveClb = o.onMove || '';
    this.relative = o.relative || 0;
    this.ignoreViewChildren = o.ignoreViewChildren || 0;
    this.ignoreModels = o.ignoreModels || 0;
    this.plh = o.placer || '';
    // Frame offset
    this.wmargin = o.wmargin || 0;
    this.offTop = o.offsetTop || 0;
    this.offLeft = o.offsetLeft || 0;
    this.document = o.document || document;
    this.$document = $(this.document);
    this.dropContent = null;
    this.em = o.em || null;
    this.dragHelper = null;
    this.canvasRelative = o.canvasRelative || 0;
    this.selectOnEnd = !o.avoidSelectOnEnd;
    this.scale = o.scale;
    this.activeTextModel = null;

    if (this.em && this.em.on) {
      this.em.on('change:canvasOffset', this.updateOffset);
      this.updateOffset();
    }
  },

  getScale() {
    return result(this, scale) || 1;
  },

  getContainerEl(elem) {
    if (elem) this.el = elem;

    if (!this.el) {
      var el = this.opt.container;
      this.el = typeof el === 'string' ? document.querySelector(el) : el;
      this.$el = $(this.el);
    }
    return this.el;
  },

  getDocuments(el) {
    const em = this.em;
    const elDoc = el ? el.ownerDocument : em && em.get('Canvas').getBody().ownerDocument;
    const docs = [document];
    elDoc && docs.push(elDoc);
    return docs;
  },

  /**
   * Triggered when the offset of the editro is changed
   */
  updateOffset() {
    const offset = this.em?.get('canvasOffset') || {};
    this.offTop = offset.top;
    this.offLeft = offset.left;
  },

  /**
   * Set content to drop
   * @param {String|Object} content
   */
  setDropContent(content) {
    this.dropModel = null;
    this.dropContent = content;
  },

  updateTextViewCursorPosition(e) {
    const { em } = this;
    if (!em) return;
    const Canvas = em.get('Canvas');
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
    sel.removeAllRanges();
    range && sel.addRange(range);
    this.setContentEditable(this.activeTextModel, true);
  },

  setContentEditable(model, mode) {
    if (model) {
      const el = model.getEl();
      if (el.contentEditable != mode) el.contentEditable = mode;
    }
  },

  /**
   * Toggle cursor while sorting
   * @param {Boolean} active
   */
  toggleSortCursor(active) {
    const { em } = this;
    const cv = em && em.get('Canvas');

    // Avoid updating body className as it causes a huge repaint
    // Noticeable with "fast" drag of blocks
    cv && (active ? cv.startAutoscroll() : cv.stopAutoscroll());
  },

  /**
   * Set drag helper
   * @param {HTMLElement} el
   * @param {Event} event
   */
  setDragHelper(el, event) {
    const ev = event || '';
    const clonedEl = el.cloneNode(1);
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
    this.dragHelper = clonedEl;
    clonedEl.style.width = `${rect.width}px`;
    clonedEl.style.height = `${rect.height}px`;
    ev && this.moveDragHelper(ev);

    // Listen mouse move events
    if (this.em) {
      $(this.em.get('Canvas').getBody().ownerDocument)
        .off('mousemove', this.moveDragHelper)
        .on('mousemove', this.moveDragHelper);
    }
    $(document).off('mousemove', this.moveDragHelper).on('mousemove', this.moveDragHelper);
  },

  /**
   * Update the position of the helper
   * @param  {Event} e
   */
  moveDragHelper(e) {
    const doc = e.target.ownerDocument;

    if (!this.dragHelper || !doc) {
      return;
    }

    let posY = e.pageY;
    let posX = e.pageX;
    let addTop = 0;
    let addLeft = 0;
    const window = doc.defaultView || doc.parentWindow;
    const frame = window.frameElement;
    const dragHelperStyle = this.dragHelper.style;

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
  },

  /**
   * Returns true if the element matches with selector
   * @param {Element} el
   * @param {String} selector
   * @return {Boolean}
   */
  matches(el, selector, useBody) {
    return matches.call(el, selector);
  },

  /**
   * Closest parent
   * @param {Element} el
   * @param {String} selector
   * @return {Element|null}
   */
  closest(el, selector) {
    if (!el) return;
    var elem = el.parentNode;
    while (elem && elem.nodeType === 1) {
      if (this.matches(elem, selector)) return elem;
      elem = elem.parentNode;
    }
    return null;
  },

  /**
   * Get the offset of the element
   * @param  {HTMLElement} el
   * @return {Object}
   */
  offset(el) {
    var rect = el.getBoundingClientRect();
    return {
      top: rect.top + document.body.scrollTop,
      left: rect.left + document.body.scrollLeft,
    };
  },

  /**
   * Create placeholder
   * @return {HTMLElement}
   */
  createPlaceholder() {
    var pfx = this.pfx;
    var el = document.createElement('div');
    var ins = document.createElement('div');
    el.className = pfx + 'placeholder';
    el.style.display = 'none';
    el.style['pointer-events'] = 'none';
    ins.className = pfx + 'placeholder-int';
    el.appendChild(ins);
    return el;
  },

  /**
   * Picking component to move
   * @param {HTMLElement} src
   * */
  startSort(src, opts = {}) {
    const { em, itemSel, containerSel, plh } = this;
    const container = this.getContainerEl(opts.container);
    const docs = this.getDocuments(src);
    let srcModel;
    this.dropModel = null;
    this.target = null;
    this.prevTarget = null;
    this.moved = 0;

    // Check if the start element is a valid one, if not, try the closest valid one
    if (src && !this.matches(src, `${itemSel}, ${containerSel}`)) {
      src = this.closest(src, itemSel);
    }

    this.sourceEl = src;

    // Create placeholder if doesn't exist yet
    if (!plh) {
      this.plh = this.createPlaceholder();
      container.appendChild(this.plh);
    }

    if (src) {
      srcModel = this.getSourceModel(src);
      srcModel && srcModel.set && srcModel.set('status', 'freezed');
      this.srcModel = srcModel;
    }

    on(container, 'mousemove dragover', this.onMove);
    on(docs, 'mouseup dragend touchend', this.endMove);
    on(docs, 'keydown', this.rollback);
    this.onStart({
      sorter: this,
      target: srcModel,
      parent: srcModel && srcModel.parent?.(),
      index: srcModel && srcModel.index?.(),
    });

    // Avoid strange effects on dragging
    em?.clearSelection();
    this.toggleSortCursor(1);
    em?.trigger('sorter:drag:start', src, srcModel);
  },

  /**
   * Get the model from HTMLElement target
   * @return {Model|null}
   */
  getTargetModel(el) {
    let elem = el || this.target;
    return $(elem).data('model');
  },

  /**
   * Get the model of the current source element (element to drag)
   * @return {Model}
   */
  getSourceModel(source, { target, avoidChildren = 1 } = {}) {
    const { em, sourceEl } = this;
    const src = source || sourceEl;
    let { dropModel, dropContent } = this;
    const isTextable = src => src && target && src.opt && src.opt.avoidChildren && this.isTextableActive(src, target);

    if (dropContent && em) {
      if (isTextable(dropModel)) {
        dropModel = null;
      }

      if (!dropModel) {
        const comps = em.get('DomComponents').getComponents();
        const opts = {
          avoidChildren,
          avoidStore: 1,
          avoidUpdateStyle: 1,
        };
        const tempModel = comps.add(dropContent, { ...opts, temporary: 1 });
        dropModel = comps.remove(tempModel, opts);
        dropModel = dropModel instanceof Array ? dropModel[0] : dropModel;
        this.dropModel = dropModel;

        if (isTextable(dropModel)) {
          return this.getSourceModel(src, { target, avoidChildren: 0 });
        }
      }

      return dropModel;
    }

    return src && $(src).data('model');
  },

  /**
   * Highlight target
   * @param  {Model|null} model
   */
  selectTargetModel(model, source) {
    if (model instanceof Backbone.Collection) {
      return;
    }

    // Prevents loops in Firefox
    // https://github.com/artf/grapesjs/issues/2911
    if (source && source === model) return;

    const { targetModel } = this;

    // Reset the previous model but not if it's the same as the source
    // https://github.com/artf/grapesjs/issues/2478#issuecomment-570314736
    if (targetModel && targetModel !== this.srcModel) {
      targetModel.set('status', '');
    }

    if (model && model.set) {
      model.set('status', 'selected-parent');
      this.targetModel = model;
    }
  },

  /**
   * During move
   * @param {Event} e
   * */
  onMove(e) {
    const ev = e;
    const { em, onMoveClb, plh, customTarget } = this;
    this.moved = 1;

    // Turn placeholder visibile
    var dsp = plh.style.display;
    if (!dsp || dsp === 'none') plh.style.display = 'block';

    // Cache all necessary positions
    var eO = this.offset(this.el);
    this.elT = this.wmargin ? Math.abs(eO.top) : eO.top;
    this.elL = this.wmargin ? Math.abs(eO.left) : eO.left;
    var rY = e.pageY - this.elT + this.el.scrollTop;
    var rX = e.pageX - this.elL + this.el.scrollLeft;

    if (this.canvasRelative && em) {
      const mousePos = em.get('Canvas').getMouseRelativeCanvas(e, { noScroll: 1 });
      rX = mousePos.x;
      rY = mousePos.y;
    }

    this.rX = rX;
    this.rY = rY;
    this.eventMove = e;

    //var targetNew = this.getTargetFromEl(e.target);
    const sourceModel = this.getSourceModel();
    const targetEl = customTarget ? customTarget({ sorter: this, event: e }) : e.target;
    const dims = this.dimsFromTarget(targetEl, rX, rY);
    const target = this.target;
    const targetModel = target && this.getTargetModel(target);
    this.selectTargetModel(targetModel, sourceModel);
    if (!targetModel) plh.style.display = 'none';
    if (!target) return;
    this.lastDims = dims;
    const pos = this.findPosition(dims, rX, rY);

    if (this.isTextableActive(sourceModel, targetModel)) {
      this.activeTextModel = targetModel;
      plh.style.display = 'none';
      this.lastPos = pos;
      this.updateTextViewCursorPosition(ev);
    } else {
      this.disableTextable();
      this.activeTextModel = null;

      // If there is a significant changes with the pointer
      if (!this.lastPos || this.lastPos.index != pos.index || this.lastPos.method != pos.method) {
        this.movePlaceholder(this.plh, dims, pos, this.prevTargetDim);
        if (!this.$plh) this.$plh = $(this.plh);

        // With canvasRelative the offset is calculated automatically for
        // each element
        if (!this.canvasRelative) {
          if (this.offTop) this.$plh.css('top', '+=' + this.offTop + 'px');
          if (this.offLeft) this.$plh.css('left', '+=' + this.offLeft + 'px');
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
  },

  isTextableActive(src, trg) {
    return src?.get?.('textable') && trg?.isInstanceOf('text');
  },

  disableTextable() {
    const { activeTextModel } = this;
    activeTextModel && activeTextModel.getView().disableEditing();
    this.setContentEditable(activeTextModel, false);
  },

  /**
   * Returns true if the elements is in flow, so is not in flow where
   * for example the component is with float:left
   * @param  {HTMLElement} el
   * @param  {HTMLElement} parent
   * @return {Boolean}
   * @private
   * */
  isInFlow(el, parent) {
    if (!el) return false;

    parent = parent || document.body;
    var ch = -1,
      h;
    var elem = el;
    h = elem.offsetHeight;
    if (/*h < ch || */ !this.styleInFlow(elem, parent)) return false;
    else return true;
  },

  /**
   * Check if el has style to be in flow
   * @param  {HTMLElement} el
   * @param  {HTMLElement} parent
   * @return {Boolean}
   * @private
   */
  styleInFlow(el, parent) {
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
        return true;
    }
    return;
  },

  /**
   * Check if the target is valid with the actual source
   * @param  {HTMLElement} trg
   * @return {Boolean}
   */
  validTarget(trg, src) {
    const trgModel = this.getTargetModel(trg);
    const srcModel = this.getSourceModel(src, { target: trgModel });
    src = srcModel && srcModel.view && srcModel.view.el;
    trg = trgModel && trgModel.view && trgModel.view.el;
    let result = {
      valid: true,
      src,
      srcModel,
      trg,
      trgModel,
    };

    if (!src || !trg) {
      result.valid = false;
      return result;
    }

    // Check if the source is draggable in target
    let draggable = srcModel.get('draggable');
    if (isFunction(draggable)) {
      const res = draggable(srcModel, trgModel);
      result.dragInfo = res;
      result.draggable = res;
      draggable = res;
    } else {
      draggable = draggable instanceof Array ? draggable.join(', ') : draggable;
      result.dragInfo = draggable;
      draggable = isString(draggable) ? this.matches(trg, draggable) : draggable;
      result.draggable = draggable;
    }

    // Check if the target could accept the source
    let droppable = trgModel.get('droppable');
    if (isFunction(droppable)) {
      const res = droppable(srcModel, trgModel);
      result.droppable = res;
      result.dropInfo = res;
      droppable = res;
    } else {
      droppable = droppable instanceof Backbone.Collection ? 1 : droppable;
      droppable = droppable instanceof Array ? droppable.join(', ') : droppable;
      result.dropInfo = droppable;
      droppable = isString(droppable) ? this.matches(src, droppable) : droppable;
      droppable = draggable && this.isTextableActive(srcModel, trgModel) ? 1 : droppable;
      result.droppable = droppable;
    }

    if (!droppable || !draggable) {
      result.valid = false;
    }

    return result;
  },

  /**
   * Get dimensions of nodes relative to the coordinates
   * @param  {HTMLElement} target
   * @param {number} rX Relative X position
   * @param {number} rY Relative Y position
   * @return {Array<Array>}
   */
  dimsFromTarget(target, rX, rY) {
    const em = this.em;
    var dims = [];

    if (!target) {
      return dims;
    }

    // Select the first valuable target
    if (!this.matches(target, `${this.itemSel}, ${this.containerSel}`)) {
      target = this.closest(target, this.itemSel);
    }

    // If draggable is an array the target will be one of those
    if (this.draggable instanceof Array) {
      target = this.closest(target, this.draggable.join(','));
    }

    if (!target) {
      return dims;
    }

    // Check if the target is different from the previous one
    if (this.prevTarget && this.prevTarget != target) {
      this.prevTarget = null;
    }

    // New target found
    if (!this.prevTarget) {
      this.targetP = this.closest(target, this.containerSel);

      // Check if the source is valid with the target
      let validResult = this.validTarget(target);
      em && em.trigger('sorter:drag:validation', validResult);

      if (!validResult.valid && this.targetP) {
        return this.dimsFromTarget(this.targetP, rX, rY);
      }

      this.prevTarget = target;
      this.prevTargetDim = this.getDim(target);
      this.cacheDimsP = this.getChildrenDim(this.targetP);
      this.cacheDims = this.getChildrenDim(target);
    }

    // If the target is the previous one will return the cached dims
    if (this.prevTarget == target) dims = this.cacheDims;

    // Target when I will drop element to sort
    this.target = this.prevTarget;

    // Generally, on any new target the poiner enters inside its area and
    // triggers nearBorders(), so have to take care of this
    if (this.nearBorders(this.prevTargetDim, rX, rY) || (!this.nested && !this.cacheDims.length)) {
      const targetParent = this.targetP;

      if (targetParent && this.validTarget(targetParent).valid) {
        dims = this.cacheDimsP;
        this.target = targetParent;
      }
    }

    this.lastPos = null;
    return dims;
  },

  /**
   * Get valid target from element
   * This method should replace dimsFromTarget()
   * @param  {HTMLElement} el
   * @return {HTMLElement}
   */
  getTargetFromEl(el) {
    let target = el;
    let targetParent;
    let targetPrev = this.targetPrev;
    const em = this.em;
    const containerSel = this.containerSel;
    const itemSel = this.itemSel;

    // Select the first valuable target
    if (!this.matches(target, `${itemSel}, ${containerSel}`)) {
      target = this.closest(target, itemSel);
    }

    // If draggable is an array the target will be one of those
    // TODO check if this options is used somewhere
    if (this.draggable instanceof Array) {
      target = this.closest(target, this.draggable.join(','));
    }

    // Check if the target is different from the previous one
    if (targetPrev && targetPrev != target) {
      this.targetPrev = '';
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
  },

  /**
   * Check if the current pointer is neare to element borders
   * @return {Boolen}
   */
  nearElBorders(el) {
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
  },

  getCurrentPos() {
    const ev = this.eventMove;
    const x = ev.pageX || 0;
    const y = ev.pageY || 0;
    return { x, y };
  },

  /**
   * Returns dimensions and positions about the element
   * @param {HTMLElement} el
   * @return {Array<number>}
   */
  getDim(el) {
    const { em, canvasRelative } = this;
    const canvas = em && em.get('Canvas');
    const offsets = canvas ? canvas.getElementOffsets(el) : {};
    let top, left, height, width;

    if (canvasRelative && em) {
      const pos = canvas.getElementPos(el, { noScroll: 1 });
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
  },

  /**
   * Get children dimensions
   * @param {HTMLELement} el Element root
   * @return {Array}
   * */
  getChildrenDim(trg) {
    const dims = [];
    if (!trg) return dims;

    // Get children based on getChildrenContainer
    const trgModel = this.getTargetModel(trg);
    if (trgModel && trgModel.view && !this.ignoreViewChildren) {
      const view = trgModel.getCurrentView ? trgModel.getCurrentView() : trgModel.view;
      trg = view.getChildrenContainer();
    }

    each(trg.children, (el, i) => {
      const model = getModel(el, $);
      const elIndex = model && model.index ? model.index() : i;

      if (!isTextNode(el) && !this.matches(el, this.itemSel)) {
        return;
      }

      const dim = this.getDim(el);
      let dir = this.direction;

      if (dir == 'v') dir = true;
      else if (dir == 'h') dir = false;
      else dir = this.isInFlow(el, trg);

      dim.dir = dir;
      dim.el = el;
      dim.indexEl = elIndex;
      dims.push(dim);
    });

    return dims;
  },

  /**
   * Check if the coordinates are near to the borders
   * @param {Array<number>} dim
   * @param {number} rX Relative X position
   * @param {number} rY Relative Y position
   * @return {Boolean}
   * */
  nearBorders(dim, rX, rY) {
    var result = 0;
    var off = this.borderOffset;
    var x = rX || 0;
    var y = rY || 0;
    var t = dim.top;
    var l = dim.left;
    var h = dim.height;
    var w = dim.width;
    if (t + off > y || y > t + h - off || l + off > x || x > l + w - off) result = 1;

    return !!result;
  },

  /**
   * Find the position based on passed dimensions and coordinates
   * @param {Array<Array>} dims Dimensions of nodes to parse
   * @param {number} posX X coordindate
   * @param {number} posY Y coordindate
   * @return {Object}
   * */
  findPosition(dims, posX, posY) {
    var result = { index: 0, indexEl: 0, method: 'before' };
    var leftLimit = 0,
      xLimit = 0,
      dimRight = 0,
      yLimit = 0,
      xCenter = 0,
      yCenter = 0,
      dimDown = 0,
      dim = 0;
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
      result.indexEl = dim.indexEl;
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
  },

  /**
   * Updates the position of the placeholder
   * @param {HTMLElement} phl
   * @param {Array<Array>} dims
   * @param {Object} pos Position object
   * @param {Array<number>} trgDim target dimensions ([top, left, height, width])
   * */
  movePlaceholder(plh, dims, pos, trgDim) {
    var marg = 0,
      t = 0,
      l = 0,
      w = 0,
      h = 0,
      un = 'px',
      margI = 5,
      method = pos.method;
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
        t = trgDim.top + pT;
        l = trgDim.left + pL;
        w = parseInt(trgDim.width) - pL * 2 + un;
        h = 'auto';
      }
    }
    plh.style.top = t + un;
    plh.style.left = l + un;
    if (w) plh.style.width = w;
    if (h) plh.style.height = h;
  },

  /**
   * Build an array of all the parents, including the component itself
   * @return {Model|null}
   */
  parents(model) {
    return model ? [model].concat(this.parents(model.parent())) : [];
  },

  /**
   * Sort according to the position in the dom
   * @param {Object} obj1 contains {model, parents}
   * @param {Object} obj2 contains {model, parents}
   */
  sort(obj1, obj2) {
    // common ancesters
    const ancesters = obj1.parents.filter(p => obj2.parents.includes(p));
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
  },

  /**
   * Leave item
   * @param event
   *
   * @return void
   * */
  endMove(e) {
    const src = this.sourceEl;
    const moved = [];
    const docs = this.getDocuments();
    const container = this.getContainerEl();
    const onEndMove = this.onEndMove;
    const onEnd = this.onEnd;
    const { target, lastPos } = this;
    let srcModel;
    off(container, 'mousemove dragover', this.onMove);
    off(docs, 'mouseup dragend touchend', this.endMove);
    off(docs, 'keydown', this.rollback);
    this.plh.style.display = 'none';

    if (src) {
      srcModel = this.getSourceModel();
      if (this.selectOnEnd && srcModel && srcModel.set) {
        srcModel.set('status', '');
        srcModel.set('status', 'selected');
      }
    }

    if (this.moved && target) {
      const toMove = this.toMove;
      const toMoveArr = isArray(toMove) ? toMove : toMove ? [toMove] : [src];
      let domPositionOffset = 0;
      if (toMoveArr.length === 1) {
        // do not sort the array in this case
        // there are cases for the sorter where toMoveArr is [undefined]
        // which allows the drop from blocks, native D&D and sort of layers in Style Manager
        moved.push(this.move(target, toMoveArr[0], lastPos));
      } else {
        toMoveArr
          // add the model's parents
          .map(model => ({
            model,
            parents: this.parents(model),
          }))
          // sort based on elements positions in the dom
          .sort(this.sort)
          // move each component to the new parent and position
          .forEach(({ model }) => {
            // store state before move
            const index = model.index();
            const parent = model.parent().getEl();
            // move the component to the desired position
            moved.push(
              this.move(target, model, {
                ...lastPos,
                indexEl: lastPos.indexEl - domPositionOffset,
                index: lastPos.index - domPositionOffset,
              })
            );
            // when the element is dragged to the same parent and after its position
            //  it will be removed from the children list
            //  in that case we need to adjust the following elements target position
            if (parent === target && index <= lastPos.index) {
              // the next elements will be inserted 1 element before this one
              domPositionOffset++;
            }
          });
      }
    }

    if (this.plh) this.plh.style.display = 'none';
    var dragHelper = this.dragHelper;

    if (dragHelper) {
      dragHelper.parentNode.removeChild(dragHelper);
      this.dragHelper = null;
    }

    this.disableTextable();
    this.selectTargetModel();
    this.toggleSortCursor();

    this.toMove = null;
    this.eventMove = 0;
    this.dropModel = null;

    if (isFunction(onEndMove)) {
      const data = {
        target: srcModel,
        parent: srcModel && srcModel.parent(),
        index: srcModel && srcModel.index(),
      };
      moved.length ? moved.forEach(m => onEndMove(m, this, data)) : onEndMove(null, this, { ...data, cancelled: 1 });
    }

    isFunction(onEnd) && onEnd({ sorter: this });
  },

  /**
   * Move component to new position
   * @param {HTMLElement} dst Destination target
   * @param {HTMLElement} src Element to move
   * @param {Object} pos Object with position coordinates
   * */
  move(dst, src, pos) {
    const { em, dropContent } = this;
    const srcEl = getElement(src);
    const warns = [];
    const index = pos.method === 'after' ? pos.indexEl + 1 : pos.indexEl;
    const validResult = this.validTarget(dst, srcEl);
    const targetCollection = $(dst).data('collection');
    const { trgModel, srcModel, draggable } = validResult;
    const droppable = trgModel instanceof Backbone.Collection ? 1 : validResult.droppable;
    let modelToDrop, created;

    if (targetCollection && droppable && draggable) {
      const opts = { at: index, action: 'move-component' };
      const isTextable = this.isTextableActive(srcModel, trgModel);

      if (!dropContent) {
        const srcIndex = srcModel.collection.indexOf(srcModel);
        const sameCollection = targetCollection === srcModel.collection;
        const sameIndex = srcIndex === index || srcIndex === index - 1;
        const canRemove = !sameCollection || !sameIndex || isTextable;

        if (canRemove) {
          modelToDrop = srcModel.collection.remove(srcModel, {
            temporary: true,
          });
          if (sameCollection && index > srcIndex) {
            opts.at = index - 1;
          }
        }
      } else {
        modelToDrop = isFunction(dropContent) ? dropContent() : dropContent;
        opts.avoidUpdateStyle = true;
        opts.action = 'add-component';
      }

      if (modelToDrop) {
        if (isTextable) {
          delete opts.at;
          created = trgModel.getView().insertComponent(modelToDrop, opts);
        } else {
          created = targetCollection.add(modelToDrop, opts);
        }
      }

      this.dropContent = null;
      this.prevTarget = null; // This will recalculate children dimensions
    } else if (em) {
      const dropInfo = validResult.dropInfo || trgModel?.get('droppable');
      const dragInfo = validResult.dragInfo || srcModel?.get('draggable');

      !targetCollection && warns.push('Target collection not found');
      !droppable && dropInfo && warns.push(`Target is not droppable, accepts [${dropInfo}]`);
      !draggable && dragInfo && warns.push(`Component not draggable, acceptable by [${dragInfo}]`);
      em.logWarning('Invalid target position', {
        errors: warns,
        model: srcModel,
        context: 'sorter',
        target: trgModel,
      });
    }

    em?.trigger('sorter:drag:end', {
      targetCollection,
      modelToDrop,
      warns,
      validResult,
      dst,
      srcEl,
    });

    return created;
  },

  /**
   * Rollback to previous situation
   * @param {Event}
   * @param {Bool} Indicates if rollback in anycase
   * */
  rollback(e) {
    off(this.getDocuments(), 'keydown', this.rollback);
    const key = e.which || e.keyCode;

    if (key == 27) {
      this.moved = 0;
      this.endMove();
    }
  },
});
