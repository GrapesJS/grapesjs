import { isArray } from 'underscore';

const ComponentsView = require('./ComponentsView');

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
    this.opts = opt;
    this.config = config;
    this.em = config.em || '';
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.attr = model.get('attributes');
    this.classe = this.attr.class || [];
    const $el = this.$el;
    const classes = model.get('classes');
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model, 'change:style', this.updateStyle);
    this.listenTo(model, 'change:attributes', this.updateAttributes);
    this.listenTo(model, 'change:highlightable', this.updateHighlight);
    this.listenTo(model, 'change:status', this.updateStatus);
    this.listenTo(model, 'change:state', this.updateState);
    this.listenTo(model, 'change:script', this.render);
    this.listenTo(model, 'change', this.handleChange);
    this.listenTo(classes, 'add remove change', this.updateClasses);
    $el.data('model', model);
    $el.data('collection', model.get('components'));
    model.view = this;
    classes.length && this.importClasses();
    this.init();
  },

  remove() {
    Backbone.View.prototype.remove.apply(this);
    const children = this.childrenView;
    children && children.stopListening();
  },

  /**
   * Initialize callback
   */
  init() {},

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

    if(clm){
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

    if(state){
      this.$el.addClass(cl);
    }else{
      this.$el.removeClass(cl);
    }
  },


  /**
   * Update item on status change
   * @param  {Event} e
   * @private
   * */
  updateStatus(e) {
    var el = this.el;
    var status = this.model.get('status');
    var pfx = this.pfx;
    var ppfx = this.ppfx;
    var selectedCls = pfx + 'selected';
    var selectedParentCls = selectedCls + '-parent';
    var freezedCls = `${ppfx}freezed`;
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
        default:
          this.$el.removeClass(`${selectedCls} ${selectedParentCls} ${freezedCls}`);
    }

    cls = cls.trim();

    if (cls) {
      el.setAttribute('class', cls);
    }
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
      model.setStyle(model.getStyle());
    } else {
      this.setAttribute('style', model.styleToString());
    }
  },


  /**
   * Update classe attribute
   * @private
   * */
  updateClasses() {
    const str = this.model.get('classes').pluck('name').join(' ');
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
    var attr = this.model.get("attributes"),
      classes  = attr['class'] || [];
    classes = isArray(classes) ? classes : [classes];

    if (classes.length) {
      return classes.join(' ');
    } else {
      return null;
    }
  },

  /**
   * Update attributes
   * @private
   * */
  updateAttributes() {
    const model = this.model;
    const attrs = {}
    const attr = model.get('attributes');
    const src = model.get('src');

    for (let key in attr) {
      attrs[key] = attr[key];
    }

    src && (attrs.src = src);
    this.$el.attr(attrs);
    this.updateHighlight();
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
    if (!this.model.get('script')) {
      return;
    }

    var em = this.em;
    if(em) {
      var canvas = em.get('Canvas');
      canvas.getCanvasView().updateScript(this);
    }
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
    const container = this.getChildrenContainer();
    const view = new ComponentsView({
      collection: this.model.get('components'),
      config: this.config,
      componentTypes: this.opts.componentTypes,
    });

    view.render(container);
    this.childrenView = view;
    const childNodes = Array.prototype.slice.call(view.el.childNodes);

    for (var i = 0, len = childNodes.length ; i < len; i++) {
      container.appendChild(childNodes.shift());
    }

    // If the children container is not the same as the component
    // (so likely fetched with getChildrenSelector()) is necessary
    // to disable pointer-events for all nested components as they
    // might prevent the component to be selected
    if (container !== this.el) {
      var disableNode = el => {
        var children = Array.prototype.slice.call(el.children);
        children.forEach(el => {
          el.style['pointer-events'] = 'none';
          if (container !== el) {
            disableNode(el);
          }
        });
      };
      disableNode(this.el);
    }
  },

  renderAttributes() {
    this.updateAttributes();
    this.updateClasses();
  },

  render() {
    this.renderAttributes();
    this.updateContent();
    this.renderChildren();
    this.updateScript();
    return this;
  },

});
