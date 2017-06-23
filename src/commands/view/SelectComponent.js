var ToolbarView = require('dom_components/view/ToolbarView');
var Toolbar = require('dom_components/model/Toolbar');
var key = require('keymaster');

module.exports = {

  init(o) {
    _.bindAll(this, 'onHover', 'onOut', 'onClick', 'onKeyPress');
  },


  enable() {
    _.bindAll(this, 'copyComp', 'pasteComp', 'onFrameScroll');
    this.frameOff = this.canvasOff = this.adjScroll = null;
    var config  = this.config.em.get('Config');
    this.startSelectComponent();
    this.toggleClipboard(config.copyPaste);
    var em = this.config.em;

    em.on('component:update', this.updateAttached, this);
    em.on('change:canvasOffset', this.updateAttached, this);
    em.on('change:selectedComponent', this.updateToolbar, this);
  },

  /**
   * Toggle clipboard function
   * @param  {Boolean} active
   * @return {this}
   * @private
   */
  toggleClipboard(active) {
    var en = active || 0;
    if(en){
      key('⌘+c, ctrl+c', this.copyComp);
      key('⌘+v, ctrl+v', this.pasteComp);
    }else{
      key.unbind('⌘+c, ctrl+c');
      key.unbind('⌘+v, ctrl+v');
    }
  },

  /**
   * Copy component to the clipboard
   * @private
   */
  copyComp() {
    var el = this.editorModel.get('selectedComponent');
    if(el && el.get('copyable'))
      this.editorModel.set('clipboard', el);
  },

  /**
   * Paste component from clipboard
   * @private
   */
  pasteComp() {
    var clp = this.editorModel.get('clipboard'),
        sel = this.editorModel.get('selectedComponent');
    if(clp && sel && sel.collection){
      var index = sel.collection.indexOf(sel),
          clone = clp.clone();
      sel.collection.add(clone, { at: index + 1 });
    }
  },

  /**
   * Returns canavs body el
   */
  getCanvasBodyEl() {
    if(!this.$bodyEl) {
      this.$bodyEl = $(this.getCanvasBody());
    }
    return this.$bodyEl;
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
    var el = '*';
    var method = enable ? 'on' : 'off';
    this.getCanvasBodyEl()
      [method]('mouseover', el, this.onHover)
      [method]('mouseout', el, this.onOut)
      [method]('click', el, this.onClick);

    var cw = this.getContentWindow();
    cw[method]('scroll', this.onFrameScroll);
    cw[method]('keydown', this.onKeyPress);
  },

  /**
   * On key press event
   * @private
   * */
  onKeyPress(e) {
    var key = e.which || e.keyCode;
    var comp = this.editorModel.get('selectedComponent');
    var focused = this.frameEl.contentDocument.activeElement.tagName !== 'BODY';

    // On CANC (46) or Backspace (8)
    if(key == 8 || key == 46) {
      if(!focused)
        e.preventDefault();
      if(comp && !focused) {
        if(!comp.get('removable'))
          return;
        comp.set('status','');
        comp.destroy();
        this.hideBadge();
        this.clean();
        this.hideHighlighter();
        this.editorModel.set('selectedComponent', null);
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
    var trg = e.target;

    // Adjust tools scroll top
    if(!this.adjScroll){
      this.adjScroll = 1;
      this.onFrameScroll(e);
      this.updateAttached();
    }

    var pos = this.getElementPos(trg);
    this.updateBadge(trg, pos);
    this.updateHighlighter(trg, pos);
    this.showElementOffset(trg, pos);
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
    if(model && model.get('status') == 'selected'){
      return;
    }
    this.editor.runCommand('show-offset', {
      el,
      elPos: pos,
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
      state: 'Fixed',
    });
  },

  /**
   * Hide fixed element offset viewer
   * @param {HTMLElement}  el
   * @param {Object} pos
   */
  hideFixedElementOffset(el, pos) {
    if(this.editor)
      this.editor.stopCommand('show-offset', {state: 'Fixed'});
  },

  /**
   * Hide Highlighter element
   */
  hideHighlighter() {
    this.canvas.getHighlighter().style.display = 'none';
  },

  /**
   * Hover command
   * @param {Object}  e
   * @private
   */
  onClick(e) {
    var m = $(e.target).data('model');
    if(!m)
      return;
    var s  = m.get('stylable');
    if(!(s instanceof Array) && !s)
      return;
    this.onSelect(e, e.target);
  },

  /**
   * Update badge for the component
   * @param {Object} Component
   * @param {Object} pos Position object
   * @private
   * */
  updateBadge(el, pos) {
    var $el = $(el);
    this.cacheEl = el;
    var model = $el.data("model");
    if(!model || !model.get('badgable'))
      return;
    var badge = this.getBadge();
    badge.innerHTML = model.getCurrentName();
    var bStyle = badge.style;
    var u = 'px';
    bStyle.display = 'block';
    var canvasPos = this.canvas.getCanvasView().getPosition();
    var badgeH = badge ? badge.offsetHeight : 0;
    var badgeW = badge ? badge.offsetWidth : 0;
    var top = pos.top - badgeH < canvasPos.top ? canvasPos.top : pos.top - badgeH;
    var left = pos.left + badgeW < canvasPos.left ? canvasPos.left : pos.left;
    bStyle.top = top + u;
    bStyle.left = left + u;
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
    if(!model || (model && model.get('status') == 'selected')) {
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
  onSelect(e, el) {
    e.stopPropagation();
    var md   = this.editorModel.get('selectedComponent');
    this.cleanPrevious(md);
    var $el = $(el);
    var nMd = $el.data('model');
    if(nMd) {
      var em = this.em;
      var mirror = nMd.get('mirror');
      nMd = mirror ? mirror : nMd;

      // Close all opened components inside Navigator
      var opened = em.get('opened');
      for (var cid in opened){
        var m = opened[cid];
        m.set('open', 0);
      }
      var parent = nMd.collection ? nMd.collection.parent : null;
      while(parent) {
        parent.set('open', 1);
        opened[parent.cid] = parent;
        parent = parent.collection ? parent.collection.parent : null;
      }

      this.editorModel.set('selectedComponent', nMd);
      nMd.set('status','selected');
      this.showFixedElementOffset(el);
      this.hideElementOffset();
      this.hideHighlighter();
    }
  },

  /**
   * Update toolbar if the component has one
   * @param {Object} mod
   */
  updateToolbar(mod) {
    var em = this.config.em;
    var model = mod == em ? em.get('selectedComponent') : mod;
    if(!model){
      return;
    }
    var toolbar = model.get('toolbar');
    var ppfx = this.ppfx;
    var showToolbar = em.get('Config').showToolbar;
    var toolbarEl = this.canvas.getToolbarEl();
    var toolbarStyle = toolbarEl.style;

    if (showToolbar && toolbar && toolbar.length) {
      toolbarStyle.display = 'flex';
      if(!this.toolbar) {
        toolbarEl.innerHTML = '';
        this.toolbar = new Toolbar(toolbar);
        var toolbarView = new ToolbarView({
          collection: this.toolbar,
          editor: this.editor
        });
        toolbarEl.appendChild(toolbarView.render().el);
      }

      this.toolbar.reset(toolbar);
      var view = model.view;

      if(view) {
        this.updateToolbarPos(view.el);
      }
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
    var pos = this.canvas.getTargetToElementDim(toolbarEl, el, {
      elPos,
      event: 'toolbarPosUpdate',
    });
    var leftPos = pos.left + pos.elementWidth - pos.targetWidth;
    toolbarStyle.top = pos.top + unit;
    toolbarStyle.left = leftPos + unit;
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
    if(this.selEl)
      this.selEl.removeClass(this.hoverClass);
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
      var model = this.em.get('selectedComponent');

      if (model) {
        this.updateToolbarPos(model.view.el);
      }
    }
  },

  /**
   * Update attached elements, eg. component toolbar
   * @return {[type]} [description]
   */
  updateAttached() {
    var model = this.em.get('selectedComponent');
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
    if(model)
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
    if(!this.contWindow)
      this.contWindow = $(this.frameEl.contentWindow);
    return this.contWindow;
  },

  run(em) {
    if(em && em.get)
      this.editor = em.get('Editor');
    this.enable();
  },

  stop() {
    this.stopSelectComponent();
    this.cleanPrevious(this.em.get('selectedComponent'));
    this.clean();
    this.em.set('selectedComponent', null);
    this.toggleClipboard();
    this.hideBadge();
    this.hideFixedElementOffset();
    this.canvas.getToolbarEl().style.display = 'none';

    this.em.off('component:update', this.updateAttached, this);
    this.em.off('change:canvasOffset', this.updateAttached, this);
    this.em.off('change:selectedComponent', this.updateToolbar, this);
  }
};
