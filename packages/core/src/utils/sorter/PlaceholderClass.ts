import { View } from '../../common';
import { Dimension, Position } from './Sorter';

export class PlaceholderClass extends View {
  pfx: string;
  allowNesting: boolean;
  container: HTMLElement;
  el!: HTMLElement;
  offset: {
    top: number;
    left: number;
  };
  constructor(options: {
    container: HTMLElement;
    pfx?: string;
    allowNesting?: boolean;
    el: HTMLElement;
    offset: {
      top: number;
      left: number;
    };
  }) {
    super();
    this.pfx = options.pfx || '';
    this.allowNesting = options.allowNesting || false;
    this.container = options.container;
    this.setElement(options.el)
    this.offset = {
      top: options.offset.top || 0,
      left: options.offset.left || 0,
    };
  }


  show() {
    this.el.style.display = 'block';
  }

  hide() {
    this.el.style.display = 'none';
  }

  /**
 * Updates the position of the placeholder.
 * @param {Dimension[]} elementsDimension Array of element dimensions.
 * @param {Position} position Object representing position details (index and method).
 * @param {Dimension} [targetDimension] Optional target dimensions ([top, left, height, width]).
 */
  move(
    elementsDimension: Dimension[],
    position: Position,
  ) {
    const marginOffset = 0;
    const unit = 'px';
    let top = 0;
    let left = 0;
    let width = '';
    let height = '';

    const { method, index } = position;
    const elementDimension = elementsDimension[index];

    this.setOrientation(elementDimension);

    const { top: elTop, left: elLeft, height: elHeight, width: elWidth, dir } = elementDimension;

    if (!dir) {
      // If element is not in flow (e.g., a floating element)
      width = 'auto';
      height = (elHeight - marginOffset * 2) + unit;
      top = elTop + marginOffset;
      left = method === 'before' ? elLeft - marginOffset : elLeft + elWidth - marginOffset;

      this.setToVertical();
    } else {
      width = elWidth + unit;
      height = 'auto';
      top = method === 'before' ? elTop - marginOffset : elTop + elHeight - marginOffset;
      left = elLeft;
    }

    this.updateStyles(top, left, width, height);
    this.adjustOffset();
  }

  /**
   * Sets the orientation of the placeholder based on the element dimensions.
   * @param {Dimension} elementDimension Dimensions of the element at the index.
   */
  private setOrientation(elementDimension?: Dimension) {
    this.el.classList.remove('vertical');
    this.el.classList.add('horizontal');

    if (elementDimension && !elementDimension.dir) {
      this.setToVertical();
    }
  }

  /**
   * Sets the placeholder's class to vertical.
   */
  private setToVertical() {
    this.el.classList.remove('horizontal');
    this.el.classList.add('vertical');
  }

  /**
   * Handles the case where the placeholder is nested inside a component.
   * @param {Dimension} targetDimension Target element dimensions.
   * @param {number} marginOffset Margin offset value.
   */
  private handleNestedPlaceholder(
    marginOffset: number,
    targetDimension?: Dimension
  ) {
    if (!this.allowNesting || !targetDimension) {
      this.el.style.display = 'none';
      return;
    }

    const { top: trgTop, left: trgLeft, width: trgWidth, offsets } = targetDimension;
    const paddingTop = offsets?.paddingTop || marginOffset;
    const paddingLeft = offsets?.paddingLeft || marginOffset;
    const borderTopWidth = offsets?.borderTopWidth || 0;
    const borderLeftWidth = offsets?.borderLeftWidth || 0;
    const borderRightWidth = offsets?.borderRightWidth || 0;

    const borderWidth = borderLeftWidth + borderRightWidth;
    const top = trgTop + paddingTop + borderTopWidth;
    const left = trgLeft + paddingLeft + borderLeftWidth;
    const width = trgWidth - paddingLeft * 2 - borderWidth + 'px';

    this.updateStyles(top, left, width, 'auto');
  }

  /**
   * Updates the CSS styles of the placeholder element.
   * @param {number} top Top position of the placeholder.
   * @param {number} left Left position of the placeholder.
   * @param {string} width Width of the placeholder.
   * @param {string} height Height of the placeholder.
   */
  private updateStyles(
    top: number,
    left: number,
    width: string,
    height: string
  ) {
    this.el.style.top = top + 'px';
    this.el.style.left = left + 'px';
    if (width) this.el.style.width = width;
    if (height) this.el.style.height = height;
  }

  private adjustOffset() {
    this.$el.css('top', '+=' + this.offset.top + 'px');
    this.$el.css('left', '+=' + this.offset.left + 'px');
  }
}
