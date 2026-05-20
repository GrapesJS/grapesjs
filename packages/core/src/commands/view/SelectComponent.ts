import { bindAll, debounce, isElement } from 'underscore';
import { CanvasSpotBuiltInTypes } from '../../canvas/model/CanvasSpot';
import { CanvasEvents } from '../../canvas/types';
import Component from '../../dom_components/model/Component';
import Toolbar from '../../dom_components/model/Toolbar';
import { ComponentResizeInitEventData, ComponentsEvents } from '../../dom_components/types';
import ToolbarView from '../../dom_components/view/ToolbarView';
import { isDoc, isTaggableNode, isVisible, off, on } from '../../utils/dom';
import { getComponentModel, getComponentView, hasWin, isObject } from '../../utils/mixins';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

let showOffsets: boolean;

export interface SelectComponentCommandRegistryRun {
  'core:component-select': CommandPublicFnFromHandler<CommandSelectComponent['run']>;
  'select-comp': CommandPublicFnFromHandler<CommandSelectComponent['run']>;
}

export interface SelectComponentCommandRegistryStop {
  'core:component-select': CommandPublicFnFromHandler<CommandSelectComponent['stop']>;
  'select-comp': CommandPublicFnFromHandler<CommandSelectComponent['stop']>;
}

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
 */
export default class CommandSelectComponent extends CommandAbstract {
  [key: string]: any;
  activeResizer = false;

  init() {
    this._upToolbar = debounce(() => {
      this.updateToolsGlobal({ force: 1 });
    }, 0);
    this.updateAttached = debounce(() => {
      this.updateGlobalPos();
    }, 0);
    this.onContainerChange = debounce(() => {
      this.em.refreshCanvas();
    }, 150);
    this.onSelect = debounce(this.onSelect, 0);
    bindAll(
      this,
      'onHover',
      'onOut',
      'onClick',
      'onCanvasScroll',
      'onFrameScroll',
      'onFrameResize',
      'onFrameUpdated',
      'onContainerChange',
    );
  }

  enable() {
    this.frameOff = this.canvasOff = this.adjScroll = null;
    this.startSelectComponent();
    showOffsets = true;
  }

  /**
   * Start select component event
   * @private
   * */
  startSelectComponent() {
    this.toggleSelectComponent(true);
    this.em.getSelected() && this.onSelect();
  }

  /**
   * Stop select component event
   * @private
   * */
  stopSelectComponent() {
    this.toggleSelectComponent();
    (this.onContainerChange as any).cancel?.();
    (this.onSelect as any).cancel?.();
    (this.updateAttached as any).cancel?.();
    (this._upToolbar as any).cancel?.();
  }

