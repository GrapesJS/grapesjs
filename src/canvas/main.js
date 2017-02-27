define(function(require) {

  return function() {
    var c = {},
    defaults = require('./config/config'),
    Canvas = require('./model/Canvas'),
    CanvasView = require('./view/CanvasView');
    var canvas;

    return {

      /**
       * Used inside RTE
       * @private
       */
      getCanvasView: function() {
        return CanvasView;
      },

      /**
       * Name of the module
       * @type {String}
       * @private
       */
      name: 'Canvas',

      /**
       * Initialize module. Automatically called with a new instance of the editor
       * @param {Object} config Configurations
       */
      init: function(config) {
        c = config || {};
        for (var name in defaults) {
          if (!(name in c))
            c[name] = defaults[name];
        }

        var ppfx = c.pStylePrefix;
        if(ppfx)
          c.stylePrefix = ppfx + c.stylePrefix;

        canvas = new Canvas(config);
        CanvasView	= new CanvasView({
          model: canvas,
          config: c,
        });

        var cm = c.em.get('DomComponents');
        if(cm)
          this.setWrapper(cm);

        return this;
      },

      /**
       * Add wrapper
       * @param	{Object}	wrp Wrapper
       *
       * */
      setWrapper: function(wrp) {
        canvas.set('wrapper', wrp);
      },

      /**
       * Returns canvas element
       * @return {HTMLElement}
       */
      getElement: function(){
        return CanvasView.el;
      },

      /**
       * Returns frame element of the canvas
       * @return {HTMLElement}
       */
      getFrameEl: function(){
        return CanvasView.frame.el;
      },

      /**
       * Returns body element of the frame
       * @return {HTMLElement}
       */
      getBody: function(){
        return CanvasView.frame.el.contentDocument.body;
      },

      /**
       * Returns body wrapper element of the frame
       * @return {HTMLElement}
       */
      getWrapperEl: function(){
        return this.getBody().querySelector('#wrapper');
      },

      /**
       * Returns element containing canvas tools
       * @return {HTMLElement}
       */
      getToolsEl: function(){
        return CanvasView.toolsEl;
      },

      /**
       * Returns highlighter element
       * @return {HTMLElement}
       */
      getHighlighter: function(){
        return CanvasView.hlEl;
      },

      /**
       * Returns badge element
       * @return {HTMLElement}
       */
      getBadgeEl: function(){
        return CanvasView.badgeEl;
      },

      /**
       * Returns placer element
       * @return {HTMLElement}
       */
      getPlacerEl: function(){
        return CanvasView.placerEl;
      },

      /**
       * Returns ghost element
       * @return {HTMLElement}
       * @private
       */
      getGhostEl: function(){
        return CanvasView.ghostEl;
      },

      /**
       * Returns toolbar element
       * @return {HTMLElement}
       */
      getToolbarEl: function() {
        return CanvasView.toolbarEl;
      },

      /**
       * Returns resizer element
       * @return {HTMLElement}
       */
      getResizerEl: function() {
        return CanvasView.resizerEl;
      },

      /**
       * Returns offset viewer element
       * @return {HTMLElement}
       */
      getOffsetViewerEl: function() {
        return CanvasView.offsetEl;
      },

      /**
       * Returns fixed offset viewer element
       * @return {HTMLElement}
       */
      getFixedOffsetViewerEl: function() {
        return CanvasView.fixedOffsetEl;
      },

      /**
       * Render canvas
       * */
      render: function() {
        return CanvasView.render().el;
      },

      /**
       * Get frame position
       * @return {Object}
       * @private
       */
      getOffset: function() {
        var frameOff = this.offset(this.getFrameEl());
        var canvasOff = this.offset(this.getElement());
        return {
          top: frameOff.top - canvasOff.top,
          left: frameOff.left - canvasOff.left
        };
      },

      /**
      * Get the offset of the element
      * @param  {HTMLElement} el
      * @return {Object}
      * @private
      */
      offset: function(el){
        var rect = el.getBoundingClientRect();
        return {
          top: rect.top + document.body.scrollTop,
          left: rect.left + document.body.scrollLeft
        };
      },

      /**
       * Get element position relative to the canvas
       * @param {HTMLElement} el
       * @return {Object}
       */
      getElementPos: function(el) {
        return CanvasView.getElementPos(el);
      },

      /**
       * This method comes handy when you need to attach something like toolbars
       * to elements inside the canvas, dealing with all relative position,
       * offsets, etc. and returning as result the object with positions which are
       * viewable by the user (when the canvas is scrolled the top edge of the element
       * is not viewable by the user anymore so the new top edge is the one of the canvas)
       *
       * The target should be visible before being passed here as invisible elements
       * return empty string as width
       * @param {HTMLElement} target The target in this case could be the toolbar
       * @param {HTMLElement} element The element on which I'd attach the toolbar
       * @param {Object} options Custom options
       * @param {Boolean} options.toRight Set to true if you want the toolbar attached to the right
       * @return {Object}
       */
      getTargetToElementDim: function (target, element, options) {
        var opts = options || {};
        var canvasPos = CanvasView.getPosition();
        var pos = opts.elPos || CanvasView.getElementPos(element);
        var toRight = options.toRight || 0;
        var targetHeight = opts.targetHeight || target.offsetHeight;
        var targetWidth = opts.targetWidth || target.offsetWidth;
        var eventToTrigger = opts.event || null;

        var elTop = pos.top - targetHeight;
        var elLeft = pos.left;
        elLeft += toRight ? pos.width : 0;
        elLeft = toRight ? (elLeft - targetWidth) : elLeft;

        var leftPos = elLeft < canvasPos.left ? canvasPos.left : elLeft;
        var topPos = elTop < canvasPos.top ? canvasPos.top : elTop;
        topPos = topPos > (pos.top + pos.height) ? (pos.top + pos.height) : topPos;

        var result = {
          top: topPos,
          left: leftPos,
          elementTop: pos.top,
          elementLeft: pos.left,
          elementWidth: pos.width,
          elementHeight: pos.height,
          targetWidth: target.offsetWidth,
          targetHeight: target.offsetHeight,
          canvasTop: canvasPos.top,
          canvasLeft: canvasPos.left,
        };

        // In this way I can catch data and also change the position strategy
        if(eventToTrigger && c.em) {
          c.em.trigger(eventToTrigger, result);
        }

        return result;
      },

      /**
       * Instead of simply returning e.clientX and e.clientY this function
       * calculates also the offset based on the canvas. This is helpful when you
       * need to get X and Y position while moving between the editor area and
       * canvas area, which is in the iframe
       * @param {Event} e
       * @return {Object}
       */
      getMouseRelativePos: function (e, options) {
        var opts = options || {};
        var addTop = 0;
        var addLeft = 0;
        var subWinOffset = opts.subWinOffset;
        var doc = e.target.ownerDocument;
        var win = doc.defaultView || doc.parentWindow;
        var frame = win.frameElement;
        var yOffset = subWinOffset ? win.pageYOffset : 0;
        var xOffset = subWinOffset ? win.pageXOffset : 0;

        if(frame) {
          var frameRect = frame.getBoundingClientRect(); // maybe to cache ?!?
          addTop = frameRect.top || 0;
          addLeft = frameRect.left || 0;
        }

        return {
          y: e.clientY + addTop - yOffset,
          x: e.clientX + addLeft - xOffset,
        };
      },

      /**
       * Returns wrapper element
       * @return {HTMLElement}
       * ????
       */
      getFrameWrapperEl: function(){
        return CanvasView.frame.getWrapper();
      },
    };
  };

});
