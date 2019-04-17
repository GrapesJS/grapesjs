import Backbone from 'backbone';
import { isArray, isEmpty, each, keys } from 'underscore';

const Components = require('../model/Components');
const ComponentsView = require('./ComponentsView');
const Selectors = require('selector_manager/model/Selectors');

module.exports = Backbone.View.extend({
  className() {
    return this.getClasses();
  },

  tagName() {
    return this.model.get('tagName');
  },

  initialize(opt = {}) {
    const model = this.model;
    const config = opt.config || {};
    const em = config.em;
    const modelOpt = model.opt || {};
    this.opts = opt;
    this.modelOpt = modelOpt;
    this.config = config;
    this.em = em || '';
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.attr = model.get('attributes');
    this.classe = this.attr.class || [];
    const $el = this.$el;
    this.listenTo(model, 'change:style', this.updateStyle);
    this.listenTo(model, 'change:attributes', this.renderAttributes);
    this.listenTo(model, 'change:highlightable', this.updateHighlight);
    this.listenTo(model, 'change:status', this.updateStatus);
    this.listenTo(model, 'change:state', this.updateState);
    this.listenTo(model, 'change:script', this.render);
    this.listenTo(model, 'change:content', this.updateContent);
    this.listenTo(model, 'change', this.handleChange);
    this.listenTo(model, 'active', this.onActive);
    $el.data('model', model);
    model.view = this;
    this.initClasses();
    this.initComponents({ avoidRender: 1 });
    !modelOpt.temporary && this.init();
  },

  /**
   * Initialize callback
   */
  init() {},

  /**
   * Callback executed when the `active` event is triggered on component
   */
  onActive() {},

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
  },

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
  },

  /**
   * Handle any property change
   * @private
   */
  handleChange() {
    const model = this.model;
    model.emitUpdate();

    for (let prop in model.changed) {
      model.emitUpdate(prop);
    }
  },

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
  },

  /**
   * Fires on state update. If the state is not empty will add a helper class
   * @param  {Event} e
   * @private
   * */
  updateState(e) {
    var cl = 'hc-state';
    var state = this.model.get('state');

    if (state) {
      this.$el.addClass(cl);
    } else {
      this.$el.removeClass(cl);
    }
  },

  /**
   * Update item on status change
   * @param  {Event} e
   * @private
   * */
  updateStatus(opts = {}) {
    const em = this.em;
    const el = this.el;
    const status = this.model.get('status');
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    const selectedCls = `${pfx}selected`;
    const selectedParentCls = `${selectedCls}-parent`;
    const freezedCls = `${ppfx}freezed`;
    const hoveredCls = `${ppfx}hovered`;
    const toRemove = [selectedCls, selectedParentCls, freezedCls, hoveredCls];
    this.$el.removeClass(toRemove.join(' '));
    var actualCls = el.getAttribute('class') || '';
    var cls = '';

    switch (status) {
      case 'selected':
        cls = `${actualCls} ${selectedCls}`;
        break;
      case 'selected-parent':
        cls = `${actualCls} ${selectedParentCls}`;
        break;
      case 'freezed':
        cls = `${actualCls} ${freezedCls}`;
        break;
      case 'freezed-selected':
        cls = `${actualCls} ${freezedCls} ${selectedCls}`;
        break;
      case 'hovered':
        cls = !opts.avoidHover ? `${actualCls} ${hoveredCls}` : '';
        break;
    }

    cls = cls.trim();
    cls && el.setAttribute('class', cls);
  },

  /**
   * Update highlight attribute
   * @private
   * */
  updateHighlight() {
    const hl = this.model.get('highlightable');
    this.setAttribute('data-highlightable', hl ? 1 : '');
  },

  /**
   * Update style attribute
   * @private
   * */
  updateStyle() {
    const em = this.em;
    const model = this.model;

    if (em && em.get('avoidInlineStyle')) {
      this.el.id = model.getId();
      const style = model.getStyle();
      !isEmpty(style) && model.setStyle(style);
    } else {
      this.setAttribute('style', model.styleToString());
    }
  },

  /**
   * Update classe attribute
   * @private
   * */
  updateClasses() {
    const str = this.model
      .get('classes')
      .pluck('name')
      .join(' ');
    this.setAttribute('class', str);

    // Regenerate status class
    this.updateStatus();
  },

  /**
   * Update single attribute
   * @param {[type]} name  [description]
   * @param {[type]} value [description]
   */
  setAttribute(name, value) {
    const el = this.$el;
    value ? el.attr(name, value) : el.removeAttr(name);
  },

  /**
   * Get classes from attributes.
   * This method is called before initialize
   *
   * @return  {Array}|null
   * @private
   * */
  getClasses() {
    return this.model.getClasses().join(' ');
  },

  /**
   * Update attributes
   * @private
   * */
  updateAttributes() {
    const attrs = [];
    const { model, $el, el } = this;
    const defaultAttr = {
      'data-gjs-type': model.get('type') || 'default',
      ...(model.get('highlightable') && { 'data-highlightable': 1 }),
      ...(model.get('textable') && {
        contenteditable: 'false',
        'data-gjs-textable': 'true'
      })
    };

    // Remove all current attributes
    each(el.attributes, attr => attrs.push(attr.nodeName));
    attrs.forEach(attr => $el.removeAttr(attr));
    const attr = {
      ...defaultAttr,
      ...model.getAttributes()
    };

    // Remove all `false` attributes
    keys(attr).forEach(key => attr[key] === false && delete attr[key]);

    $el.attr(attr);
    this.updateStyle();
  },

  /**
   * Update component content
   * @private
   * */
  updateContent() {
    this.getChildrenContainer().innerHTML = this.model.get('content');
  },

  /**
   * Prevent default helper
   * @param  {Event} e
   * @private
   */
  prevDef(e) {
    e.preventDefault();
  },

  /**
   * Render component's script
   * @private
   */
  updateScript() {
    const { model, em } = this;
    if (!model.get('script')) return;
    em &&
      em
        .get('Canvas')
        .getCanvasView()
        .updateScript(this);
  },

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
  },

  /**
   * Render children components
   * @private
   */
  renderChildren() {
    this.updateContent();
    const container = this.getChildrenContainer();
    const view = new ComponentsView({
      collection: this.model.get('components'),
      config: this.config,
      componentTypes: this.opts.componentTypes
    });

    view.render(container);
    this.childrenView = view;
    const childNodes = Array.prototype.slice.call(view.el.childNodes);

    for (var i = 0, len = childNodes.length; i < len; i++) {
      container.appendChild(childNodes.shift());
    }
  },

  renderAttributes() {
    this.updateAttributes();
    this.updateClasses();
  },

  render() {
    if (this.modelOpt.temporary) return this;
    this.renderAttributes();
    this.renderChildren();
    this.updateScript();
    this.postRender();

    return this;
  },

  postRender() {
    const { em, model, modelOpt } = this;

    if (!modelOpt.temporary) {
      this.onRender();
      em && em.trigger('component:mount', model);
    }
  },

  onRender() {}
});
