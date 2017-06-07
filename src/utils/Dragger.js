module.exports = {

  // TODO move to opts
  setKey(keys, command) {
    //key(keys, command);
  },

  /**
   * Init the resizer
   * @param  {Object} opts
   */
  init(opts) {
    this.opts = opts || {};
    setKey('up, right, down, left', this.handleKey);
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
   * Start to drag
   * @param  {HTMLElement} el Element to drag
   * @param  {Event} e
   */
  startToDrag(el, e) {
    e.stopPropagation();
    this.el = el;
    this.startPos = this.getMousePos(e);
    var doc = this.getDocumentEl();
    doc.on('mousemove', this.drag);
    doc.on('mouseup', this.stopToDrag);

    // TODO init snapper

    this.drag(event);
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
    // lock one axis
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
    this.move(delta.x, delta.y);
  },

  move: function(x, y) {
    this.moveX(x);
    this.moveY(y);
  },

  moveX(x) {
    var el = this.el;
    var opts = this.opts;
    el.style.left += x;
  },

  moveY(y) {
    var el = this.el;
    var opts = this.opts;
    el.style.top += y;
  },

  stopToDrag(event) {
    var doc = this.getDocumentEl();
    doc.off('mousemove', this.drag);
    doc.off('mouseup', this.stopToDrag);
    this.lockedAxis = null;
  },

};