  /**
   * Toggle select component event
   * @private
   * */
  toggleSelectComponent(enable?: boolean) {
    const { em, canvas } = this;
    const canvasEl = canvas.getCanvasView().el;
    const listenToEl = em.getConfig().listenToEl!;
    const { parentNode } = em.getContainer()!;
    const method = enable ? 'on' : 'off';
    const methods = { on, off };
    const eventCmpUpdate = ComponentsEvents.update;
    !listenToEl.length && parentNode && listenToEl.push(parentNode as HTMLElement);
    const trigger = (win: Window, body: HTMLBodyElement, currentCanvasEl: HTMLElement) => {
      methods[method](currentCanvasEl, 'scroll', this.onCanvasScroll, true);
      methods[method](body, 'mouseover', this.onHover);
      methods[method](body, 'mouseleave', this.onOut);
      methods[method](body, 'click', this.onClick);
      methods[method](win, 'scroll', this.onFrameScroll, true);
      methods[method](win, 'resize', this.onFrameResize);
    };
    methods[method](window, 'resize', this.onFrameUpdated);
    methods[method](listenToEl, 'scroll', this.onContainerChange);
    em[method](`${ComponentsEvents.toggled} ${eventCmpUpdate} undo redo`, this.onSelect, this);
    em[method]('change:componentHovered', this.onHovered, this);
    em[method](`${ComponentsEvents.resize} styleable:change ${ComponentsEvents.input}`, this.updateGlobalPos, this);
    em[method](`${eventCmpUpdate}:toolbar`, this._upToolbar, this);
    em[method]('frame:updated', this.onFrameUpdated, this);
    em[method](CanvasEvents.updateTools, this.onFrameUpdated, this);
    em[method](em.Canvas.events.refresh, this.updateAttached, this);
    em.Canvas.getFrames().forEach((frame: any) => {
      const { view } = frame;
      const win = view?.getWindow();
      win && trigger(win, view?.getBody()!, canvasEl);
    });
  }

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
  }

  onFrameUpdated() {
    this.updateLocalPos();
    this.updateGlobalPos();
  }

  onHovered(em?: any, component?: Component) {
    let result = {};

    if (component) {
      component.views?.forEach((view) => {
        const el = view.el;
        const pos = this.getElementPos(el);
        result = { el, pos, component, view };

        if (el.ownerDocument === this.currentDoc) {
          this.elHovered = result;
        }

        this.updateToolsLocal(result);
      });
    } else {
      this.currentDoc = null;
      this.elHovered = 0;
      this.updateToolsLocal();
      this.canvas.getFrames().forEach((frame: any) => {
        const { view } = frame;
        const el = view && view.getToolsEl();
        el && this.toggleToolsEl(false, 0, { el });
      });
    }
  }

  /**
   * Say what to do after the component was selected
   * @private
   * */
  onSelect() {
    const { em } = this;
    const component = em.getSelected();
    const currentFrame = em.getCurrentFrame();
    const view = component && component.getView(currentFrame?.model);
    const el = view?.el;
    let result = {};

    if (el && isVisible(el)) {
      const pos = this.getElementPos(el);
      result = { el, pos, component, view };
    }

    this.elSelected = result;
    this.updateToolsGlobal();
    this.updateLocalPos(result);
    this.initResize(component);
  }

  updateGlobalPos() {
    const sel = this.getElSelected();
    if (!sel.el) return;
    sel.pos = this.getElementPos(sel.el);
    this.updateToolsGlobal();
  }

  updateLocalPos(data?: any) {
    const sel = this.getElHovered();
    if (!sel.el) return;
    sel.pos = this.getElementPos(sel.el);
    this.updateToolsLocal(data);
  }

  getElHovered() {
    return this.elHovered || {};
  }

  getElSelected() {
    return this.elSelected || {};
  }

  onOut() {
    this.em.setHovered();
  }

  toggleToolsEl(on?: boolean, view?: any, opts: any = {}) {
    const el = opts.el || this.canvas.getToolsEl(view);
    el && (el.style.display = on ? '' : 'none');
    return el || {};
  }

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
  }

  hideElementOffset(view: any) {
    this.editor.stopCommand('show-offset', {
      view,
    });
  }

  showFixedElementOffset(el: HTMLElement, pos: any) {
    this.editor.runCommand('show-offset', {
      el,
      elPos: pos,
      state: 'Fixed',
    });
  }

  hideFixedElementOffset() {
    if (this.editor) this.editor.stopCommand('show-offset', { state: 'Fixed' });
  }

  hideHighlighter(view: any) {
    this.canvas.getHighlighter(view).style.opacity = 0;
  }

  onClick(ev: Event): void {
    ev.stopPropagation();
    ev.preventDefault();
    const { em } = this;

    if (em.get('_cmpDrag')) {
      em.set('_cmpDrag');
      return;
    }

    const el = ev.target as HTMLElement;
    let cmp = getComponentModel(el);

    if (!cmp) {
      let parentEl = el.parentNode;

      while (!cmp && parentEl && !isDoc(parentEl)) {
        cmp = getComponentModel(parentEl);
        parentEl = parentEl.parentNode;
      }
    }

    if (cmp) {
      if (em.isEditing() && ((!cmp.get('textable') && cmp.isChildOf('text')) || em.getEditing() !== cmp)) {
        return;
      }

      this.select(cmp, ev as MouseEvent);
    }
  }

  select(model: Component, event: MouseEvent) {
    if (!model) return;
    const { em } = this;
    em.setSelected(model, { event, useValid: true });
    this.initResize(em.getSelected());
  }

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

    const top = targetToElem.top;
    const left = opts.leftOff < 0 ? -opts.leftOff : 0;

    bStyle.top = top + un;
    bStyle.left = left + un;
  }

  showHighlighter(view: any) {
    this.canvas.getHighlighter(view).style.opacity = '';
  }

  initResize(elem: any) {
    const { em, canvas } = this;
    const editor = em.Editor;
    const component = !isElement(elem) && isTaggableNode(elem) ? elem : em.getSelected();
    const resizable = component?.get?.('resizable');
    const spotTypeResize = CanvasSpotBuiltInTypes.Resize;
    const hasCustomResize = canvas.hasCustomSpot(spotTypeResize);
    canvas.removeSpots({ type: spotTypeResize });
    const initEventOpts = {
      component,
      hasCustomResize,
      resizable,
    } as ComponentResizeInitEventData;

    component && em.trigger(ComponentsEvents.resizeInit, initEventOpts);
    const resizableResult = initEventOpts.resizable;

    if (component && resizableResult) {
      canvas.addSpot({ type: spotTypeResize, component });
      const el = isElement(elem) ? elem : component.getEl();
      const resizableOpts = isObject(resizableResult) ? resizableResult : {};

      if (hasCustomResize || !el || this.activeResizer) return;

      this.resizer = editor.runCommand('resize', {
        ...resizableOpts,
        el,
        component,
        force: true,
        afterStart: () => {
          showOffsets = false;
          this.activeResizer = true;
        },
        afterEnd: () => {
          showOffsets = true;
          this.activeResizer = false;
        },
      });
    } else {
      if (hasCustomResize) return;

      editor.stopCommand('resize');
      this.resizer = null;
    }
  }

  updateToolbar(mod: any) {
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
        const toolbarView = new ToolbarView({ collection: this.toolbar, em } as any);
        toolbarEl.appendChild(toolbarView.render().el);
      }

      this.toolbar.reset(toolbar);
      toolbarStyle.top = '-100px';
      toolbarStyle.left = '0';
    } else {
      toolbarStyle.display = 'none';
    }
  }

  updateToolbarPos(pos: any) {
    const unit = 'px';
    const { style } = this.canvas.getToolbarEl()!;
    style.top = `${pos.top}${unit}`;
    style.left = `${pos.left}${unit}`;
    style.opacity = '';
  }

  getCanvasPosition() {
    return this.canvas.getCanvasView().getPosition();
  }

  getBadge(opts: any = {}) {
    return this.canvas.getBadgeEl(opts.view);
  }

  onCanvasScroll(e: any) {
    this.onFrameScroll(e);
    this.onContainerChange();
  }

  onFrameScroll(_e?: any) {
    this.updateTools();
    this.canvas.refreshSpots();
  }

  onFrameResize() {
    this.canvas.refresh({ all: true });
  }

  updateTools() {
    this.updateLocalPos();
    this.updateGlobalPos();
  }

  isCompSelected(comp: Component) {
    return comp && comp.get('status') === 'selected';
  }

  updateToolsLocal(data?: any) {
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
    const toolsEl = this.toggleToolsEl(true, view);
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
  }

  _upToolbar() {}

  _trgToolUp(type: string, opts = {}) {
    this.em.trigger(CanvasEvents.toolsUpdate, {
      type,
      ...opts,
    });
  }

  updateToolsGlobal(opts: any = {}) {
    const { el, pos, component } = this.getElSelected();

    if (!el) {
      this.toggleToolsEl();
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
    const toolsEl = this.toggleToolsEl(true);
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
  }

  updateAttached() {}

  onContainerChange() {}

  getElementPos(el: HTMLElement) {
    return this.canvas.getCanvasView().getElementPos(el, { noScroll: true });
  }

  hideBadge() {
    this.getBadge().style.display = 'none';
  }

  cleanPrevious(model: Component) {
    model &&
      model.set({
        status: '',
        state: '',
      });
  }

  getContentWindow() {
    return this.canvas.getWindow();
  }

  run(editor: any) {
    if (!hasWin()) return;
    this.editor = editor && editor.get('Editor');
    this.enable();
  }

  stop(ed?: any, sender?: any, opts: any = {}) {
    if (!hasWin()) return;
    const { em, editor } = this;
    this.onHovered();
    this.stopSelectComponent();
    !opts.preserveSelected && em.setSelected();
    this.toggleToolsEl();
    editor?.stopCommand('resize');
  }
}
