import { bindAll, debounce, isElement } from 'underscore';
import Component from '../../dom_components/model/Component';
import Toolbar from '../../dom_components/model/Toolbar';
import ToolbarView from '../../dom_components/view/ToolbarView';
import { isDoc, isTaggableNode, isVisible, off, on } from '../../utils/dom';
import { getComponentModel, getComponentView, getUnitFromValue, getViewEl, hasWin, isObject } from '../../utils/mixins';
import { CommandObject } from './CommandAbstract';
import { CanvasSpotBuiltInTypes } from '../../canvas/model/CanvasSpot';
import { ResizerOptions } from '../../utils/Resizer';

let showOffsets: boolean;
/**
 * This command is responsible for show selecting components and displaying
 * all the necessary tools around (component toolbar, badge, highlight box, etc.)
 *
 * The command manages different boxes to display tools and when something in
 * the canvas is updated, the command triggers the appropriate method to update
 * their position (across multiple frames/components):
 * - Global Tools (updateToolsGlobal/updateGlobalPos)
 * This box contains tools intended to be displayed only on ONE component per time,
 * like Component Toolbar (updated by updateToolbar/updateToolbarPos), this means
 * you won't be able to see more than one Component Toolbar (even with multiple
 * frames or multiple selected components)
 * - Local Tools (updateToolsLocal/updateLocalPos)
 * Each frame in the canvas has its own local box, so we're able to see more than
 * one active container at the same time. When you put a mouse over an element
 * you can see stuff like the highlight box, badge, margins/paddings offsets, etc.
 * so those elements are inside the Local Tools box
 *
 *
 */
