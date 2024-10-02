import { $ } from '../../common';
import CanvasComponentNode from '../../utils/sorter/CanvasComponentNode';
import { DragDirection } from '../../utils/sorter/types';
import { CommandObject } from './CommandAbstract';
export default {
  /**
   * Start select position event
   * @param {HTMLElement[]} sourceElements
   * @private
   * */
  startSelectPosition(sourceElements: HTMLElement[], doc: Document, opts: any = {}) {
    this.isPointed = false;
    const utils = this.em.Utils;
    const container = sourceElements[0].ownerDocument.body;

    if (utils && !this.sorter)
      this.sorter = new utils.ComponentSorter({
        em: this.em,
        treeClass: CanvasComponentNode,
        containerContext: {
          container,
          containerSel: '*',
          itemSel: '*',
          pfx: this.ppfx,
          document: doc,
          placeholderElement: this.canvas.getPlacerEl()!,
        },
        positionOptions: {
          windowMargin: 1,
          canvasRelative: true,
        },
        dragBehavior: {
          dragDirection: DragDirection.BothDirections,
          nested: true,
        },
      });

    if (opts.onStart) this.sorter.eventHandlers.legacyOnStartSort = opts.onStart;
    this.em.on(
      'frame:scroll',
      ((...agrs: any[]) => {
        const canvasScroll = this.canvas.getCanvasView().frame === agrs[0].frame;
        if (canvasScroll) this.sorter.recalculateTargetOnScroll();
      }).bind(this),
    );
    sourceElements && sourceElements.length > 0 && this.sorter.sortFromHtmlElements(sourceElements);
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
    this.posIndex = this.posMethod == 'after' && this.cDim.length !== 0 ? this.posIndex + 1 : this.posIndex; //Normalize
    if (this.sorter) {
      this.sorter.cancelDrag();
    }
    if (this.cDim) {
      this.posIsLastEl = this.cDim.length !== 0 && this.posMethod == 'after' && this.posIndex == this.cDim.length;
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
  nearFloat(index: number, method: string, dims: any[]) {
    var i = index || 0;
    var m = method || 'before';
    var len = dims.length;
    var isLast = len !== 0 && m == 'after' && i == len;
    if (len !== 0 && ((!isLast && !dims[i][4]) || (dims[i - 1] && !dims[i - 1][4]) || (isLast && !dims[i - 1][4])))
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
  },
} as CommandObject<{}, { [k: string]: any }>;
