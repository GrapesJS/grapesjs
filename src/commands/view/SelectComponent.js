import Backbone from 'backbone';
import { bindAll, isElement, isUndefined, debounce } from 'underscore';
import { on, off, getUnitFromValue, isTaggableNode } from 'utils/mixins';
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
    const body = this.getCanvasBody();
    const win = this.getContentWindow();
    const trigger = (win, body) => {
      methods[method](body, 'mouseover', this.onHover);
      methods[method](body, 'mouseout', this.onOut);
      methods[method](body, 'click touchend', this.onClick);
      methods[method](win, 'scroll resize', this.onFrameScroll);
      em[method]('component:toggled', this.onSelect, this);
      em[method]('change:componentHovered', this.onHovered, this);
      em[method]('component:update', this.updateAttached, this);
      em[method]('change:canvasOffset', this.updateAttached, this);
      // em[method]('frame:scroll', this.onFrameScroll);
    };
    trigger(win, body); // TODO remove
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

    this.em.setHovered(model, { forceChange: 1 });
  },

  onHovered(em, component) {
    const el = component && component.getEl();

    if (el) {
      const pos = this.getElementPos(el);
      this.elHovered = { el, pos };
      this.updateToolsHover(el, pos);
    }
  },

  getElHovered() {
    return this.elHovered || {};
  },

  /**
   * Out command
   * @param {Object}  e
   * @private
   */
  onOut(ev) {
    ev && ev.stopPropagation();
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
      elPos: pos,
      force: 1,
      top: this.frameRect(el, 1, pos),
      left: this.frameRect(el, 0, pos)
    });
  },

  /**
   * Hide element offset viewer
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  hideElementOffset(el, pos) {
    const { editor } = this;
    editor && editor.stopCommand('show-offset');
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
    const { canvas } = this;
    const config = canvas.getConfig();
    const ppfx = config.pStylePrefix || '';
    const customeLabel = config.customBadgeLabel;
    const model = $(el).data('model');
    if (!model || !model.get('badgable')) return;
    const badge = this.getBadge();
    const icon = model.getIcon();
    const clsBadge = `${ppfx}badge`;
    let badgeLabel = `${
      icon ? `<div class="${clsBadge}__icon">${icon}</div>` : ''
    }
      <div class="${clsBadge}__name">${model.getName()}</div>`;
    badgeLabel = customeLabel ? customeLabel(model) : badgeLabel;
    badge.innerHTML = badgeLabel;

    const u = 'px';
    const bStyle = badge.style;
    bStyle.display = 'block';
    const badgeH = badge ? badge.offsetHeight : 0;
    const posTop = this.frameRect(el, 1, pos) - badgeH;
    const badgeW = badge ? badge.offsetWidth : 0;
    const top = posTop < 0 ? 0 : posTop;
    const posLeft = this.frameRect(el, 0, pos);
    const left = posLeft + badgeW < 0 ? 0 : posLeft;

    bStyle.top = top + u;
    bStyle.left = left + u;
  },

  frameRect(el, top = 1, pos) {
    const zoom = this.em.getZoomDecimal();
    const side = top ? 'top' : 'left';
    const { scrollTop = 0, scrollLeft = 0 } = el.ownerDocument.body || {};

    return pos[side] - (top ? scrollTop : scrollLeft) * zoom;
  },

  frameRect(el, top = 1, pos) {
    const zoom = this.em.getZoomDecimal();
    const side = top ? 'top' : 'left';
    const { scrollTop = 0, scrollLeft = 0 } = el.ownerDocument.body || {};

    return pos[side] - (top ? scrollTop : scrollLeft) * zoom;
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
    hlStyle.left = this.frameRect(el, 0, pos) + unit;
    hlStyle.top = this.frameRect(el, 1, pos) + unit;
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
    const el = model && model.getEl();
    this.updateToolbar(model);

    if (el) {
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
          editor: this.editor
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
  updateToolbarPos(el, pos) {
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
      let top = this.frameRect(el, 1, pos) - toolbarH;
      let left = this.frameRect(el, 0, pos) + pos.width - toolbarW;
      left = left < 0 ? 0 : left;

      // Scroll with the window if the top edge is reached and the
      // element is bigger than the canvas
      const fullHeight = pos.height + toolbarH;
      const elIsShort = fullHeight < frameOffset.height;

      if (top < frCvOff.top && elIsShort) {
        top = top + fullHeight;
      } else if (top < 0) {
        top = top > -pos.height ? 0 : top + fullHeight - toolbarH;
      }

      // Check left position of the toolbar
      const leftR = left + toolbarW;

      if (leftR > frCvOff.width) {
        left -= leftR - frCvOff.width;
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
  getBadge() {
    return this.canvas.getBadgeEl();
  },

  /**
   * On frame scroll callback
   * @private
   */
  onFrameScroll(ev) {
    const { el } = this.getElHovered();
    const pos = this.getElementPos(el); // TODO check if this could be cached
    const model = this.em.getSelected();
    const viewEl = model && model.getEl();
    el && this.updateToolsHover(el, pos);
    viewEl && this.updateToolbarPos(viewEl, this.getElementPos(viewEl));
  },

  /**
   * Update tools visible on hover
   * @param {HTMLElement} el
   * @param {Object} pos
   */
  updateToolsHover(el, pos) {
    this.updateBadge(el, pos);
    this.updateHighlighter(el, pos);
    this.showElementOffset(el, pos);
  },

  /**
   * Update attached elements, eg. component toolbar
   */
  updateAttached: debounce(function() {
    const { resizer, em } = this;
    const model = em.getSelected();
    const el = model && model.getEl();

    if (el && this.elSelected !== el) {
      this.elSelected = el;
      const pos = this.getElementPos(el);
      this.updateToolbarPos(el, pos);
      this.showFixedElementOffset(el);
      resizer && resizer.updateContainer();
    }
  }),

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