export default {
  activeResizer: false,

  init() {
    this.onSelect = debounce(this.onSelect, 0);
    bindAll(
      this,
      'onHover',
      'onOut',
      'onClick',
      'onFrameScroll',
      'onFrameResize',
      'onFrameUpdated',
      'onContainerChange'
    );
  },

  enable() {
    this.frameOff = this.canvasOff = this.adjScroll = null;
    this.startSelectComponent();
    showOffsets = true;
  },

  /**
   * Start select component event
   * @private
   * */
  startSelectComponent() {
    this.toggleSelectComponent(1);
    this.em.getSelected() && this.onSelect();
  },

  /**
   * Stop select component event
   * @private
   * */
  stopSelectComponent() {
    this.toggleSelectComponent();
  },

  /**
   * Toggle select component event
   * @private
   * */
  toggleSelectComponent(enable: boolean) {
    const { em } = this;
    const listenToEl = em.getConfig().listenToEl!;
    const { parentNode } = em.getContainer()!;
    const method = enable ? 'on' : 'off';
    const methods = { on, off };
    !listenToEl.length && parentNode && listenToEl.push(parentNode as HTMLElement);
    const trigger = (win: Window, body: HTMLBodyElement) => {
      methods[method](body, 'mouseover', this.onHover);
      methods[method](body, 'mouseleave', this.onOut);
      methods[method](body, 'click', this.onClick);
      methods[method](win, 'scroll', this.onFrameScroll, true);
      methods[method](win, 'resize', this.onFrameResize);
    };
    methods[method](window, 'resize', this.onFrameUpdated);
    methods[method](listenToEl, 'scroll', this.onContainerChange);
    em[method]('component:toggled component:update undo redo', this.onSelect, this);
    em[method]('change:componentHovered', this.onHovered, this);
    em[method]('component:resize styleable:change component:input', this.updateGlobalPos, this);
    em[method]('component:update:toolbar', this._upToolbar, this);
    em[method]('frame:updated', this.onFrameUpdated, this);
    em[method]('canvas:updateTools', this.onFrameUpdated, this);
    em[method](em.Canvas.events.refresh, this.updateAttached, this);
    em.Canvas.getFrames().forEach(frame => {
      const { view } = frame;
      const win = view?.getWindow();
      win && trigger(win, view?.getBody()!);
    });
  },

  /**
   * Hover command
   * @param {Object}  e
   * @private
   */
  onHover(ev: Event) {
    ev.stopPropagation();
    const { em } = this;
    const el = ev.target as HTMLElement;
    const view = getComponentView(el);
    const frameView = view?.frameView;
    let model = view?.model;

    // Get first valid model
    if (!model) {
      let parentEl = el.parentNode;
      while (!model && parentEl && !isDoc(parentEl)) {
        model = getComponentModel(parentEl);
        parentEl = parentEl.parentNode;
      }
    }

    this.currentDoc = el.ownerDocument;
    em.setHovered(model, { useValid: true });
    frameView && em.setCurrentFrame(frameView);
  },

  onFrameUpdated() {
    this.updateLocalPos();
    this.updateGlobalPos();
  },

  onHovered(em: any, component: Component) {
    let result = {};

    if (component) {
      component.views?.forEach(view => {
        const el = view.el;
        const pos = this.getElementPos(el);
        result = { el, pos, component, view: getViewEl(el) };

        if (el.ownerDocument === this.currentDoc) {
          this.elHovered = result;
        }

        this.updateToolsLocal(result);
      });
    } else {
      this.currentDoc = null;
      this.elHovered = 0;
      this.updateToolsLocal();
      this.canvas.getFrames().forEach(frame => {
        const { view } = frame;
        const el = view && view.getToolsEl();
        el && this.toggleToolsEl(0, 0, { el });
      });
    }
  },

  /**
   * Say what to do after the component was selected
   * @param {Object}  e
   * @param {Object}  el
   * @private
   * */
  onSelect() {
    const { em } = this;
    const component = em.getSelected();
    const currentFrame = em.getCurrentFrame();
    const view = component && component.getView(currentFrame?.model);
    let el = view && view.el;
    let result = {};

    if (el && isVisible(el)) {
      const pos = this.getElementPos(el);
      result = { el, pos, component, view: getViewEl(el) };
    }

    this.elSelected = result;
    this.updateToolsGlobal();
    // This will hide some elements from the select component
    this.updateLocalPos(result);
    this.initResize(component);
  },

  updateGlobalPos() {
    const sel = this.getElSelected();
    if (!sel.el) return;
    sel.pos = this.getElementPos(sel.el);
    this.updateToolsGlobal();
  },

  updateLocalPos(data: any) {
    const sel = this.getElHovered();
    if (!sel.el) return;
    sel.pos = this.getElementPos(sel.el);
    this.updateToolsLocal(data);
  },

  getElHovered() {
    return this.elHovered || {};
  },

  getElSelected() {
    return this.elSelected || {};
  },

  onOut() {
    this.em.setHovered();
  },

  toggleToolsEl(on: boolean, view: any, opts: any = {}) {
    const el = opts.el || this.canvas.getToolsEl(view);
    el && (el.style.display = on ? '' : 'none');
    return el || {};
  },

  /**
   * Show element offset viewer
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  showElementOffset(el: HTMLElement, pos: any, opts: any = {}) {
    if (!showOffsets) return;
    this.editor.runCommand('show-offset', {
      el,
      elPos: pos,
      view: opts.view,
      force: 1,
      top: 0,
      left: 0,
    });
  },

  /**
   * Hide element offset viewer
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  hideElementOffset(view: any) {
    this.editor.stopCommand('show-offset', {
      view,
    });
  },

  /**
   * Show fixed element offset viewer
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  showFixedElementOffset(el: HTMLElement, pos: any) {
    this.editor.runCommand('show-offset', {
      el,
      elPos: pos,
      state: 'Fixed',
    });
  },

  /**
   * Hide fixed element offset viewer
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  hideFixedElementOffset() {
    if (this.editor) this.editor.stopCommand('show-offset', { state: 'Fixed' });
  },

  /**
   * Hide Highlighter element
   */
  hideHighlighter(view: any) {
    this.canvas.getHighlighter(view).style.opacity = 0;
  },

  /**
   * On element click
   * @param {Event}  e
   * @private
   */
  onClick(ev: Event) {
    ev.stopPropagation();
    ev.preventDefault();
    const { em } = this;

    if (em.get('_cmpDrag')) return em.set('_cmpDrag');

    const el = ev.target as HTMLElement;
    let model = getComponentModel(el);

    if (!model) {
      let parentEl = el.parentNode;

      while (!model && parentEl && !isDoc(parentEl)) {
        model = getComponentModel(parentEl);
        parentEl = parentEl.parentNode;
      }
    }

    if (model) {
      // Avoid selection of inner text components during editing
      if (em.isEditing() && !model.get('textable') && model.isChildOf('text')) {
        return;
      }
      this.select(model, ev);
    }
  },

  /**
   * Select component
   * @param  {Component} model
   * @param  {Event} event
   */
  select(model: Component, event = {}) {
    if (!model) return;
    this.editor.select(model, { event, useValid: true });
    this.initResize(model);
  },

  /**
   * Update badge for the component
   * @param {Object} Component
   * @param {Object} pos Position object
   * @private
   * */
  updateBadge(el: HTMLElement, pos: any, opts: any = {}) {
    const { canvas } = this;
    const model = getComponentModel(el);
    const badge = this.getBadge(opts);
    const bStyle = badge.style;

    if (!model || !model.get('badgable')) {
      bStyle.display = 'none';
      return;
    }

    if (!opts.posOnly) {
      const config = this.canvas.getConfig();
      const icon = model.getIcon();
      const ppfx = config.pStylePrefix || '';
      const clsBadge = `${ppfx}badge`;
      const customeLabel = config.customBadgeLabel;
      const badgeLabel = `${icon ? `<div class="${clsBadge}__icon">${icon}</div>` : ''}
        <div class="${clsBadge}__name">${model.getName()}</div>`;
      badge.innerHTML = customeLabel ? customeLabel(model) : badgeLabel;
    }

    const un = 'px';
    bStyle.display = 'block';

    const targetToElem = canvas.getTargetToElementFixed(el, badge, {
      pos: pos,
    });

    const top = targetToElem.top; //opts.topOff - badgeH < 0 ? -opts.topOff : posTop;
    const left = opts.leftOff < 0 ? -opts.leftOff : 0;

    bStyle.top = top + un;
    bStyle.left = left + un;
  },

  /**
   * Update highlighter element
   * @param {HTMLElement} el
   * @param {Object} pos Position object
   * @private
   */
  showHighlighter(view: any) {
    this.canvas.getHighlighter(view).style.opacity = '';
  },

  /**
   * Init resizer on the element if possible
   * @param  {HTMLElement|Component} elem
   * @private
   */
  initResize(elem: HTMLElement) {
    const { em, canvas } = this;
    const editor = em.Editor;
    const model = !isElement(elem) && isTaggableNode(elem) ? elem : em.getSelected();
    const resizable = model?.get('resizable');
    const spotTypeResize = CanvasSpotBuiltInTypes.Resize;
    const hasCustomResize = canvas.hasCustomSpot(spotTypeResize);
    canvas.removeSpots({ type: spotTypeResize });

    if (model && resizable) {
      canvas.addSpot({ type: spotTypeResize, component: model });
      const el = isElement(elem) ? elem : model.getEl();
      const {
        onStart = () => {},
        onMove = () => {},
        onEnd = () => {},
        updateTarget = () => {},
        ...resizableOpts
      } = isObject(resizable) ? resizable : {};

      if (hasCustomResize || !el || this.activeResizer) return;

      let modelToStyle: any;
      const { config } = em;
      const pfx = config.stylePrefix || '';
      const resizeClass = `${pfx}resizing`;
      const self = this;
      const resizeEventOpts = {
        component: model,
        el,
      };

      const toggleBodyClass = (method: string, e: any, opts: any) => {
        const docs = opts.docs;
        docs &&
          docs.forEach((doc: Document) => {
            const body = doc.body;
            const cls = body.className || '';
            body.className = (method == 'add' ? `${cls} ${resizeClass}` : cls.replace(resizeClass, '')).trim();
          });
      };

      const options: ResizerOptions = {
        // Here the resizer is updated with the current element height and width
        onStart(ev, opts) {
          onStart(ev, opts);
          const { el, config, resizer } = opts;
          const { keyHeight, keyWidth, currentUnit, keepAutoHeight, keepAutoWidth } = config;
          toggleBodyClass('add', ev, opts);
          modelToStyle = em.Styles.getModelToStyle(model);
          canvas.toggleFramesEvents(false);
          const computedStyle = getComputedStyle(el);
          const modelStyle = modelToStyle.getStyle();

          let currentWidth = modelStyle[keyWidth];
          config.autoWidth = keepAutoWidth && currentWidth === 'auto';
          if (isNaN(parseFloat(currentWidth))) {
            currentWidth = computedStyle[keyWidth];
          }

          let currentHeight = modelStyle[keyHeight];
          config.autoHeight = keepAutoHeight && currentHeight === 'auto';
          if (isNaN(parseFloat(currentHeight))) {
            currentHeight = computedStyle[keyHeight];
          }

          resizer.startDim!.w = parseFloat(currentWidth);
          resizer.startDim!.h = parseFloat(currentHeight);
          showOffsets = false;

          if (currentUnit) {
            config.unitHeight = getUnitFromValue(currentHeight);
            config.unitWidth = getUnitFromValue(currentWidth);
          }
          self.activeResizer = true;
          editor.trigger('component:resize', { ...resizeEventOpts, type: 'start' });
        },

        // Update all positioned elements (eg. component toolbar)
        onMove(ev) {
          onMove(ev);
          editor.trigger('component:resize', { ...resizeEventOpts, type: 'move' });
        },

        onEnd(ev, opts) {
          onEnd(ev, opts);
          toggleBodyClass('remove', ev, opts);
          editor.trigger('component:resize', { ...resizeEventOpts, type: 'end' });
          canvas.toggleFramesEvents(true);
          showOffsets = true;
          self.activeResizer = false;
        },

        updateTarget(el, rect, options) {
          updateTarget(el, rect, options);
          if (!modelToStyle) {
            return;
          }

          const { store, selectedHandler, config } = options;
          const { keyHeight, keyWidth, autoHeight, autoWidth, unitWidth, unitHeight } = config;
          const onlyHeight = ['tc', 'bc'].indexOf(selectedHandler!) >= 0;
          const onlyWidth = ['cl', 'cr'].indexOf(selectedHandler!) >= 0;
          const style: any = {};

          if (!onlyHeight) {
            const bodyw = canvas.getBody().offsetWidth;
            const width = rect.w < bodyw ? rect.w : bodyw;
            style[keyWidth!] = autoWidth ? 'auto' : `${width}${unitWidth}`;
          }

          if (!onlyWidth) {
            style[keyHeight!] = autoHeight ? 'auto' : `${rect.h}${unitHeight}`;
          }

          if (em.getDragMode(model)) {
            style.top = `${rect.t}${unitHeight}`;
            style.left = `${rect.l}${unitWidth}`;
          }

          const finalStyle = {
            ...style,
            // value for the partial update
            __p: !store,
          };
          modelToStyle.addStyle(finalStyle, { avoidStore: !store });
          em.Styles.__emitCmpStyleUpdate(finalStyle, { components: em.getSelected() });
        },
        ...resizableOpts,
      };

      this.resizer = editor.runCommand('resize', { el, options, force: 1 });
    } else {
      if (hasCustomResize) return;

      editor.stopCommand('resize');
      this.resizer = null;
    }
  },

  /**
   * Update toolbar if the component has one
   * @param {Object} mod
   */
  updateToolbar(mod: Component) {
    const { canvas } = this;
    const { em } = this.config;
    const model = mod === em ? em.getSelected() : mod;
    const toolbarEl = canvas.getToolbarEl()!;
    const toolbarStyle = toolbarEl.style;
    const toolbar = model.get('toolbar');
    const showToolbar = em.config.showToolbar;
    const noCustomSpotSelect = !canvas.hasCustomSpot(CanvasSpotBuiltInTypes.Select);

    if (model && showToolbar && toolbar && toolbar.length && noCustomSpotSelect) {
      toolbarStyle.display = '';
      if (!this.toolbar) {
        toolbarEl.innerHTML = '';
        this.toolbar = new Toolbar(toolbar);
        // @ts-ignore
        const toolbarView = new ToolbarView({ collection: this.toolbar, em });
        toolbarEl.appendChild(toolbarView.render().el);
      }

      this.toolbar.reset(toolbar);
      toolbarStyle.top = '-100px';
      toolbarStyle.left = '0';
    } else {
      toolbarStyle.display = 'none';
    }
  },

  /**
   * Update toolbar positions
   * @param {HTMLElement} el
   * @param {Object} pos
   */
  updateToolbarPos(pos: any) {
    const unit = 'px';
    const { style } = this.canvas.getToolbarEl()!;
    style.top = `${pos.top}${unit}`;
    style.left = `${pos.left}${unit}`;
    style.opacity = '';
  },

  /**
   * Return canvas dimensions and positions
   * @return {Object}
   */
  getCanvasPosition() {
    return this.canvas.getCanvasView().getPosition();
  },

  /**
   * Returns badge element
   * @return {HTMLElement}
   * @private
   */
  getBadge(opts: any = {}) {
    return this.canvas.getBadgeEl(opts.view);
  },

  /**
   * On frame scroll callback
   * @private
   */
  onFrameScroll() {
    this.updateTools();
    this.canvas.refreshSpots();
  },

  onFrameResize() {
    this.canvas.refresh({ all: true });
  },

  updateTools() {
    this.updateLocalPos();
    this.updateGlobalPos();
  },

  isCompSelected(comp: Component) {
    return comp && comp.get('status') === 'selected';
  },

  /**
   * Update tools visible on hover
   * @param {HTMLElement} el
   * @param {Object} pos
   */
  updateToolsLocal(data: any) {
    const config = this.em.getConfig();
    const { el, pos, view, component } = data || this.getElHovered();

    if (!el) {
      this.lastHovered = 0;
      return;
    }

    const isHoverEn = component.get('hoverable');
    const isNewEl = this.lastHovered !== el;
    const badgeOpts = isNewEl ? {} : { posOnly: 1 };
    const customHoverSpot = this.canvas.hasCustomSpot(CanvasSpotBuiltInTypes.Hover);

    if (isNewEl && isHoverEn) {
      this.lastHovered = el;
      customHoverSpot ? this.hideHighlighter(view) : this.showHighlighter(view);
      this.showElementOffset(el, pos, { view });
    }

    if (this.isCompSelected(component)) {
      this.hideHighlighter(view);
      !config.showOffsetsSelected && this.hideElementOffset(view);
    }

    const unit = 'px';
    const toolsEl = this.toggleToolsEl(1, view);
    const { style } = toolsEl;
    const frameOff = this.canvas.canvasRectOffset(el, pos);
    const topOff = frameOff.top;
    const leftOff = frameOff.left;

    !customHoverSpot &&
      this.updateBadge(el, pos, {
        ...badgeOpts,
        view,
        topOff,
        leftOff,
      });

    style.top = topOff + unit;
    style.left = leftOff + unit;
    style.width = pos.width + unit;
    style.height = pos.height + unit;

    this._trgToolUp('local', {
      component,
      el: toolsEl,
      top: topOff,
      left: leftOff,
      width: pos.width,
      height: pos.height,
    });
  },

  _upToolbar: debounce(function () {
    // @ts-ignore
    this.updateToolsGlobal({ force: 1 });
  }, 0),

  _trgToolUp(type: string, opts = {}) {
    this.em.trigger('canvas:tools:update', {
      type,
      ...opts,
    });
  },

  updateToolsGlobal(opts: any = {}) {
    const { el, pos, component } = this.getElSelected();

    if (!el) {
      this.toggleToolsEl(); // Hides toolbar
      this.lastSelected = 0;
      return;
    }

    const { canvas } = this;
    const isNewEl = this.lastSelected !== el;

    if (isNewEl || opts.force) {
      this.lastSelected = el;
      this.updateToolbar(component);
    }

    const unit = 'px';
    const toolsEl = this.toggleToolsEl(1);
    const { style } = toolsEl;
    const targetToElem = canvas.getTargetToElementFixed(el, canvas.getToolbarEl()!, { pos });
    const topOff = targetToElem.canvasOffsetTop;
    const leftOff = targetToElem.canvasOffsetLeft;
    style.top = topOff + unit;
    style.left = leftOff + unit;
    style.width = pos.width + unit;
    style.height = pos.height + unit;

    this.updateToolbarPos({ top: targetToElem.top, left: targetToElem.left });
    this._trgToolUp('global', {
      component,
      el: toolsEl,
      top: topOff,
      left: leftOff,
      width: pos.width,
      height: pos.height,
    });
  },

  /**
   * Update attached elements, eg. component toolbar
   */
  updateAttached: debounce(function () {
    // @ts-ignore
    this.updateGlobalPos();
  }, 0),

  onContainerChange: debounce(function () {
    // @ts-ignore
    this.em.refreshCanvas();
  }, 150),

  /**
   * Returns element's data info
   * @param {HTMLElement} el
   * @return {Object}
   * @private
   */
  getElementPos(el: HTMLElement) {
    return this.canvas.getCanvasView().getElementPos(el, { noScroll: true });
  },

  /**
   * Hide badge
   * @private
   * */
  hideBadge() {
    this.getBadge().style.display = 'none';
  },

  /**
   * Clean previous model from different states
   * @param {Component} model
   * @private
   */
  cleanPrevious(model: Component) {
    model &&
      model.set({
        status: '',
        state: '',
      });
  },

  /**
   * Returns content window
   * @private
   */
  getContentWindow() {
    return this.canvas.getWindow();
  },

  run(editor) {
    if (!hasWin()) return;
    // @ts-ignore
    this.editor = editor && editor.get('Editor');
    this.enable();
  },

  stop(ed, sender, opts = {}) {
    if (!hasWin()) return;
    const { em, editor } = this;
    this.onHovered(); // force to hide toolbar
    this.stopSelectComponent();
    !opts.preserveSelected && em.setSelected();
    this.toggleToolsEl();
    editor && editor.stopCommand('resize');
  },
} as CommandObject<any, { [k: string]: any }>;
