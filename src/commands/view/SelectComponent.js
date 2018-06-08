import { bindAll, isElement, isUndefined } from 'underscore';
import { on, off, getUnitFromValue } from 'utils/mixins';

const ToolbarView = require('dom_components/view/ToolbarView');
const Toolbar = require('dom_components/model/Toolbar');
const key = require('keymaster');
const $ = require('backbone').$;
let showOffsets;

module.exports = {
  init(o) {
    bindAll(this, 'onHover', 'onOut', 'onClick', 'onKeyPress', 'onFrameScroll');
  },

  enable() {
    this.frameOff = this.canvasOff = this.adjScroll = null;
    var config = this.config.em.get('Config');
    this.startSelectComponent();
    var em = this.config.em;
    showOffsets = 1;

    em.on('component:update', this.updateAttached, this);
    em.on('change:canvasOffset', this.updateAttached, this);
  },

  /**
   * Start select component event
   * @private
   * */
  startSelectComponent() {
    this.toggleSelectComponent(1);
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
  toggleSelectComponent(enable) {
    const em = this.em;
    const method = enable ? 'on' : 'off';
    const methods = { on, off };
    const body = this.getCanvasBody();
    const win = this.getContentWindow();
    methods[method](body, 'mouseover', this.onHover);
    methods[method](body, 'mouseout', this.onOut);
    methods[method](body, 'click', this.onClick);
    methods[method](win, 'scroll resize', this.onFrameScroll);
    methods[method](win, 'keydown', this.onKeyPress);
    em[method]('component:toggled', this.onSelect, this);
    em[method]('change:componentHovered', this.onHovered, this);
  },

  /**
   * On key press event
   * @private
   * */
  onKeyPress(e) {
    var key = e.which || e.keyCode;
    var comp = this.editorModel.getSelected();
    var focused = this.frameEl.contentDocument.activeElement.tagName !== 'BODY';

    // On CANC (46) or Backspace (8)
    if (key == 8 || key == 46) {
      if (!focused) e.preventDefault();
      if (comp && !focused) {
        this.editor.runCommand('core:component-delete');
      }
    }
  },

  /**
   * Hover command
   * @param {Object}  e
   * @private
   */
  onHover(e) {
    e.stopPropagation();
    let trg = e.target;
    let model = $(trg).data('model');

    // Adjust tools scroll top
    if (!this.adjScroll) {
      this.adjScroll = 1;
      this.onFrameScroll(e);
      this.updateAttached();
    }

    if (model && !model.get('hoverable')) {
      let parent = model && model.parent();
      while (parent && !parent.get('hoverable')) parent = comp.parent();
      model = parent;
    }

    this.em.setHovered(model, { forceChange: 1 });
  },

  onHovered(em, component) {
    const trg = component && component.getEl();
    if (trg) {
      const pos = this.getElementPos(trg);
      this.updateBadge(trg, pos);
      this.updateHighlighter(trg, pos);
      this.showElementOffset(trg, pos);
    }
  },

  /**
   * Out command
   * @param {Object}  e
   * @private
   */
  onOut(e) {
    e.stopPropagation();
    this.hideBadge();
    this.hideHighlighter();
    this.hideElementOffset();
  },

  /**
   * Show element offset viewer
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  showElementOffset(el, pos) {
    var $el = $(el);
    var model = $el.data('model');

    if ((model && model.get('status') == 'selected') || !showOffsets) {
      return;
    }

    this.editor.runCommand('show-offset', {
      el,
      elPos: pos
    });
  },

  /**
   * Hide element offset viewer
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  hideElementOffset(el, pos) {
    this.editor.stopCommand('show-offset');
  },

  /**
   * Show fixed element offset viewer
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  showFixedElementOffset(el, pos) {
    this.editor.runCommand('show-offset', {
      el,
      elPos: pos,
      state: 'Fixed'
    });
  },

  /**
   * Hide fixed element offset viewer
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  hideFixedElementOffset(el, pos) {
    if (this.editor) this.editor.stopCommand('show-offset', { state: 'Fixed' });
  },

  /**
   * Hide Highlighter element
   */
  hideHighlighter() {
    this.canvas.getHighlighter().style.display = 'none';
  },

  /**
   * On element click
   * @param {Event}  e
   * @private
   */
  onClick(e) {
    e.stopPropagation();
    const $el = $(e.target);
    const editor = this.editor;
    let model = $el.data('model');

    if (!model) {
      let parent = $el.parent();
      while (!model && parent) {
        model = parent.data('model');
        parent = parent.parent();
      }
    }

    if (model) {
      if (model.get('selectable')) {
        this.select(model, e);
      } else {
        let parent = model.parent();
        while (parent && !parent.get('selectable')) parent = parent.parent();
        this.select(parent, e);
      }
    }
  },

  /**
   * Select component
   * @param  {Component} model
   * @param  {Event} event
   */
  select(model, event = {}) {
    if (!model) return;
    const ctrlKey = event.ctrlKey || event.metaKey;
    const shiftKey = event.shiftKey;
    const { editor } = this;
    const multiple = editor.getConfig('multipleSelection');
    const em = this.em;

    if (ctrlKey && multiple) {
      editor.selectToggle(model);
    } else if (shiftKey && multiple) {
      em.clearSelection(editor.Canvas.getWindow());
      const coll = model.collection;
      const index = coll.indexOf(model);
      const selAll = editor.getSelectedAll();
      let min, max;

      // Fin min and max siblings
      editor.getSelectedAll().forEach(sel => {
        const selColl = sel.collection;
        const selIndex = selColl.indexOf(sel);
        if (selColl === coll) {
          if (selIndex < index) {
            // First model BEFORE the selected one
            min = isUndefined(min) ? selIndex : Math.max(min, selIndex);
          } else if (selIndex > index) {
            // First model AFTER the selected one
            max = isUndefined(max) ? selIndex : Math.min(max, selIndex);
          }
        }
      });

      if (!isUndefined(min)) {
        while (min !== index) {
          editor.selectAdd(coll.at(min));
          min++;
        }
      }

      if (!isUndefined(max)) {
        while (max !== index) {
          editor.selectAdd(coll.at(max));
          max--;
        }
      }

      editor.selectAdd(model);
    } else {
      editor.select(model);
    }

    this.initResize(model);
  },

  /**
   * Update badge for the component
   * @param {Object} Component
   * @param {Object} pos Position object
   * @private
   * */
  updateBadge(el, pos) {
    var $el = $(el);
    var canvas = this.canvas;
    var config = canvas.getConfig();
    var customeLabel = config.customBadgeLabel;
    this.cacheEl = el;
    var model = $el.data('model');
    if (!model || !model.get('badgable')) return;
    var badge = this.getBadge();
    var badgeLabel = model.getIcon() + model.getName();
    badgeLabel = customeLabel ? customeLabel(model) : badgeLabel;
    badge.innerHTML = badgeLabel;
    var bStyle = badge.style;
    var u = 'px';
    bStyle.display = 'block';
    var canvasPos = canvas.getCanvasView().getPosition();
    if (canvasPos) {
      var badgeH = badge ? badge.offsetHeight : 0;
      var badgeW = badge ? badge.offsetWidth : 0;
      var top =
        pos.top - badgeH < canvasPos.top ? canvasPos.top : pos.top - badgeH;
      var left = pos.left + badgeW < canvasPos.left ? canvasPos.left : pos.left;
      bStyle.top = top + u;
      bStyle.left = left + u;
    }
  },

  /**
   * Update highlighter element
   * @param {HTMLElement} el
   * @param {Object} pos Position object
   * @private
   */
  updateHighlighter(el, pos) {
    var $el = $(el);
    var model = $el.data('model');

    if (
      !model ||
      !model.get('hoverable') ||
      model.get('status') == 'selected'
    ) {
      return;
    }

    var hlEl = this.canvas.getHighlighter();
    var hlStyle = hlEl.style;
    var unit = 'px';
    hlStyle.left = pos.left + unit;
    hlStyle.top = pos.top + unit;
    hlStyle.height = pos.height + unit;
    hlStyle.width = pos.width + unit;
    hlStyle.display = 'block';
  },

  /**
   * Say what to do after the component was selected
   * @param {Object}  e
   * @param {Object}  el
   * @private
   * */
  onSelect() {
    // Get the selected model directly from the Editor as the event might
    // be triggered manually without the model
    const model = this.em.getSelected();
    this.updateToolbar(model);

    if (model) {
      const el = model.view.el;
      this.showFixedElementOffset(el);
      this.hideElementOffset();
      this.hideHighlighter();
      this.initResize(el);
    } else {
      this.editor.stopCommand('resize');
    }
  },

  /**
   * Init resizer on the element if possible
   * @param  {HTMLElement|Component} elem
   * @private
   */
  initResize(elem) {
    const em = this.em;
    const editor = em ? em.get('Editor') : '';
    const config = em ? em.get('Config') : '';
    const pfx = config.stylePrefix || '';
    const attrName = `data-${pfx}handler`;
    const resizeClass = `${pfx}resizing`;
    const model = !isElement(elem) ? elem : em.getSelected();
    const resizable = model.get('resizable');
    const el = isElement(elem) ? elem : model.getEl();
    let options = {};
    let modelToStyle;

    var toggleBodyClass = (method, e, opts) => {
      const docs = opts.docs;
      docs &&
        docs.forEach(doc => {
          const body = doc.body;
          const cls = body.className || '';
          body.className = (method == 'add'
            ? `${cls} ${resizeClass}`
            : cls.replace(resizeClass, '')
          ).trim();
        });
    };

    if (editor && resizable) {
      options = {
        // Here the resizer is updated with the current element height and width
        onStart(e, opts = {}) {
          const { el, config, resizer } = opts;
          const { keyHeight, keyWidth, currentUnit } = config;
          toggleBodyClass('add', e, opts);
          modelToStyle = em.get('StyleManager').getModelToStyle(model);
          const computedStyle = getComputedStyle(el);
          const modelStyle = modelToStyle.getStyle();
          const currentWidth = modelStyle[keyWidth] || computedStyle[keyWidth];
          const currentHeight =
            modelStyle[keyHeight] || computedStyle[keyHeight];
          resizer.startDim.w = parseFloat(currentWidth);
          resizer.startDim.h = parseFloat(currentHeight);
          showOffsets = 0;

          if (currentUnit) {
            config.unitHeight = getUnitFromValue(currentHeight);
            config.unitWidth = getUnitFromValue(currentWidth);
          }
        },

        // Update all positioned elements (eg. component toolbar)
        onMove() {
          editor.trigger('change:canvasOffset');
        },

        onEnd(e, opts) {
          toggleBodyClass('remove', e, opts);
          editor.trigger('change:canvasOffset');
          showOffsets = 1;
        },

        updateTarget(el, rect, options = {}) {
          if (!modelToStyle) {
            return;
          }

          const { store, selectedHandler, config } = options;
          const { keyHeight, keyWidth } = config;
          const onlyHeight = ['tc', 'bc'].indexOf(selectedHandler) >= 0;
          const onlyWidth = ['cl', 'cr'].indexOf(selectedHandler) >= 0;
          const style = modelToStyle.getStyle();

          if (!onlyHeight) {
            style[keyWidth] = rect.w + config.unitWidth;
          }

          if (!onlyWidth) {
            style[keyHeight] = rect.h + config.unitHeight;
          }

          modelToStyle.setStyle(style, { avoidStore: 1 });
          const updateEvent = `update:component:style`;
          em &&
            em.trigger(
              `${updateEvent}:${keyHeight} ${updateEvent}:${keyWidth}`
            );

          if (store) {
            modelToStyle.trigger('change:style', modelToStyle, style, {});
          }
        }
      };

      if (typeof resizable == 'object') {
        options = { ...options, ...resizable };
      }
      editor.runCommand('resize', { el, options });

      // On undo/redo the resizer rect is not updating, need somehow to call
      // this.updateRect on undo/redo action
    } else {
      editor.stopCommand('resize');
    }
  },

  /**
   * Update toolbar if the component has one
   * @param {Object} mod
   */
  updateToolbar(mod) {
    var em = this.config.em;
    var model = mod == em ? em.getSelected() : mod;
    var toolbarEl = this.canvas.getToolbarEl();
    var toolbarStyle = toolbarEl.style;

    if (!model) {
      // By putting `toolbarStyle.display = 'none'` will cause kind
      // of freezed effect with component selection (probably by iframe
      // switching)
      toolbarStyle.opacity = 0;
      return;
    }

    var toolbar = model.get('toolbar');
    var ppfx = this.ppfx;
    var showToolbar = em.get('Config').showToolbar;

    if (showToolbar && toolbar && toolbar.length) {
      toolbarStyle.opacity = '';
      toolbarStyle.display = '';
      if (!this.toolbar) {
        toolbarEl.innerHTML = '';
        this.toolbar = new Toolbar(toolbar);
        var toolbarView = new ToolbarView({
          collection: this.toolbar,
          editor: this.editor
        });
        toolbarEl.appendChild(toolbarView.render().el);
      }

      this.toolbar.reset(toolbar);
      const view = model.view;
      view && this.updateToolbarPos(view.el);
    } else {
      toolbarStyle.display = 'none';
    }
  },

  /**
   * Update toolbar positions
   * @param {HTMLElement} el
   * @param {Object} pos
   */
  updateToolbarPos(el, elPos) {
    var unit = 'px';
    var toolbarEl = this.canvas.getToolbarEl();
    var toolbarStyle = toolbarEl.style;
    const origDisp = toolbarStyle.display;
    toolbarStyle.display = 'block';
    var pos = this.canvas.getTargetToElementDim(toolbarEl, el, {
      elPos,
      event: 'toolbarPosUpdate'
    });
    if (pos) {
      var leftPos = pos.left + pos.elementWidth - pos.targetWidth;
      toolbarStyle.top = pos.top + unit;
      toolbarStyle.left = (leftPos < 0 ? 0 : leftPos) + unit;
      toolbarStyle.display = origDisp;
    }
  },

  /**
   * Return canvas dimensions and positions
   * @return {Object}
   */
  getCanvasPosition() {
    return this.canvas.getCanvasView().getPosition();
  },

  /**
   * Removes all highlighting effects on components
   * @private
   * */
  clean() {
    if (this.selEl) this.selEl.removeClass(this.hoverClass);
  },

  /**
   * Returns badge element
   * @return {HTMLElement}
   * @private
   */
  getBadge() {
    return this.canvas.getBadgeEl();
  },

  /**
   * On frame scroll callback
   * @private
   */
  onFrameScroll(e) {
    var el = this.cacheEl;
    if (el) {
      var elPos = this.getElementPos(el);
      this.updateBadge(el, elPos);
      var model = this.em.getSelected();

      if (model) {
        this.updateToolbarPos(model.view.el);
      }
    }
  },

  /**
   * Update attached elements, eg. component toolbar
   * @return {[type]} [description]
   */
  updateAttached(updated) {
    const model = this.em.getSelected();

    if (model) {
      var view = model.view;
      this.updateToolbarPos(view.el);
      this.showFixedElementOffset(view.el);
    }
  },

  /**
   * Returns element's data info
   * @param {HTMLElement} el
   * @return {Object}
   * @private
   */
  getElementPos(el, badge) {
    return this.canvas.getCanvasView().getElementPos(el);
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
  cleanPrevious(model) {
    model &&
      model.set({
        status: '',
        state: ''
      });
  },

  /**
   * Returns content window
   * @private
   */
  getContentWindow() {
    return this.frameEl.contentWindow;
  },

  run(editor) {
    this.editor = editor && editor.get('Editor');
    this.enable();
    this.onSelect();
  },

  stop(editor, sender, opts = {}) {
    const em = this.em;
    this.stopSelectComponent();
    !opts.preserveSelected && em.setSelected(null);
    this.clean();
    this.hideBadge();
    this.hideFixedElementOffset();
    this.canvas.getToolbarEl().style.display = 'none';

    em.off('component:update', this.updateAttached, this);
    em.off('change:canvasOffset', this.updateAttached, this);
  }
};
