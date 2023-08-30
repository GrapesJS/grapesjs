import { each, isEmpty, keys, result } from 'underscore';
import { CanvasSpotBuiltInTypes } from '../../canvas/model/CanvasSpot';
import FrameView from '../../canvas/view/FrameView';
import { ExtractMethods, ObjectAny, View } from '../../common';
import { GetSetRuleOptions } from '../../css_composer';
import Editor from '../../editor';
import EditorModel from '../../editor/model/Editor';
import Selectors from '../../selector_manager/model/Selectors';
import { replaceWith } from '../../utils/dom';
import { setViewEl } from '../../utils/mixins';
import { DomComponentsConfig } from '../config/config';
import Component, { avoidInline } from '../model/Component';
import Components from '../model/Components';
import { ComponentOptions } from '../model/types';
import ComponentsView from './ComponentsView';

type ClbObj = ReturnType<ComponentView['_clbObj']>;

export interface IComponentView extends ExtractMethods<ComponentView> {}

export default class ComponentView extends View</**
 * Keep this format to avoid errors in TS bundler */
/** @ts-ignore */
Component> {
  /** @ts-ignore */
  model!: Component;

  /** @ts-ignore */
  className() {
    return this.getClasses();
  }

  /** @ts-ignore */
  tagName() {
    return this.model.get('tagName')!;
  }

  modelOpt!: ComponentOptions;
  em!: EditorModel;
  opts?: any;
  pfx?: string;
  ppfx?: string;
  attr?: Record<string, any>;
  classe?: string;
  config!: DomComponentsConfig;
  childrenView?: ComponentsView;
  getChildrenSelector?: Function;
  getTemplate?: Function;
  scriptContainer?: HTMLElement;

  initialize(opt: any = {}) {
    const model = this.model;
    const config = opt.config || {};
    const em = config.em;
    const modelOpt = model.opt || {};
    const { $el, el } = this;
    this.opts = opt;
    this.modelOpt = modelOpt;
    this.config = config;
    this.em = em;
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.attr = model.get('attributes')!;
    this.classe = this.attr.class || [];
    this.listenTo(model, 'change:style', this.updateStyle);
    this.listenTo(model, 'change:attributes', this.renderAttributes);
    this.listenTo(model, 'change:highlightable', this.updateHighlight);
    this.listenTo(model, 'change:status change:locked', this.updateStatus);
    this.listenTo(model, 'change:script rerender', this.reset);
    this.listenTo(model, 'change:content', this.updateContent);
    this.listenTo(model, 'change', this.handleChange);
    this.listenTo(model, 'active', this.onActive);
    this.listenTo(model, 'disable', this.onDisable);
    $el.data('model', model);
    setViewEl(el, this);
    model.view = this;
    this.frameView && model.views.push(this);
    this.initClasses();
    this.initComponents({ avoidRender: true });
    this.events = {
      ...(this.constructor as typeof ComponentView).getEvents(),
      dragstart: 'handleDragStart',
    };
    this.delegateEvents();
    !modelOpt.temporary && this.init(this._clbObj());
  }

  get __cmpStyleOpts(): GetSetRuleOptions {
    return { state: '', mediaText: '' };
  }

  get frameView(): FrameView {
    return this.opts.config.frameView;
  }

  __isDraggable() {
    const { model, config } = this;
    const { draggable } = model.attributes;
    return config.draggableComponents && draggable;
  }

  _clbObj() {
    const { em, model, el } = this;
    return {
      editor: em?.getEditor() as Editor,
      model,
      el,
    };
  }

  /**
   * Initialize callback
   */
  init(opts: ClbObj) {}

  /**
   * Remove callback
   */
  removed(opts: ClbObj) {}

  /**
   * On render callback
   */
  onRender(opts: ClbObj) {}

  /**
   * Callback executed when the `active` event is triggered on component
   */
  onActive(ev: Event) {}

  /**
   * Callback executed when the `disable` event is triggered on component
   */
  onDisable() {}

  remove() {
    super.remove();
    const { model, $el } = this;
    const { views } = model;
    const frame = this.frameView || {};
    model.components().forEach(comp => {
      const view = comp.getView(frame.model);
      view?.remove();
    });
    this.childrenView?.remove();
    views.splice(views.indexOf(this), 1);
    this.removed(this._clbObj());
    $el.data({ model: '', collection: '', view: '' });
    // delete model.view; // Sorter relies on this property
    return this;
  }

  handleDragStart(event: Event) {
    if (!this.__isDraggable()) return false;
    event.stopPropagation();
    event.preventDefault();
    this.em.Commands.run('tlb-move', {
      target: this.model,
      event,
    });
  }

  initClasses() {
    const { model } = this;
    const { classes } = model;
    const event = 'change:classes';

    if (classes instanceof Selectors) {
      this.stopListening(model, event, this.initClasses);
      this.listenTo(model, event, this.initClasses);
      this.listenTo(classes, 'add remove change reset', this.updateClasses);
      classes.length && this.importClasses();
    }
  }

  initComponents(opts: { avoidRender?: boolean } = {}) {
    const { model, $el, childrenView } = this;
    const event = 'change:components';
    const comps = model.get('components');
    const toListen = [model, event, this.initComponents];

    if (comps instanceof Components) {
      $el.data('collection', comps);
      childrenView && childrenView.remove();
      this.stopListening(...toListen);
      !opts.avoidRender && this.renderChildren();
      // @ts-ignore
      this.listenTo(...toListen);
    }
  }

  /**
   * Handle any property change
   * @private
   */
  handleChange() {
    const { model } = this;
    const chgArr = keys(model.changed);
    if (chgArr.length === 1 && chgArr[0] === 'status') return;
    model.emitUpdate();

    for (let prop in model.changed) {
      model.emitUpdate(prop);
    }
  }

  /**
   * Import, if possible, classes inside main container
   * @private
   * */
  importClasses() {
    const { em, model } = this;
    const sm = em.Selectors;
    sm && model.classes.forEach(s => sm.add(s.get('name')));
  }

  /**
   * Update item on status change
   * @param  {Event} e
   * @private
   * */
  updateStatus(opts: { noExtHl?: boolean; avoidHover?: boolean } = {}) {
    const { em, el, ppfx, model } = this;
    const canvas = em?.Canvas;
    const extHl = canvas?.config.extHl;
    const status = model.get('status');
    const selectedCls = `${ppfx}selected`;
    const selectedParentCls = `${selectedCls}-parent`;
    const freezedCls = `${ppfx}freezed`;
    const hoveredCls = `${ppfx}hovered`;
    const noPointerCls = `${ppfx}no-pointer`;
    const toRemove = [selectedCls, selectedParentCls, freezedCls, hoveredCls, noPointerCls];
    const selCls = extHl && !opts.noExtHl ? '' : selectedCls;
    this.$el.removeClass(toRemove.join(' '));
    const actualCls = el.getAttribute('class') || '';
    const cls = [actualCls];
    const noCustomSpotSelect = !canvas?.hasCustomSpot(CanvasSpotBuiltInTypes.Select);
    const noCustomSpotTarget = !canvas?.hasCustomSpot(CanvasSpotBuiltInTypes.Target);

    switch (status) {
      case 'selected':
        noCustomSpotSelect && cls.push(selCls);
        break;
      case 'selected-parent':
        noCustomSpotTarget && cls.push(selectedParentCls);
        break;
      case 'freezed':
        cls.push(freezedCls);
        break;
      case 'freezed-selected':
        cls.push(freezedCls);
        noCustomSpotSelect && cls.push(selCls);
        break;
      case 'hovered':
        !opts.avoidHover && cls.push(hoveredCls);
        break;
    }

    model.get('locked') && cls.push(noPointerCls);

    const clsStr = cls.filter(Boolean).join(' ');
    clsStr && el.setAttribute('class', clsStr);
  }

  /**
   * Update highlight attribute
   * @private
   * */
  updateHighlight() {
    const { model } = this;
    const isTextable = model.get('textable');
    const hl = model.get('highlightable') && (isTextable || !model.isChildOf('text'));
    this.setAttribute('data-gjs-highlightable', hl ? true : '');
  }

  /**
   * Update style attribute
   * @private
   * */
  updateStyle(m?: any, v?: any, opts: ObjectAny = {}) {
    const { model, em } = this;

    if (avoidInline(em) && !opts.inline) {
      const styleOpts = this.__cmpStyleOpts;
      const style = model.getStyle(styleOpts);
      !isEmpty(style) && model.setStyle(style, styleOpts);
    } else {
      this.setAttribute('style', model.styleToString(opts));
    }
  }

  /**
   * Update classe attribute
   * @private
   * */
  updateClasses() {
    const str = this.model.classes.pluck('name').join(' ');
    this.setAttribute('class', str);

    // Regenerate status class
    this.updateStatus();
    this.onAttrUpdate();
  }

  /**
   * Update single attribute
   * @param {[type]} name  [description]
   * @param {[type]} value [description]
   */
  setAttribute(name: string, value: any) {
    const el = this.$el;
    value ? el.attr(name, value) : el.removeAttr(name);
  }

  /**
   * Get classes from attributes.
   * This method is called before initialize
   *
   * @return  {Array}|null
   * @private
   * */
  getClasses() {
    return this.model.getClasses().join(' ');
  }

  /**
   * Update attributes
   * @private
   * */
  updateAttributes() {
    const attrs: string[] = [];
    const { model, $el, el } = this;
    const { textable, type } = model.attributes;

    const defaultAttr = {
      id: model.getId(),
      'data-gjs-type': type || 'default',
      ...(this.__isDraggable() && { draggable: true }),
      ...(textable && { contenteditable: 'false' }),
    };

    // Remove all current attributes
    each(el.attributes, attr => attrs.push(attr.nodeName));
    attrs.forEach(attr => $el.removeAttr(attr));
    this.updateStyle();
    this.updateHighlight();
    const attr = {
      ...defaultAttr,
      ...model.getAttributes(),
    };

    // Remove all `false` attributes
    keys(attr).forEach(key => attr[key] === false && delete attr[key]);

    $el.attr(attr);
  }

  /**
   * Update component content
   * @private
   * */
  updateContent() {
    const { content } = this.model;
    const hasComps = this.model.components().length;
    this.getChildrenContainer().innerHTML = hasComps ? '' : content;
  }

  /**
   * Prevent default helper
   * @param  {Event} e
   * @private
   */
  prevDef(e: Event) {
    e.preventDefault();
  }

  /**
   * Render component's script
   * @private
   */
  updateScript() {
    const { model, em } = this;
    if (!model.get('script')) return;
    em?.Canvas.getCanvasView().updateScript(this);
  }

  /**
   * Return children container
   * Differently from a simple component where children container is the
   * component itself
   * <my-comp>
   *  <!--
   *    <child></child> ...
   *   -->
   * </my-comp>
   * You could have the children container more deeper
   * <my-comp>
   *  <div></div>
   *  <div></div>
   *  <div>
   *    <div>
   *      <!--
   *        <child></child> ...
   *      -->
   *    </div>
   *  </div>
   * </my-comp>
   * @return HTMLElement
   * @private
   */
  getChildrenContainer() {
    var container = this.el;

    if (typeof this.getChildrenSelector == 'function') {
      container = this.el.querySelector(this.getChildrenSelector());
    } else if (typeof this.getTemplate == 'function') {
      // Need to find deepest first child
    }

    return container;
  }

  /**
   * This returns rect informations not affected by the canvas zoom.
   * The method `getBoundingClientRect` doesn't work here and we
   * have to take in account offsetParent
   */
  getOffsetRect() {
    const rect = { top: 0, left: 0, bottom: 0, right: 0 };
    const target = this.el;
    let gtop = 0;
    let gleft = 0;

    const assignRect = (el: HTMLElement) => {
      const offsetParent = el.offsetParent as HTMLElement;

      if (offsetParent) {
        gtop += offsetParent.offsetTop;
        gleft += offsetParent.offsetLeft;
        assignRect(offsetParent);
      } else {
        rect.top = target.offsetTop + gtop;
        rect.left = target.offsetLeft + gleft;
        rect.bottom = rect.top + target.offsetHeight;
        rect.right = rect.left + target.offsetWidth;
      }
    };
    assignRect(target);

    return rect;
  }

  isInViewport() {
    const { el, em, frameView } = this;
    const canvasView = em.Canvas.getCanvasView();
    const elRect = canvasView.getElBoxRect(el, { local: true });
    const frameEl = frameView.el;
    const frameH = frameEl.clientHeight;
    const frameW = frameEl.clientWidth;

    const elTop = elRect.y;
    const elRight = elRect.x;
    const elBottom = elTop + elRect.height;
    const elLeft = elRight + elRect.width;
    const isTopInside = elTop >= 0 && elTop < frameH;
    const isBottomInside = elBottom > 0 && elBottom < frameH;
    const isLeftInside = elLeft >= 0 && elLeft < frameW;
    const isRightInside = elRight > 0 && elRight <= frameW;

    const partiallyIn = (isTopInside || isBottomInside) && (isLeftInside || isRightInside);

    return partiallyIn;
  }

  scrollIntoView(opts: { force?: boolean } & ScrollIntoViewOptions = {}) {
    const isInViewport = this.isInViewport();

    if (!isInViewport || opts.force) {
      const { el } = this;

      // PATCH: scrollIntoView won't work with multiple requests from iframes
      if (opts.behavior !== 'smooth') {
        const rect = this.getOffsetRect();
        el.ownerDocument.defaultView?.scrollTo(0, rect.top);
      } else {
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          ...opts,
        });
      }
    }
  }

  /**
   * Recreate the element of the view
   */
  reset() {
    const { el } = this;
    // @ts-ignore
    this.el = '';
    this._ensureElement();
    this._setData();
    replaceWith(el, this.el);
    this.render();
  }

  _setData() {
    const { model } = this;
    const collection = model.components();
    const view = this;
    this.$el.data({ model, collection, view });
  }

  /**
   * Render children components
   * @private
   */
  renderChildren() {
    this.updateContent();
    const container = this.getChildrenContainer();
    const view =
      this.childrenView ||
      new ComponentsView({
        // @ts-ignore
        collection: this.model.get('components')!,
        config: this.config,
        componentTypes: this.opts.componentTypes,
      });

    view.render(container);
    this.childrenView = view;
    const childNodes = Array.prototype.slice.call(view.el.childNodes);

    for (var i = 0, len = childNodes.length; i < len; i++) {
      container.appendChild(childNodes.shift());
    }
  }

  renderAttributes() {
    this.updateAttributes();
    this.updateClasses();
  }

  onAttrUpdate() {}

  render() {
    this.renderAttributes();
    if (this.modelOpt.temporary) return this;
    this.renderChildren();
    this.updateScript();
    setViewEl(this.el, this);
    this.postRender();

    return this;
  }

  postRender() {
    if (!this.modelOpt.temporary) {
      this.onRender(this._clbObj());
    }
  }

  static getEvents() {
    return result(this.prototype, 'events');
  }
}
