import { extend, bindAll } from 'underscore';
import Backbone from 'backbone';
import { on, off } from 'utils/mixins';
import SelectComponent from './SelectComponent';
import SelectPosition from './SelectPosition';

const $ = Backbone.$;

export default extend({}, SelectPosition, SelectComponent, {
  init(o) {
    SelectComponent.init.apply(this, arguments);
    bindAll(this, 'initSorter', 'rollback', 'onEndMove');
    this.opt = o;
    this.hoverClass = this.ppfx + 'highlighter-warning';
    this.badgeClass = this.ppfx + 'badge-warning';
    this.noSelClass = this.ppfx + 'no-select';
  },

  enable(...args) {
    SelectComponent.enable.apply(this, args);
    this.getBadgeEl().addClass(this.badgeClass);
    this.getHighlighterEl().addClass(this.hoverClass);
    var wp = this.$wrapper;
    wp.css('cursor', 'move');
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
    if (!drag) return;

    // Avoid badge showing on move
    this.cacheEl = null;
    this.startSelectPosition(e.target, this.frameEl.contentDocument);
    this.sorter.draggable = drag;
    this.sorter.onEndMove = this.onEndMove.bind(this);
    this.stopSelectComponent();
    this.$wrapper.off('mousedown', this.initSorter);
    on(this.getContentWindow(), 'keydown', this.rollback);
  },

  /**
   * Init sorter from model
   * @param  {Object} model
   * @private
   */
  initSorterFromModel(model) {
    var drag = model.get('draggable');
    if (!drag) return;
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
    on(this.getContentWindow(), 'keydown', this.rollback);
  },

  /**
   * Init sorter from models
   * @param  {Object} model
   * @private
   */
  initSorterFromModels(models) {
    // TODO: if one only check for `draggable`
    // Avoid badge showing on move
    this.cacheEl = null;
    const lastModel = models[models.length - 1];
    const frame = (this.em.get('currentFrame') || {}).model;
    const el = lastModel.getEl(frame);
    const doc = el.ownerDocument;
    this.startSelectPosition(el, doc);
    this.sorter.draggable = lastModel.get('draggable');
    this.sorter.toMove = models;
    this.sorter.onEndMove = this.onEndMoveFromModel.bind(this);
    this.stopSelectComponent();
    on(this.getContentWindow(), 'keydown', this.rollback);
  },

  onEndMoveFromModel() {
    off(this.getContentWindow(), 'keydown', this.rollback);
  },

  /**
   * Callback after sorting
   * @private
   */
  onEndMove() {
    this.enable();
    off(this.getContentWindow(), 'keydown', this.rollback);
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
    if (key == 27 || force) {
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
    if (!this.$badge) this.$badge = $(this.getBadge());
    return this.$badge;
  },

  /**
   * Returns highlighter element
   * @return {HTMLElement}
   * @private
   */
  getHighlighterEl() {
    if (!this.$hl) this.$hl = $(this.canvas.getHighlighter());
    return this.$hl;
  },

  stop(...args) {
    SelectComponent.stop.apply(this, args);
    this.getBadgeEl().removeClass(this.badgeClass);
    this.getHighlighterEl().removeClass(this.hoverClass);
    var wp = this.$wrapper;
    wp.css('cursor', '')
      .unbind()
      .removeClass(this.noSelClass);
  }
});
