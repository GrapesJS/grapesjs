import Backbone from 'backbone';
const $ = Backbone.$;

export default {
  /**
   * Start select position event
   * @param {HTMLElement} trg
   * @private
   * */
  startSelectPosition(trg, doc) {
    this.isPointed = false;
    var utils = this.editorModel.get('Utils');
    const container = trg.ownerDocument.body;

    if (utils && !this.sorter)
      this.sorter = new utils.Sorter({
        container,
        placer: this.canvas.getPlacerEl(),
        containerSel: '*',
        itemSel: '*',
        pfx: this.ppfx,
        direction: 'a',
        document: doc,
        wmargin: 1,
        nested: 1,
        em: this.editorModel,
        canvasRelative: 1,
        scale: () => this.em.getZoomDecimal()
      });

    trg && this.sorter.startSort(trg, { container });
  },

  /**
   * Get frame position
   * @return {Object}
   * @private
   */
  getOffsetDim() {
    var frameOff = this.offset(this.canvas.getFrameEl());
    var canvasOff = this.offset(this.canvas.getElement());
    var top = frameOff.top - canvasOff.top;
    var left = frameOff.left - canvasOff.left;
    return { top, left };
  },

  /**
   * Stop select position event
   * @private
   * */
  stopSelectPosition() {
    this.posTargetCollection = null;
    this.posIndex =
      this.posMethod == 'after' && this.cDim.length !== 0
        ? this.posIndex + 1
        : this.posIndex; //Normalize
    if (this.sorter) {
      this.sorter.moved = 0;
      this.sorter.endMove();
    }
    if (this.cDim) {
      this.posIsLastEl =
        this.cDim.length !== 0 &&
        this.posMethod == 'after' &&
        this.posIndex == this.cDim.length;
      this.posTargetEl =
        this.cDim.length === 0
          ? $(this.outsideElem)
          : !this.posIsLastEl && this.cDim[this.posIndex]
          ? $(this.cDim[this.posIndex][5]).parent()
          : $(this.outsideElem);
      this.posTargetModel = this.posTargetEl.data('model');
      this.posTargetCollection = this.posTargetEl.data('model-comp');
    }
  },

  /**
   * Enabel select position
   * @private
   */
  enable() {
    this.startSelectPosition();
  },

  /**
   * Check if the pointer is near to the float component
   * @param {number} index
   * @param {string} method
   * @param {Array<Array>} dims
   * @return {Boolean}
   * @private
   * */
  nearFloat(index, method, dims) {
    var i = index || 0;
    var m = method || 'before';
    var len = dims.length;
    var isLast = len !== 0 && m == 'after' && i == len;
    if (
      len !== 0 &&
      ((!isLast && !dims[i][4]) ||
        (dims[i - 1] && !dims[i - 1][4]) ||
        (isLast && !dims[i - 1][4]))
    )
      return 1;
    return 0;
  },

  run() {
    this.enable();
  },

  stop() {
    this.stopSelectPosition();
    this.$wrapper.css('cursor', '');
    this.$wrapper.unbind();
  }
};
