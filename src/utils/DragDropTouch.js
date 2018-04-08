var DragDropTouch;
(function(DragDropTouch_1) {
  'use strict';
  /**
   * Object used to hold the data that is being dragged during drag and drop operations.
   *
   * It may hold one or more data items of different types. For more information about
   * drag and drop operations and data transfer objects, see
   * <a href="https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer">HTML Drag and Drop API</a>.
   *
   * This object is created automatically by the @see:DragDropTouch singleton and is
   * accessible through the @see:dataTransfer property of all drag events.
   */
  var DataTransfer = (function() {
    function DataTransfer() {
      this._dropEffect = 'move';
      this._effectAllowed = 'all';
      this._data = {};
    }
    Object.defineProperty(DataTransfer.prototype, 'dropEffect', {
      /**
       * Gets or sets the type of drag-and-drop operation currently selected.
       * The value must be 'none',  'copy',  'link', or 'move'.
       */
      get: function() {
        return this._dropEffect;
      },
      set: function(value) {
        this._dropEffect = value;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DataTransfer.prototype, 'effectAllowed', {
      /**
       * Gets or sets the types of operations that are possible.
       * Must be one of 'none', 'copy', 'copyLink', 'copyMove', 'link',
       * 'linkMove', 'move', 'all' or 'uninitialized'.
       */
      get: function() {
        return this._effectAllowed;
      },
      set: function(value) {
        this._effectAllowed = value;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(DataTransfer.prototype, 'types', {
      /**
       * Gets an array of strings giving the formats that were set in the @see:dragstart event.
       */
      get: function() {
        return Object.keys(this._data);
      },
      enumerable: true,
      configurable: true
    });
    /**
     * Removes the data associated with a given type.
     *
     * The type argument is optional. If the type is empty or not specified, the data
     * associated with all types is removed. If data for the specified type does not exist,
     * or the data transfer contains no data, this method will have no effect.
     *
     * @param type Type of data to remove.
     */
    DataTransfer.prototype.clearData = function(type) {
      if (type != null) {
        delete this._data[type];
      } else {
        this._data = null;
      }
    };
    /**
     * Retrieves the data for a given type, or an empty string if data for that type does
     * not exist or the data transfer contains no data.
     *
     * @param type Type of data to retrieve.
     */
    DataTransfer.prototype.getData = function(type) {
      return this._data[type] || '';
    };
    /**
     * Set the data for a given type.
     *
     * For a list of recommended drag types, please see
     * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Recommended_Drag_Types.
     *
     * @param type Type of data to add.
     * @param value Data to add.
     */
    DataTransfer.prototype.setData = function(type, value) {
      this._data[type] = value;
    };
    /**
     * Set the image to be used for dragging if a custom one is desired.
     *
     * @param img An image element to use as the drag feedback image.
     * @param offsetX The horizontal offset within the image.
     * @param offsetY The vertical offset within the image.
     */
    DataTransfer.prototype.setDragImage = function(img, offsetX, offsetY) {
      var ddt = DragDropTouch._instance;
      ddt._imgCustom = img;
      ddt._imgOffset = { x: offsetX, y: offsetY };
    };
    return DataTransfer;
  })();
  DragDropTouch_1.DataTransfer = DataTransfer;
  /**
   * Defines a class that adds support for touch-based HTML5 drag/drop operations.
   *
   * The @see:DragDropTouch class listens to touch events and raises the
   * appropriate HTML5 drag/drop events as if the events had been caused
   * by mouse actions.
   *
   * The purpose of this class is to enable using existing, standard HTML5
   * drag/drop code on mobile devices running IOS or Android.
   *
   * To use, include the DragDropTouch.js file on the page. The class will
   * automatically start monitoring touch events and will raise the HTML5
   * drag drop events (dragstart, dragenter, dragleave, drop, dragend) which
   * should be handled by the application.
   *
   * For details and examples on HTML drag and drop, see
   * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Drag_operations.
   */
  var DragDropTouch = (function() {
    /**
     * Initializes the single instance of the @see:DragDropTouch class.
     */
    function DragDropTouch() {
      this._lastClick = 0;
      // enforce singleton pattern
      if (DragDropTouch._instance) {
        throw 'DragDropTouch instance already created.';
      }
      // detect passive event support
      // https://github.com/Modernizr/Modernizr/issues/1894
      var supportsPassive = false;
      document.addEventListener('test', function() {}, {
        get passive() {
          supportsPassive = true;
          return true;
        }
      });
      // listen to touch events
      if ('ontouchstart' in document) {
        var d = document,
          ts = this._touchstart.bind(this),
          tm = this._touchmove.bind(this),
          te = this._touchend.bind(this),
          opt = supportsPassive ? { passive: false, capture: false } : false;
        d.addEventListener('touchstart', ts, opt);
        d.addEventListener('touchmove', tm, opt);
        d.addEventListener('touchend', te);
        d.addEventListener('touchcancel', te);
      }
    }
    /**
     * Gets a reference to the @see:DragDropTouch singleton.
     */
    DragDropTouch.getInstance = function() {
      return DragDropTouch._instance;
    };
    // ** event handlers
    DragDropTouch.prototype._touchstart = function(e) {
      var _this = this;
      if (this._shouldHandle(e)) {
        // raise double-click and prevent zooming
        if (Date.now() - this._lastClick < DragDropTouch._DBLCLICK) {
          if (this._dispatchEvent(e, 'dblclick', e.target)) {
            e.preventDefault();
            this._reset();
            return;
          }
        }
        // clear all variables
        this._reset();
        // get nearest draggable element
        var src = this._closestDraggable(e.target);
        if (src) {
          // give caller a chance to handle the hover/move events
          if (
            !this._dispatchEvent(e, 'mousemove', e.target) &&
            !this._dispatchEvent(e, 'mousedown', e.target)
          ) {
            // get ready to start dragging
            this._dragSource = src;
            this._ptDown = this._getPoint(e);
            this._lastTouch = e;
            e.preventDefault();
            // show context menu if the user hasn't started dragging after a while
            setTimeout(function() {
              if (_this._dragSource == src && _this._img == null) {
                if (_this._dispatchEvent(e, 'contextmenu', src)) {
                  _this._reset();
                }
              }
            }, DragDropTouch._CTXMENU);
          }
        }
      }
    };
    DragDropTouch.prototype._touchmove = function(e) {
      if (this._shouldHandle(e)) {
        var target = this._getTarget(e);
        // start dragging
        if (this._dragSource && !this._img) {
          var delta = this._getDelta(e);
          if (delta > DragDropTouch._THRESHOLD) {
            this._dispatchEvent(e, 'dragstart', this._dragSource);
            this._createImage(e);
            this._dispatchEvent(e, 'dragenter', target);
          }
        }
        // continue dragging
        if (this._img) {
          this._lastTouch = e;
          e.preventDefault(); // prevent scrolling
          if (target != this._lastTarget) {
            this._dispatchEvent(this._lastTouch, 'dragleave', this._lastTarget);
            this._dispatchEvent(e, 'dragenter', target);
            this._lastTarget = target;
          }
          this._moveImage(e);
          this._dispatchEvent(e, 'dragover', target);
        }
        // see if target wants to handle move
        if (this._dispatchEvent(e, 'mousemove', target)) {
          this._lastTouch = e;
          e.preventDefault();
          return;
        }
      }
    };
    DragDropTouch.prototype._touchend = function(e) {
      if (this._shouldHandle(e)) {
        // finish dragging
        this._destroyImage();
        if (this._dragSource) {
          if (e.type.indexOf('cancel') < 0) {
            this._dispatchEvent(this._lastTouch, 'drop', this._lastTarget);
          }
          this._dispatchEvent(this._lastTouch, 'dragend', this._dragSource);
          this._reset();
          // prevent mouse up on drag
          e.preventDefault();
          return;
        }
        // see if target wants to handle up
        if (this._dispatchEvent(this._lastTouch, 'mouseup', e.target)) {
          e.preventDefault();
          return;
        }
        // user clicked the element but didn't drag, so clear the source and simulate a click
        if (!this._img) {
          this._dragSource = null;
          this._dispatchEvent(this._lastTouch, 'click', e.target);
          this._lastClick = Date.now();
        }
      }
    };
    // ** utilities
    // ignore events that have been handled or that involve more than one touch
    DragDropTouch.prototype._shouldHandle = function(e) {
      return e && !e.defaultPrevented && e.touches && e.touches.length < 2;
    };
    // clear all members
    DragDropTouch.prototype._reset = function() {
      this._destroyImage();
      this._dragSource = null;
      this._lastTouch = null;
      this._lastTarget = null;
      this._ptDown = null;
      this._dataTransfer = new DataTransfer();
    };
    // get point for a touch event
    DragDropTouch.prototype._getPoint = function(e, page) {
      if (e && e.touches) {
        e = e.touches[0];
      }
      return { x: page ? e.pageX : e.clientX, y: page ? e.pageY : e.clientY };
    };
    // get distance between the current touch event and the first one
    DragDropTouch.prototype._getDelta = function(e) {
      var p = this._getPoint(e);
      return Math.abs(p.x - this._ptDown.x) + Math.abs(p.y - this._ptDown.y);
    };
    // get the element at a given touch event
    DragDropTouch.prototype._getTarget = function(e) {
      var pt = this._getPoint(e),
        el = document.elementFromPoint(pt.x, pt.y);
      // if target element is an iframe, try propagating event to child element
      if (el && el.nodeName === 'IFRAME') {
        try {
          var iframeDocument = el.contentWindow.document;
          // get iframe absolute offset
          var iframeAbsoluteOffset = { x: 0, y: 0 };
          do {
            iframeAbsoluteOffset.x += el.offsetLeft || 0;
            iframeAbsoluteOffset.y += el.offsetTop || 0;
            el = el.offsetParent;
          } while (el);
          // remove iframe absolute offset from touch position
          var x = pt.x - iframeAbsoluteOffset.x,
            y = pt.y - iframeAbsoluteOffset.y;
          // get element on that position from iframe document
          el = iframeDocument.elementFromPoint(x, y);
        } catch (e) {
          // iframe origin don't allow access
        }
      }
      while (el && getComputedStyle(el).pointerEvents == 'none') {
        el = el.parentElement;
      }
      return el;
    };
    // create drag image from source element
    DragDropTouch.prototype._createImage = function(e) {
      // just in case...
      if (this._img) {
        this._destroyImage();
      }
      // create drag image from custom element or drag source
      var src = this._imgCustom || this._dragSource;
      this._img = src.cloneNode(true);
      this._copyStyle(src, this._img);
      this._img.style.top = this._img.style.left = '-9999px';
      // if creating from drag source, apply offset and opacity
      if (!this._imgCustom) {
        var rc = src.getBoundingClientRect(),
          pt = this._getPoint(e);
        this._imgOffset = { x: pt.x - rc.left, y: pt.y - rc.top };
        this._img.style.opacity = DragDropTouch._OPACITY.toString();
      }
      // add image to document
      this._moveImage(e);
      document.body.appendChild(this._img);
    };
    // dispose of drag image element
    DragDropTouch.prototype._destroyImage = function() {
      if (this._img && this._img.parentElement) {
        this._img.parentElement.removeChild(this._img);
      }
      this._img = null;
      this._imgCustom = null;
    };
    // move the drag image element
    DragDropTouch.prototype._moveImage = function(e) {
      var _this = this;
      requestAnimationFrame(function() {
        if (_this._img) {
          var pt = _this._getPoint(e, true),
            s = _this._img.style;
          s.position = 'absolute';
          s.pointerEvents = 'none';
          s.zIndex = '999999';
          s.left = Math.round(pt.x - _this._imgOffset.x) + 'px';
          s.top = Math.round(pt.y - _this._imgOffset.y) + 'px';
        }
      });
    };
    // copy properties from an object to another
    DragDropTouch.prototype._copyProps = function(dst, src, props) {
      for (var i = 0; i < props.length; i++) {
        var p = props[i];
        dst[p] = src[p];
      }
    };
    DragDropTouch.prototype._copyStyle = function(src, dst) {
      // remove potentially troublesome attributes
      DragDropTouch._rmvAtts.forEach(function(att) {
        dst.removeAttribute(att);
      });
      // copy canvas content
      if (src instanceof HTMLCanvasElement) {
        var cSrc = src,
          cDst = dst;
        cDst.width = cSrc.width;
        cDst.height = cSrc.height;
        cDst.getContext('2d').drawImage(cSrc, 0, 0);
      }
      // copy style (without transitions)
      var cs = getComputedStyle(src);
      for (var i = 0; i < cs.length; i++) {
        var key = cs[i];
        if (key.indexOf('transition') < 0) {
          dst.style[key] = cs[key];
        }
      }
      dst.style.pointerEvents = 'none';
      // and repeat for all children
      for (var i = 0; i < src.children.length; i++) {
        this._copyStyle(src.children[i], dst.children[i]);
      }
    };
    DragDropTouch.prototype._dispatchEvent = function(e, type, target) {
      if (e && target) {
        var evt = document.createEvent('Event'),
          t = e.touches ? e.touches[0] : e;
        evt.initEvent(type, true, true);
        evt.button = 0;
        evt.which = evt.buttons = 1;
        this._copyProps(evt, e, DragDropTouch._kbdProps);
        this._copyProps(evt, t, DragDropTouch._ptProps);
        evt.dataTransfer = this._dataTransfer;
        target.dispatchEvent(evt);
        return evt.defaultPrevented;
      }
      return false;
    };
    // gets an element's closest draggable ancestor
    DragDropTouch.prototype._closestDraggable = function(e) {
      for (; e; e = e.parentElement) {
        if (e.hasAttribute('draggable') && e.draggable) {
          return e;
        }
      }
      return null;
    };
    return DragDropTouch;
  })();
  /*private*/ DragDropTouch._instance = new DragDropTouch(); // singleton
  // constants
  DragDropTouch._THRESHOLD = 5; // pixels to move before drag starts
  DragDropTouch._OPACITY = 0.5; // drag image opacity
  DragDropTouch._DBLCLICK = 500; // max ms between clicks in a double click
  DragDropTouch._CTXMENU = 900; // ms to hold before raising 'contextmenu' event
  // copy styles/attributes from drag source to drag image element
  DragDropTouch._rmvAtts = 'id,class,style,draggable'.split(',');
  // synthesize and dispatch an event
  // returns true if the event has been handled (e.preventDefault == true)
  DragDropTouch._kbdProps = 'altKey,ctrlKey,metaKey,shiftKey'.split(',');
  DragDropTouch._ptProps = 'pageX,pageY,clientX,clientY,screenX,screenY'.split(
    ','
  );
  DragDropTouch_1.DragDropTouch = DragDropTouch;
})(DragDropTouch || (DragDropTouch = {}));
