define(['backbone','./FrameView'],
function(Backbone, FrameView) {
  /**
   * @class CanvasView
   * */
  return Backbone.View.extend({

    initialize: function(o) {
      _.bindAll(this, 'renderBody', 'onFrameScroll', 'clearOff');
      this.config = o.config || {};
      this.em = this.config.em || {};
      this.ppfx  = this.config.pStylePrefix || '';
      this.className  = this.config.stylePrefix + 'canvas';
      this.listenTo(this.em, 'change:canvasOffset', this.clearOff);
      this.frame = new FrameView({
        model: this.model.get('frame'),
        config: this.config
      });
    },

    /**
     * Update tools position
     * @private
     */
    onFrameScroll: function(){
      var u = 'px';
      var body = this.frame.el.contentDocument.body;
      this.toolsEl.style.top = '-' + body.scrollTop + u;
      this.toolsEl.style.left = '-' + body.scrollLeft + u;
      this.em.trigger('canvasScroll');
    },

    /**
     * Insert scripts into head, it will call renderBody after all scripts loaded or failed
     * @private
     */
    renderScripts: function () {
        var frame = this.frame;
        var that = this;

        frame.el.onload = function () {
          var scripts = that.config.scripts.slice(0),  // clone
              counter = 0;

          function appendScript(scripts) {
            if (scripts.length > 0) {
              var script = document.createElement('script');
              script.type = 'text/javascript';
              script.src = scripts.shift();
              script.onerror = script.onload = appendScript.bind(null, scripts);
              frame.el.contentDocument.head.appendChild(script);
            } else {
              that.renderBody();
            }
          }
          appendScript(scripts);
        };
    },

    /**
     * Render inside frame's body
     * @private
     */
    renderBody: function() {
      var wrap = this.model.get('frame').get('wrapper');
      var em = this.config.em;
      if(wrap) {
        var ppfx = this.ppfx;
        var body = this.frame.$el.contents().find('body');
        var cssc = em.get('CssComposer');
        var conf = em.get('Config');
        body.append(wrap.render()).append(cssc.render());
        var protCss = conf.protectedCss;

        // I need all this styles to make the editor work properly
        var frameCss = '* {box-sizing: border-box;} body{margin:0;height:auto;background-color:#fff} #wrapper{min-height:100%; overflow:auto}' +
          '.' + ppfx + 'dashed :not([contenteditable]) > *{outline: 1px dashed rgba(170,170,170,0.7); outline-offset: -2px}' +
          '.' + ppfx + 'comp-selected{outline: 3px solid #3b97e3 !important}' +
          '.' + ppfx + 'no-select{user-select: none; -webkit-user-select:none; -moz-user-select: none}'+
          '.' + ppfx + 'freezed{opacity: 0.5; pointer-events: none}' +
          '.' + ppfx + 'no-pointer{pointer-events: none}' +
          '.' + ppfx + 'plh-image{background:#f5f5f5; border:none; height:50px; width:50px; display:block; outline:3px solid #ffca6f; cursor:pointer}' +
          '.' + ppfx + 'grabbing{cursor: grabbing; cursor: -webkit-grabbing}' +
          '* ::-webkit-scrollbar-track {background: rgba(0, 0, 0, 0.1)}' +
          '* ::-webkit-scrollbar-thumb {background: rgba(255, 255, 255, 0.2)}' +
          '* ::-webkit-scrollbar {width: 10px}' +
          (conf.canvasCss || '');
        frameCss += protCss || '';
        body.append('<style>' + frameCss + '</style>');
        body.append(this.getJsContainer());
        em.trigger('loaded');
        this.frame.el.contentWindow.onscroll = this.onFrameScroll;
        this.frame.udpateOffset();

        // When the iframe is focused the event dispatcher is not the same so
        // I need to delegate all events to the parent document
        var doc = document;
        var fdoc = this.frame.el.contentDocument;
        fdoc.addEventListener('keydown', function(e){
          doc.dispatchEvent(new KeyboardEvent(e.type, e));
        });
        fdoc.addEventListener('keyup', function(e){
          doc.dispatchEvent(new KeyboardEvent(e.type, e));
        });
      }
    },

    /**
     * Get the offset of the element
     * @param  {HTMLElement} el
     * @return {Object}
     */
    offset: function(el){
      var rect = el.getBoundingClientRect();
      var docBody = el.ownerDocument.body;
      return {
        top: rect.top + docBody.scrollTop,
        left: rect.left + docBody.scrollLeft
      };
    },

    /**
     * Cleare cached offsets
     * @private
     */
    clearOff: function(){
      this.frmOff = null;
      this.cvsOff = null;
    },

    /**
     * Return frame offset
     * @return {Object}
     * @private
     */
    getFrameOffset: function () {
      if(!this.frmOff)
        this.frmOff = this.offset(this.frame.el);
      return this.frmOff;
    },

    /**
     * Return canvas offset
     * @return {Object}
     * @private
     */
    getCanvasOffset: function () {
      if(!this.cvsOff)
        this.cvsOff = this.offset(this.el);
      return this.cvsOff;
    },

    /**
     * Returns element's data info
     * @param {HTMLElement} el
     * @return {Object}
     * @private
     */
    getElementPos: function(el) {
      var frmOff = this.getFrameOffset();
      var cvsOff = this.getCanvasOffset();
      var eo = this.offset(el);
      var top = eo.top + frmOff.top - cvsOff.top;
      var left = eo.left + frmOff.left - cvsOff.left;
      return {
        top: top,
        left: left,
        height: el.offsetHeight,
        width: el.offsetWidth
      };
    },

    /**
     * Returns position data of the canvas element
     * @return {Object} obj Position object
     * @private
     */
    getPosition: function() {
      var bEl = this.frame.el.contentDocument.body;
      var fo = this.getFrameOffset();
      var co = this.getCanvasOffset();
      return {
        top: fo.top + bEl.scrollTop - co.top,
        left: fo.left + bEl.scrollLeft - co.left
      };
    },

    /**
     * Update javascript of a specific component passed by its View
     * @param {View} view Component's View
     * @private
     */
    updateScript: function(view) {
      if(!view.scriptContainer) {
        view.scriptContainer = $('<div>');
        this.getJsContainer().append(view.scriptContainer.get(0));
      }

      var id = view.model.cid;
      var script = view.model.get('script');
      var scrStr = 'function(){' + script + '}';
      scrStr = typeof script == 'function' ? script.toString() : scrStr;

      view.el.id = id;
      view.scriptContainer.html('');

      view.scriptContainer.append('<script>' +
        'var item = document.getElementById("'+id+'");' +
        '(' + scrStr + '.bind(item))()</script>');
    },

    /**
     * Get javascript container
     * @private
     */
    getJsContainer: function () {
      if (!this.jsContainer) {
        this.jsContainer = $('<div>', {class: this.ppfx + 'js-cont'}).get(0);
      }
      return this.jsContainer;
    },


    render: function() {
      this.wrapper  = this.model.get('wrapper');

      if(this.wrapper && typeof this.wrapper.render == 'function'){
        this.model.get('frame').set('wrapper', this.wrapper);
        this.$el.append(this.frame.render().el);
        var frame = this.frame;
        if (this.config.scripts.length === 0) {
          frame.el.onload = this.renderBody;
        } else {
          this.renderScripts(); // will call renderBody later
        }
      }
      var ppfx = this.ppfx;
      toolsEl = $('<div>', { id: ppfx + 'tools' }).get(0);
      this.hlEl = $('<div>', { class: ppfx + 'highlighter' }).get(0);
      this.badgeEl = $('<div>', {class: ppfx + 'badge'}).get(0);
      this.placerEl = $('<div>', {class: ppfx + 'placeholder'}).get(0);
      this.placerIntEl = $('<div>', {class: ppfx + 'placeholder-int'}).get(0);
      this.ghostEl = $('<div>', {class: ppfx + 'ghost'}).get(0);
      this.toolbarEl = $('<div>', {class: ppfx + 'toolbar'}).get(0);
      this.resizerEl = $('<div>', {class: ppfx + 'resizer'}).get(0);
      this.offsetEl = $('<div>', {class: ppfx + 'offset-v'}).get(0);
      this.fixedOffsetEl = $('<div>', {class: ppfx + 'offset-fixed-v'}).get(0);
      this.placerEl.appendChild(this.placerIntEl);
      toolsEl.appendChild(this.hlEl);
      toolsEl.appendChild(this.badgeEl);
      toolsEl.appendChild(this.placerEl);
      toolsEl.appendChild(this.ghostEl);
      toolsEl.appendChild(this.toolbarEl);
      toolsEl.appendChild(this.resizerEl);
      toolsEl.appendChild(this.offsetEl);
      toolsEl.appendChild(this.fixedOffsetEl);
      this.$el.append(toolsEl);
      var rte = this.em.get('rte');

      if(rte)
        toolsEl.appendChild(rte.render());

      this.toolsEl = toolsEl;
      this.$el.attr({class: this.className});
      return this;
    },

  });
});
