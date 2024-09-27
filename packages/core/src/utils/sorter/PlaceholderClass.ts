import { View } from '../../common';
import { Dimension, Placement } from './types';

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
    this.setElement(options.el);
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
   * @param {Dimension} elementDimension element dimensions.
   * @param {Position} placement either before or after the target.
   */
  move(elementDimension: Dimension, placement: Placement) {
    const marginOffset = 0;
    const unit = 'px';
    let top = 0;
    let left = 0;
    let width = '';
    let height = '';
    this.setOrientationForDimension(elementDimension);
    const { top: elTop, left: elLeft, height: elHeight, width: elWidth, dir, offsets } = elementDimension;

    if (placement === 'inside') {
      this.setOrientation('horizontal');
      if (!this.allowNesting) {
        this.hide();
        return;
      }
      const defaultMargin = 5;
      const paddingTop = offsets?.paddingTop || defaultMargin;
      const paddingLeft = offsets?.paddingLeft || defaultMargin;
      const borderTopWidth = offsets?.borderTopWidth || 0;
      const borderLeftWidth = offsets?.borderLeftWidth || 0;
      const borderRightWidth = offsets?.borderRightWidth || 0;

      const borderWidth = borderLeftWidth + borderRightWidth;
      top = elTop + paddingTop + borderTopWidth;
      left = elLeft + paddingLeft + borderLeftWidth;
      width = elWidth - paddingLeft * 2 - borderWidth + 'px';
      height = 'auto';
    } else {
      if (!dir) {
        // If element is not in flow (e.g., a floating element)
        width = 'auto';
        height = elHeight - marginOffset * 2 + unit;
        top = elTop + marginOffset;
        left = placement === 'before' ? elLeft - marginOffset : elLeft + elWidth - marginOffset;

        this.setOrientation('vertical');
      } else {
        width = elWidth + unit;
        height = 'auto';
        top = placement === 'before' ? elTop - marginOffset : elTop + elHeight - marginOffset;
        left = elLeft;
      }
    }

    this.updateStyles(top, left, width, height);
    this.adjustOffset();
  }

  /**
   * Sets the orientation of the placeholder based on the element dimensions.
   * @param {Dimension} elementDimension Dimensions of the element at the index.
   */
  private setOrientationForDimension(elementDimension?: Dimension) {
    this.el.classList.remove('vertical');
    this.el.classList.add('horizontal');

    if (elementDimension && !elementDimension.dir) {
      this.setOrientation('vertical');
    }
  }

  /**
   * Sets the placeholder's class to vertical.
   */
  private setOrientation(orientation: 'horizontal' | 'vertical') {
    this.el.classList.remove('horizontal');
    this.el.classList.remove('vertical');
    this.el.classList.add(orientation);
  }

  /**
   * Updates the CSS styles of the placeholder element.
   * @param {number} top Top position of the placeholder.
   * @param {number} left Left position of the placeholder.
   * @param {string} width Width of the placeholder.
   * @param {string} height Height of the placeholder.
   */
  private updateStyles(top: number, left: number, width: string, height: string) {
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
