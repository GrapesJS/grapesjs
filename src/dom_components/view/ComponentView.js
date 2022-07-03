import Backbone from 'backbone';
import { isEmpty, each, keys, result } from 'underscore';
import Components from '../model/Components';
import ComponentsView from './ComponentsView';
import Selectors from 'selector_manager/model/Selectors';
import { replaceWith } from 'utils/dom';
import { setViewEl } from 'utils/mixins';

export default class ComponentView extends Backbone.View {
  className() {
    return this.getClasses();
  }

  tagName() {
    return this.model.get('tagName');
  }

  initialize(opt = {}) {
    const model = this.model;
    const config = opt.config || {};
    const em = config.em;
    const modelOpt = model.opt || {};
    const { $el, el } = this;
    this.opts = opt;
    this.modelOpt = modelOpt;
    this.config = config;
    this.em = em || '';
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.attr = model.get('attributes');
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
    this._getFrame() && model.views.push(this);
    this.initClasses();
    this.initComponents({ avoidRender: 1 });
    this.events = {
      ...this.constructor.getEvents(),
      dragstart: 'handleDragStart',
    };
    this.delegateEvents();
    !modelOpt.temporary && this.init(this._clbObj());
  }

  __isDraggable() {
    const { model, config } = this;
    const { draggable } = model.attributes;
    return config.draggableComponents && draggable;
  }

  _clbObj() {
    const { em, model, el } = this;
    return {
      editor: em && em.getEditor(),
      model,
      el,
    };
  }

  /**
   * Initialize callback
   */
  init() {}

  /**
   * Remove callback
   */
  removed() {}

  /**
   * Callback executed when the `active` event is triggered on component
   */
  onActive() {}

  /**
   * Callback executed when the `disable` event is triggered on component
   */
  onDisable() {}

  remove() {
    Backbone.View.prototype.remove.apply(this, arguments);
    const { model, $el } = this;
    const { views } = model;
    const frame = this._getFrame() || {};
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

  handleDragStart(event) {
    if (!this.__isDraggable()) return false;
    event.stopPropagation();
    event.preventDefault();
    this.em.get('Commands').run('tlb-move', {
      target: this.model,
      event,
    });
  }

  initClasses() {
    const { model } = this;
    const event = 'change:classes';
    const classes = model.get('classes');

    if (classes instanceof Selectors) {
      this.stopListening(model, event, this.initClasses);
      this.listenTo(model, event, this.initClasses);
      this.listenTo(classes, 'add remove change', this.updateClasses);
      classes.length && this.importClasses();
    }
  }

  initComponents(opts = {}) {
    const { model, $el, childrenView } = this;
    const event = 'change:components';
    const comps = model.get('components');
    const toListen = [model, event, this.initComponents];

    if (comps instanceof Components) {
      $el.data('collection', comps);
      childrenView && childrenView.remove();
      this.stopListening(...toListen);
      !opts.avoidRender && this.renderChildren();
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
    var clm = this.config.em.get('SelectorManager');

    if (clm) {
      this.model.get('classes').each(m => {
        clm.add(m.get('name'));
      });
    }
  }

  /**
   * Update item on status change
   * @param  {Event} e
   * @private
   * */
  updateStatus(opts = {}) {
    const { em, el, ppfx, model } = this;
    const { extHl } = em ? em.get('Canvas').getConfig() : {};
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

    switch (status) {
      case 'selected':
        cls.push(selCls);
        break;
      case 'selected-parent':
        cls.push(selectedParentCls);
        break;
      case 'freezed':
        cls.push(freezedCls);
        break;
      case 'freezed-selected':
        cls.push(freezedCls, selCls);
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
  updateStyle(m, v, opts = {}) {
    const { model, em } = this;

    if (em && em.getConfig().avoidInlineStyle && !opts.inline) {
      const style = model.getStyle();
      !isEmpty(style) && model.setStyle(style);
    } else {
      this.setAttribute('style', model.styleToString(opts));
    }
  }

  /**
   * Update classe attribute
   * @private
   * */
  updateClasses() {
    const str = this.model.get('classes').pluck('name').join(' ');
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
  setAttribute(name, value) {
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
    const attrs = [];
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
    const content = this.model.get('content');
    const hasComps = this.model.components().length;
    this.getChildrenContainer().innerHTML = hasComps ? '' : content;
  }

  /**
   * Prevent default helper
   * @param  {Event} e
   * @private
   */
  prevDef(e) {
    e.preventDefault();
  }

  /**
   * Render component's script
   * @private
   */
  updateScript() {
    const { model, em } = this;
    if (!model.get('script')) return;
    em && em.get('Canvas').getCanvasView().updateScript(this);
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
    const rect = {};
    const target = this.el;
    let gtop = 0;
    let gleft = 0;

    const assignRect = el => {
      const { offsetParent } = el;

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

  isInViewport({ rect } = {}) {
    const { el } = this;
    const elDoc = el.ownerDocument;
    const { body } = elDoc;
    const { frameElement } = elDoc.defaultView;
    const { top, left } = rect || this.getOffsetRect();
    const frame = this._getFrame().getOffsetRect();

    return (
      top >= frame.scrollTop &&
      left >= frame.scrollLeft &&
      top <= frame.scrollBottom &&
      left <= frameElement.offsetWidth + body.scrollLeft
    );
  }

  scrollIntoView(opts = {}) {
    const rect = this.getOffsetRect();
    const isInViewport = this.isInViewport({ rect });

    if (!isInViewport || opts.force) {
      const { el } = this;

      // PATCH: scrollIntoView won't work with multiple requests from iframes
      if (opts.behavior !== 'smooth') {
        el.ownerDocument.defaultView.scrollTo(0, rect.top);
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

  _getFrame() {
    return this.config.em?.get('Canvas').config.frameView;
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
        collection: this.model.get('components'),
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

  onRender() {}
}

// Due to the Backbone extend mechanism, static methods are not properly extended
ComponentView.getEvents = function () {
  return result(this.prototype, 'events');
};
