var Backbone = require('backbone');
var SelectComponent = require('./SelectComponent');
var SelectPosition = require('./SelectPosition');

module.exports = _.extend({}, SelectPosition, SelectComponent, {

  init(o) {
    SelectComponent.init.apply(this, arguments);
    _.bindAll(this, 'initSorter','rollback', 'onEndMove');
    this.opt = o;
    this.hoverClass  = this.ppfx + 'highlighter-warning';
    this.badgeClass  = this.ppfx + 'badge-warning';
    this.noSelClass  = this.ppfx + 'no-select';
  },

  enable(...args) {
    SelectComponent.enable.apply(this, args);
    this.getBadgeEl().addClass(this.badgeClass);
    this.getHighlighterEl().addClass(this.hoverClass);
    var wp = this.$wrapper;
    wp.css('cursor','move');
    wp.on('mousedown', this.initSorter);

    // Avoid strange moving behavior
    wp.addClass(this.noSelClass);
  },

  /**
   * Overwrite for doing nothing
   * @private
   */
  toggleClipboard() {},

  /**
   * Delegate sorting
   * @param  {Event} e
   * @private
   * */
  initSorter(e) {
    var el = $(e.target).data('model');
    var drag = el.get('draggable');
    if(!drag)
      return;

    // Avoid badge showing on move
    this.cacheEl = null;
    this.startSelectPosition(e.target, this.frameEl.contentDocument);
    this.sorter.draggable = drag;
    this.sorter.onEndMove = this.onEndMove.bind(this);
    this.stopSelectComponent();
    this.$wrapper.off('mousedown', this.initSorter);
    this.getContentWindow().on('keydown', this.rollback);
  },

  /**
   * Init sorter from model
   * @param  {Object} model
   * @private
   */
  initSorterFromModel(model) {
    var drag = model.get('draggable');
    if(!drag)
      return;
    // Avoid badge showing on move
    this.cacheEl = null;
    var el = model.view.el;
    this.startSelectPosition(el, this.frameEl.contentDocument);
    this.sorter.draggable = drag;
    this.sorter.onEndMove = this.onEndMoveFromModel.bind(this);

    /*
    this.sorter.setDragHelper(el);
    var dragHelper = this.sorter.dragHelper;
    dragHelper.className = this.ppfx + 'drag-helper';
    dragHelper.innerHTML = '';
    dragHelper.backgroundColor = 'white';
    */

    this.stopSelectComponent();
    this.getContentWindow().on('keydown', this.rollback);
  },

  onEndMoveFromModel() {
    this.getContentWindow().off('keydown', this.rollback);
  },

  /**
   * Callback after sorting
   * @private
   */
  onEndMove() {
    this.enable();
    this.getContentWindow().off('keydown', this.rollback);
  },

  /**
   * Say what to do after the component was selected (selectComponent)
   * @param {Event} e
   * @param {Object} Selected element
   * @private
   * */
  onSelect(e, el) {},

  /**
   * Used to bring the previous situation before start moving the component
   * @param {Event} e
   * @param {Boolean} Indicates if rollback in anycase
   * @private
   * */
  rollback(e, force) {
    var key = e.which || e.keyCode;
    if(key == this.opt.ESCAPE_KEY || force){
      this.sorter.moved = false;
      this.sorter.endMove();
    }
    return;
  },

  /**
   * Returns badge element
   * @return {HTMLElement}
   * @private
   */
  getBadgeEl() {
    if(!this.$badge)
      this.$badge = $(this.getBadge());
    return this.$badge;
  },

  /**
   * Returns highlighter element
   * @return {HTMLElement}
   * @private
   */
  getHighlighterEl() {
    if(!this.$hl)
      this.$hl = $(this.canvas.getHighlighter());
    return this.$hl;
  },

  stop(...args) {
    SelectComponent.stop.apply(this, args);
    this.getBadgeEl().removeClass(this.badgeClass);
    this.getHighlighterEl().removeClass(this.hoverClass);
    var wp = this.$wrapper;
    wp.css('cursor', '').unbind().removeClass(this.noSelClass);
  }
});
