import Backbone from 'backbone';
import { bindAll, isElement, isUndefined, debounce } from 'underscore';
import {
  on,
  off,
  getUnitFromValue,
  isTaggableNode,
  getViewEl
} from 'utils/mixins';
import ToolbarView from 'dom_components/view/ToolbarView';
import Toolbar from 'dom_components/model/Toolbar';

const $ = Backbone.$;
let showOffsets;

export default {
  init(o) {
    bindAll(this, 'onHover', 'onOut', 'onClick', 'onFrameScroll');
  },

  enable() {
    this.frameOff = this.canvasOff = this.adjScroll = null;
    this.startSelectComponent();
    const { em } = this.config;
    showOffsets = 1;
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
    const { em } = this;
    const method = enable ? 'on' : 'off';
    const methods = { on, off };
    const trigger = (win, body) => {
      methods[method](body, 'mouseover', this.onHover);
      methods[method](body, 'mouseleave', this.onOut);
      methods[method](body, 'click touchend', this.onClick);
      methods[method](win, 'scroll resize', this.onFrameScroll);
    };
    em[method]('component:toggled', this.onSelect, this);
    em[method]('change:componentHovered', this.onHovered, this);
    em[method]('component:update', this.updateAttached, this);
    em[method]('component:resize', this.updateAttached, this);
    em[method]('change:canvasOffset', this.updateAttached, this);
    // const body = this.getCanvasBody();
    // const win = this.getContentWindow();
    // trigger(win, body); // TODO remove
    em.get('Canvas')
      .getFrames()
      .forEach(frame => {
        const { view } = frame;
        trigger(view.getWindow(), view.getBody());
      });
  },

  /**
   * Hover command
   * @param {Object}  e
   * @private
   */
  onHover(e) {
    e.stopPropagation();
    const trg = e.target;
    const view = getViewEl(trg);
    const frameView = view && view._getFrame();
    const $el = $(trg);
    let model = $el.data('model');

    // Get first valid model
    if (!model) {
      let parent = $el.parent();
      while (!model && parent.length > 0) {
        model = parent.data('model');
        parent = parent.parent();
      }
    }

    // Get first valid hoverable model
    if (model && !model.get('hoverable')) {
      let parent = model && model.parent();
      while (parent && !parent.get('hoverable')) parent = parent.parent();
      model = parent;
    }

    this.currentDoc = trg.ownerDocument;
    this.em.setHovered(model);
    frameView && this.em.set('currentFrame', frameView);
  },

  onHovered(em, component) {
    let result = {};

    if (component) {
      component.views.forEach(view => {
        const el = view.el;
        const pos = this.getElementPos(el);
        result = { el, pos, component, view: getViewEl(el) };
        this.updateToolsLocal(result);

        if (el.ownerDocument === this.currentDoc) this.elHovered = result;
      });
    }
  },

  /**
   * Say what to do after the component was selected
   * @param {Object}  e
   * @param {Object}  el
   * @private
   * */
  onSelect(component) {
    const prevComp = this.getElSelected().component;
    if (component && component === prevComp) return;

    const view =
      component &&
      component.views.filter(
        view => view.el.ownerDocument === this.currentDoc
      )[0];
    let el = view && view.el;
    if (!el && component) el = component.getEl();
    let result = {};

    if (el) {
      const pos = this.getElementPos(el);
      result = { el, pos, component, view: getViewEl(el) };
    }

    this.elSelected = result;
    this.updateToolsGlobal();

    // // Get the selected model directly from the Editor as the event might
    // // be triggered manually without the model
    // const model = this.em.getSelected();
    // const el = model && model.getEl();
    // this.updateToolbar(model);

    // if (el) {
    //   this.showFixedElementOffset(el);
    //   this.hideElementOffset();
    //   this.hideHighlighter();
    //   this.initResize(el);
    // } else {
    //   this.editor.stopCommand('resize');
    // }
  },

  getElHovered() {
    return this.elHovered || {};
  },

  getElSelected() {
    return this.elSelected || {};
  },

  onOut() {
    this.currentDoc = null;
    this.em.setHovered(0);
    this.canvas.getFrames().forEach(frame => {
      const el = frame.view.getToolsEl();
      this.toggleToolsEl(0, 0, { el });
    });
  },

  toggleToolsEl(on, view, opts = {}) {
    const el = opts.el || this.canvas.getToolsEl(view);
    el.style.opacity = on ? 1 : 0;
    return el;
  },

  /**
   * Show element offset viewer
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  showElementOffset(el, pos, opts = {}) {
    if (!showOffsets) return;
    this.editor.runCommand('show-offset', {
      el,
      elPos: pos,
      view: opts.view,
      force: 1,
      top: 0,
      left: 0
    });
  },

  /**
   * Hide element offset viewer
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  hideElementOffset(view) {
    this.editor.stopCommand('show-offset', {
      view
    });
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
  hideHighlighter(view) {
    this.canvas.getHighlighter(view).style.opacity = 0;
  },

  /**
   * On element click
   * @param {Event}  e
   * @private
   */
  onClick(e) {
    const { em } = this;
    e.stopPropagation();
    e.preventDefault();
    if (em.get('_cmpDrag')) return em.set('_cmpDrag');
    const $el = $(e.target);
    let model = $el.data('model');

    if (!model) {
      let parent = $el.parent();
      while (!model && parent.length > 0) {
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
    const { shiftKey } = event;
    const { editor, em } = this;
    const multiple = editor.getConfig('multipleSelection');

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
      editor.select(model, { scroll: {} });
    }

    this.initResize(model);
  },

  /**
   * Update badge for the component
   * @param {Object} Component
   * @param {Object} pos Position object
   * @private
   * */
  updateBadge(el, pos, opts = {}) {
    const model = $(el).data('model');
    if (!model || !model.get('badgable')) return;
    const badge = this.getBadge(opts);

    if (!opts.posOnly) {
      const config = this.canvas.getConfig();
      const icon = model.getIcon();
      const ppfx = config.pStylePrefix || '';
      const clsBadge = `${ppfx}badge`;
      const customeLabel = config.customBadgeLabel;
      const badgeLabel = `${
        icon ? `<div class="${clsBadge}__icon">${icon}</div>` : ''
      }
        <div class="${clsBadge}__name">${model.getName()}</div>`;
      badge.innerHTML = customeLabel ? customeLabel(model) : badgeLabel;
    }

    const un = 'px';
    const bStyle = badge.style;
    bStyle.display = 'block';
    const badgeH = badge ? badge.offsetHeight : 0;
    const posTop = 0 - badgeH;
    const top = opts.topOff - badgeH < 0 ? -opts.topOff : posTop;
    const left = opts.leftOff < 0 ? -opts.leftOff : 0;

    bStyle.top = top + un;
    bStyle.left = left + un;
  },

  frameRectOffset(el, pos) {
    return {
      top: this.frameRect(el, 1, pos),
      left: this.frameRect(el, 0, pos)
    };
  },

  getFrameElFromDoc(doc) {
    const { defaultView } = doc;
    return defaultView && defaultView.frameElement;
  },

  frameRect(el, top = 1, pos) {
    const zoom = this.em.getZoomDecimal();
    const side = top ? 'top' : 'left';
    const { offsetTop = 0, offsetLeft = 0 } = this.getFrameElFromDoc(
      el.ownerDocument
    );
    const { scrollTop = 0, scrollLeft = 0 } = el.ownerDocument.body || {};
    const scroll = top ? scrollTop : scrollLeft;
    const offset = top ? offsetTop : offsetLeft;

    return pos[side] - (scroll - offset) * zoom;
  },

  /**
   * Update highlighter element
   * @param {HTMLElement} el
   * @param {Object} pos Position object
   * @private
   */
  updateHighlighter(el, pos, opts = {}) {
    const { style } = this.canvas.getHighlighter(opts.view);
    const unit = 'px';
    style.height = pos.height + unit;
    style.width = pos.width + unit;
    style.opacity = '';
  },

  /**
   * Init resizer on the element if possible
   * @param  {HTMLElement|Component} elem
   * @private
   */
  initResize(elem) {
    const { em, canvas } = this;
    const editor = em ? em.get('Editor') : '';
    const config = em ? em.get('Config') : '';
    const pfx = config.stylePrefix || '';
    const resizeClass = `${pfx}resizing`;
    const model =
      !isElement(elem) && isTaggableNode(elem) ? elem : em.getSelected();
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
          const {
            keyHeight,
            keyWidth,
            currentUnit,
            keepAutoHeight,
            keepAutoWidth
          } = config;
          toggleBodyClass('add', e, opts);
          modelToStyle = em.get('StyleManager').getModelToStyle(model);
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

        onUpdateContainer({ el }) {
          el.style.top = 0;
          el.style.left = 0;
        },

        updateTarget(el, rect, options = {}) {
          if (!modelToStyle) {
            return;
          }

          const { store, selectedHandler, config } = options;
          const {
            keyHeight,
            keyWidth,
            autoHeight,
            autoWidth,
            unitWidth,
            unitHeight
          } = config;
          const onlyHeight = ['tc', 'bc'].indexOf(selectedHandler) >= 0;
          const onlyWidth = ['cl', 'cr'].indexOf(selectedHandler) >= 0;
          const style = modelToStyle.getStyle();

          if (!onlyHeight) {
            const bodyw = canvas.getBody().offsetWidth;
            const width = rect.w < bodyw ? rect.w : bodyw;
            style[keyWidth] = autoWidth ? 'auto' : `${width}${unitWidth}`;
          }

          if (!onlyWidth) {
            style[keyHeight] = autoHeight ? 'auto' : `${rect.h}${unitHeight}`;
          }

          modelToStyle.setStyle(style, { avoidStore: 1 });
          const updateEvent = `update:component:style`;
          const eventToListen = `${updateEvent}:${keyHeight} ${updateEvent}:${keyWidth}`;
          em && em.trigger(eventToListen);

          if (store) {
            modelToStyle.trigger('change:style', modelToStyle, style, {});
          }
        }
      };

      if (typeof resizable == 'object') {
        options = { ...options, ...resizable };
      }

      this.resizer = editor.runCommand('resize', { el, options, force: 1 });
    } else {
      editor.stopCommand('resize');
      this.resizer = null;
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
    var showToolbar = em.get('Config').showToolbar;

    if (showToolbar && toolbar && toolbar.length) {
      toolbarStyle.opacity = '';
      toolbarStyle.display = '';
      if (!this.toolbar) {
        toolbarEl.innerHTML = '';
        this.toolbar = new Toolbar(toolbar);
        var toolbarView = new ToolbarView({
          collection: this.toolbar,
          editor: this.editor,
          em
        });
        toolbarEl.appendChild(toolbarView.render().el);
      }

      this.toolbar.reset(toolbar);
      toolbarStyle.top = '-100px';
      toolbarStyle.left = 0;
    } else {
      toolbarStyle.display = 'none';
    }
  },

  /**
   * Update toolbar positions
   * @param {HTMLElement} el
   * @param {Object} pos
   */
  updateToolbarPos(el, pos, opts = {}) {
    const { canvas } = this;
    const unit = 'px';
    const toolbarEl = canvas.getToolbarEl();
    const toolbarStyle = toolbarEl.style;
    toolbarStyle.opacity = 0;

    if (pos) {
      const cv = canvas.getCanvasView();
      const frCvOff = cv.getPosition();
      const frameOffset = cv.getFrameOffset();
      const toolbarH = toolbarEl ? toolbarEl.offsetHeight : 0;
      const toolbarW = toolbarEl ? toolbarEl.offsetWidth : 0;
      const elRight = pos.left + pos.width;
      let top = 0 - toolbarH;
      let left = pos.width - toolbarW;
      left = pos.left < -left ? -pos.left : left;
      left = elRight > frCvOff.width ? left - (elRight - frCvOff.width) : left;

      // Scroll with the window if the top edge is reached and the
      // element is bigger than the canvas
      const fullHeight = pos.height + toolbarH;
      const elIsShort = fullHeight < frameOffset.height;

      if (opts.topOff < toolbarH) {
        if (elIsShort) {
          top = top + fullHeight;
        } else {
          top = -opts.topOff < pos.height ? -opts.topOff : pos.height;
        }
      }

      toolbarStyle.top = `${top}${unit}`;
      toolbarStyle.left = `${left}${unit}`;
      toolbarStyle.opacity = '';
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
  getBadge(opts = {}) {
    return this.canvas.getBadgeEl(opts.view);
  },

  /**
   * On frame scroll callback
   * @private
   */
  onFrameScroll() {
    this.updateToolsLocal();
    this.updateToolsGlobal();
  },

  isCompSelected(comp) {
    return comp && comp.get('status') === 'selected';
  },

  /**
   * Update tools visible on hover
   * @param {HTMLElement} el
   * @param {Object} pos
   */
  updateToolsLocal(data) {
    const { el, pos, view, component } = data || this.getElHovered();

    if (!el) {
      this.lastHovered = 0;
      return;
    }

    const isHoverEn = component.get('hoverable');
    const isNewEl = this.lastHovered !== el;
    const badgeOpts = isNewEl ? {} : { posOnly: 1 };

    if (isNewEl && isHoverEn) {
      this.lastHovered = el;
      this.updateHighlighter(el, pos, { view });
      this.showElementOffset(el, pos, { view });
    }

    if (this.isCompSelected(component)) {
      this.hideHighlighter(view);
      this.hideElementOffset(view);
    }

    const unit = 'px';
    const { style } = this.toggleToolsEl(1, view);
    const frameOff = this.frameRectOffset(el, pos);
    const topOff = frameOff.top;
    const leftOff = frameOff.left;

    this.updateBadge(el, pos, {
      ...badgeOpts,
      view,
      topOff,
      leftOff
    });

    style.top = topOff + unit;
    style.left = leftOff + unit;
    style.width = pos.width + unit;
    style.height = pos.height + unit;
  },

  updateToolsGlobal() {
    const { el, pos, component } = this.getElSelected();

    if (!el) {
      this.lastSelected = 0;
      return;
    }

    const isNewEl = this.lastSelected !== el;

    if (isNewEl) {
      this.lastSelected = el;
      this.updateToolbar(component);
    }

    const unit = 'px';
    const { style } = this.toggleToolsEl(1);
    const frameOff = this.frameRectOffset(el, pos);
    const topOff = frameOff.top;
    const leftOff = frameOff.left;
    style.top = topOff + unit;
    style.left = leftOff + unit;
    style.width = pos.width + unit;
    style.height = pos.height + unit;

    this.updateToolbarPos(el, pos, {
      topOff,
      leftOff
    });

    // const { resizer, em } = this;
    // const model = em.getSelected();
    // const el = model && model.getEl();
    // if (!el) return;

    // if (el && this.elSelected !== el) {
    //   this.elSelected = el;
    //   const pos = this.getElementPos(el);
    //   this.updateToolbarPos(el, pos);
    //   this.showFixedElementOffset(el, pos);
    //   resizer && resizer.updateContainer();
    // }
  },

  /**
   * Update attached elements, eg. component toolbar
   */
  updateAttached: debounce(function() {
    this.updateToolsGlobal();
  }),

  /**
   * Returns element's data info
   * @param {HTMLElement} el
   * @return {Object}
   * @private
   */
  getElementPos(el) {
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
  },

  stop(ed, sender, opts = {}) {
    const { em, editor } = this;
    const hovered = em.getHovered();
    this.stopSelectComponent();
    !opts.preserveSelected && em.setSelected(null);
    if (!hovered) return;
    this.clean();
    this.onOut();
    this.hideFixedElementOffset();
    this.canvas.getToolbarEl().style.display = 'none';
    editor && editor.stopCommand('resize');
  }
};
