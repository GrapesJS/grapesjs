import _ from 'underscore';
import Backbone from 'backbone';
const SelectPosition = require('./SelectPosition');
const $ = Backbone.$;

module.exports = _.extend({}, SelectPosition, {
  init(opt) {
    _.bindAll(this, 'startDraw', 'draw', 'endDraw', 'rollback');
    this.config = opt || {};
    this.hType = this.config.newFixedH ? 'height' : 'min-height';
    this.allowDraw = 1;
  },

  /**
   * Start with enabling to select position and listening to start drawning
   * @private
   * */
  enable(...args) {
    SelectPosition.enable.apply(this, args);
    this.$wr.css('cursor', 'crosshair');
    if (this.allowDraw) this.$wr.on('mousedown', this.startDraw);
    this.ghost = this.canvas.getGhostEl();
  },

  /**
   * Start drawing component
   * @param   {Object} e  Event
   * @private
   * */
  startDraw(e) {
    e.preventDefault();
    this.stopSelectPosition();
    this.ghost.style.display = 'block';
    this.frameOff = this.getOffsetDim();
    this.startPos = {
      top: e.pageY + this.frameOff.top,
      left: e.pageX + this.frameOff.left
    };
    this.isDragged = false;
    this.tempComponent = { style: {} };
    this.beforeDraw(this.tempComponent);
    this.updateSize(this.startPos.top, this.startPos.left, 0, 0);
    this.toggleEvents(1);
  },

  /**
   * Enable/Disable events
   * @param {Boolean} enable
   */
  toggleEvents(enable) {
    var method = enable ? 'on' : 'off';
    this.$wr[method]('mousemove', this.draw);
    this.$wr[method]('mouseup', this.endDraw);
    this.$canvas[method]('mousemove', this.draw);
    $(document)[method]('mouseup', this.endDraw);
    $(document)[method]('keypress', this.rollback);
  },

  /**
   * While drawing the component
   * @param   {Object}  e  Event
   * @private
   * */
  draw(e) {
    this.isDragged = true;
    this.updateComponentSize(e);
  },

  /**
   * End drawing component
   * @param   {Object}  e Event
   * @private
   * */
  endDraw(e) {
    this.toggleEvents();
    var model = {};
    // Only if the mouse was moved
    if (this.isDragged) {
      this.updateComponentSize(e);
      this.setRequirements(this.tempComponent);
      var lp = this.sorter.lastPos;
      model = this.create(
        this.sorter.target,
        this.tempComponent,
        lp.index,
        lp.method
      );
      this.sorter.prevTarget = null;
    }
    this.ghost.style.display = 'none';
    this.startSelectPosition();
    this.afterDraw(model);
  },

  /**
   * Create new component inside the target
   * @param  {Object} target Tha target collection
   * @param {Object} component New component to create
   * @param {number} index Index inside the collection, 0 if no children inside
   * @param {string} method Before or after of the children
   * @param {Object} opts Options
   */
  create(target, component, index, method, opts) {
    index = method === 'after' ? index + 1 : index;
    var opt = opts || {};
    var $trg = $(target);
    var trgModel = $trg.data('model');
    var trgCollection = $trg.data('collection');
    var droppable = trgModel ? trgModel.get('droppable') : 1;
    opt.at = index;
    if (trgCollection && droppable) return trgCollection.add(component, opt);
    else console.warn('Invalid target position');
  },

  /**
   * Check and set basic requirements for the component
   * @param   {Object}  component  New component to be created
   * @return   {Object}   Component updated
   * @private
   * */
  setRequirements(component) {
    var c = this.config;
    var compStl = component.style;
    // Check min width
    if (compStl.width.replace(/\D/g, '') < c.minComponentW)
      compStl.width = c.minComponentW + 'px';
    // Check min height
    if (compStl[this.hType].replace(/\D/g, '') < c.minComponentH)
      compStl[this.hType] = c.minComponentH + 'px';
    // Set overflow in case of fixed height
    if (c.newFixedH) compStl.overflow = 'auto';
    if (!this.absoluteMode) {
      delete compStl.left;
      delete compStl.top;
    } else compStl.position = 'absolute';
    var lp = this.sorter.lastPos;

    if (this.nearFloat(lp.index, lp.method, this.sorter.lastDims))
      compStl.float = 'left';

    if (
      this.config.firstCentered &&
      this.getCanvasWrapper() == this.sorter.target
    ) {
      compStl.margin = '0 auto';
    }

    return component;
  },

  /**
   * Update new component size while drawing
   * @param   {Object}   e  Event
   * @private
   * */
  updateComponentSize(e) {
    var y = e.pageY + this.frameOff.top;
    var x = e.pageX + this.frameOff.left;
    var start = this.startPos;
    var top = start.top;
    var left = start.left;
    var height = y - top;
    var width = x - left;
    if (x < left) {
      left = x;
      width = start.left - x;
    }
    if (y < top) {
      top = y;
      height = start.top - y;
    }
    this.updateSize(top, left, width, height);
  },

  /**
   * Update size
   * @private
   */
  updateSize(top, left, width, height) {
    var u = 'px';
    var ghStl = this.ghost.style;
    var compStl = this.tempComponent.style;
    ghStl.top = compStl.top = top + u;
    ghStl.left = compStl.left = left + u;
    ghStl.width = compStl.width = width + u;
    ghStl[this.hType] = compStl[this.hType] = height + u;
  },

  /**
   * Used to bring the previous situation before event started
   * @param   {Object}  e    Event
   * @param   {Boolean}   forse  Indicates if rollback in anycase
   * @private
   * */
  rollback(e, force) {
    var key = e.which || e.keyCode;
    if (key == this.config.ESCAPE_KEY || force) {
      this.isDragged = false;
      this.endDraw();
    }
    return;
  },

  /**
   * This event is triggered at the beginning of a draw operation
   * @param   {Object}  component  Object component before creation
   * @private
   * */
  beforeDraw(component) {
    component.editable = false; //set this component editable
  },

  /**
   * This event is triggered at the end of a draw operation
   * @param   {Object}  model  Component model created
   * @private
   * */
  afterDraw(model) {},

  run(editor, sender, opts) {
    this.editor = editor;
    this.sender = sender;
    this.$wr = this.$wrapper;
    this.enable();
  },

  stop() {
    this.stopSelectPosition();
    this.$wrapper.css('cursor', '');
    this.$wrapper.unbind();
  }
});
