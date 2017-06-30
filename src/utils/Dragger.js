var getBoundingRect = (el, win) => {
  var w = win || window;
  var rect = el.getBoundingClientRect();
  return {
    left: rect.left + w.pageXOffset,
    top: rect.top + w.pageYOffset,
    width: rect.width,
    height: rect.height
  };
};

module.exports = {

  // TODO move to opts
  setKey(keys, command) {
    //key(keys, command);
  },

  /**
   * Return element position
   * @param  {HTMLElement} el
   * @return {Object}
   */
  getElementRect(el) {
    var posFetcher = this.opts.posFetcher || '';
    return posFetcher ? posFetcher(el, {
      avoidFrameOffset: 1,
    }) : getBoundingRect(el);
  },

  /**
   * Init the resizer
   * @param  {Object} opts
   */
  init(opts) {
    this.setOptions(opts);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.drag = this.drag.bind(this);
    this.move = this.move.bind(this);
    this.stop = this.stop.bind(this);
    this.setKey('up, right, down, left', this.handleKey);
    return this;
  },

  /**
   * Update options
   * @param {Object} options
   */
  setOptions(opts) {
    this.opts = opts || {};
  },

  /**
   * Focus dragger on the element
   * @param {HTMLElement} el
   */
  focus(el) {
    // Avoid focusing on already focused element
    if (el && el === this.el) {
      return;
    }

    this.getDocumentEl(el);
    this.blur();
    this.el = el;
    this.handlers = this.opts.dragHandlers || [el];


    var elRect = this.getElementRect(el); //<-- TODO have wrong top:left
    this.elRect = elRect;
    this.startTop = elRect.top;
    this.startLeft = elRect.left;

    // TODO init snapper

		this.getDocumentEl().on('mousedown', this.handleMouseDown);
  },

  /**
   * Blur from the focused element
   */
  blur() {
    this.getDocumentEl().off('mousedown', this.handleMouseDown);
    this.el = null;
  },

  /**
   * Start dragging
   * @param  {Event} e
   */
  start(e) {
    this.startPos = this.getMousePos(e);
    var docs = this.getDocumentEl();
    docs.on('mousemove', this.drag);
    docs.on('mouseup', this.stop);

    // Start callback
    var onStart = this.opts.onStart;
    if(typeof onStart === 'function') {
      onStart(e, {
        docs,
        el: this.el,
        start: this.startPos,
        elRect: this.elRect,
      });
    }

    this.drag(e);
  },

  /**
   * Stop dragging
   */
  stop(e) {
    var docs = this.getDocumentEl();
    docs.off('mousemove', this.drag);
    docs.off('mouseup', this.stop);
    this.lockedAxis = null;

    // Stop callback
    var onEnd = this.opts.onEnd;
    if(typeof onEnd === 'function') {
      onEnd(e, {
        docs,
        delta: this.delta,
        end: {
          x: this.startLeft + this.delta.x,
          y: this.startTop + this.delta.y,
        }
      });
    }
  },

  /**
   * Handle mousedown to check if it's possible to drag
   * @param  {Event} e
   */
  handleMouseDown(e) {
    var el = e.target;
    if (this.isHandler(el)) {
      this.start(e);
    }
  },

  /**
   * Detects if the clicked element is a valid handler
   * @param  {HTMLElement} el
   * @return {Boolean}
   */
  isHandler(el) {
    var handlers = this.handlers;

    for (var n in handlers) {
      if (handlers[n] === el) return true;
    }

    return false;
  },

  /**
   * Handle key press
   * @param  {Event} e
   * @param  {Object} handler
   */
  handleKey(e, handler) {
    switch (handler.shortcut) {
      case 'up':
        this.move(0, -1);
        break;
      case 'right':
        this.move(1, 0);
        break;
      case 'down':
        this.move(0, 1);
        break;
      case 'left':
        this.move(-1, 0);
        break;
    }
  },

  /**
   * Returns documents
   */
  getDocumentEl(el) {
    var el = el || this.el;
    if (!this.$doc) {
      var docs = [document];
      if (el) {
        docs.push(el.ownerDocument);
      }
      this.$doc = $(docs);
    }
    return this.$doc;
  },

  /**
   * Get mouse coordinates
   * @param  {Event} event
   * @return {Object}
   */
  getMousePos(e) {
    var mouseFetch = this.opts.mousePosFetcher;
    return mouseFetch ? mouseFetch(e) : {
      x: e.clientX,
      y: e.clientY
    };
  },

  /**
   * Drag event
   * @param  {Event} event
   */
  drag(e) {
    var lockedAxis = this.lockedAxis;
    var currentPos = this.getMousePos(e);
    var delta = {
      x: currentPos.x - this.startPos.x,
      y: currentPos.y - this.startPos.y
    };
    // Lock one axis
    if (e.shiftKey) {
      if (!lockedAxis) {
        var relX = delta.x;
        var relY = delta.y;
        var absX = Math.abs(relX);
        var absY = Math.abs(relY);

        // Vertical or Horizontal lock
        if (relY >= absX || relY <= -absX) {
          lockedAxis = 'x';
        } else if (relX > absY || relX < -absY) {
          lockedAxis = 'y';
        }
      }
    } else {
      lockedAxis = null;
    }

    if (lockedAxis === 'x') {
      delta.x = this.startPos.x;
    }

    if (lockedAxis === 'y') {
      delta.y = this.startPos.y;
    }

    this.lockedAxis = lockedAxis;
    this.delta = delta;
    this.move(delta.x, delta.y);

    // Drag callback
    const onDrag = this.opts.onDrag;
    if(typeof onDrag === 'function') {
      onDrag(e, {
        delta,
        current: {
          x: this.startLeft + delta.x,
          y: this.startTop + delta.y
        },
        lockedAxis
      });
    }

    // In case the mouse button was released outside of the window
    if (e.which === 0) {
      this.stop(e);
    }
  },

  /**
   * Move the element
   * @param  {integer} x
   * @param  {integer} y
   */
  move: function(x, y) {
    this.moveX(x);
    this.moveY(y);
  },

  /**
   * Move in x direction
   * @param  {integer} x
   */
  moveX(x) {
    var el = this.el;
    var opts = this.opts;
    var xPos = this.startLeft + x;
    const setX = this.opts.setX;

    if (typeof setX === 'function') {
      setX(xPos, {
        el,
        start: this.startLeft,
        delta: x,
      });
    } else {
      el.style.left =  xPos + 'px';
    }
  },

  /**
   * Move in y direction
   * @param  {integer} y
   */
  moveY(y) {
    var el = this.el;
    var opts = this.opts;
    var yPos = this.startTop + y;
    const setY = this.opts.setY;

    if (typeof setY === 'function') {
      setY(yPos, {
        el,
        start: this.startTop,
        delta: y,
      });
    } else {
      el.style.top =  yPos + 'px';
    }
  },

};
