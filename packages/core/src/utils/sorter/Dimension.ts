import CanvasModule from '../../canvas';
import { Placement } from './types';

/**
 * A class representing dimensions of an element, including position, size, offsets, and other metadata.
 * Provides functionality to calculate differences between current and previous dimensions and update them.
 */
export default class Dimension {
  public top: number;
  public left: number;
  public height: number;
  public width: number;
  public offsets: ReturnType<CanvasModule['getElementOffsets']>;
  public dir?: boolean;
  public el?: HTMLElement;
  public indexEl?: number;

  /**
   * Initializes the DimensionCalculator with the given initial dimensions.
   *
   * @param initialDimensions - The initial dimensions containing `top`, `left`, `height`, `width`, and other properties.
   */
  constructor(initialDimensions: {
    top: number;
    left: number;
    height: number;
    width: number;
    offsets: ReturnType<CanvasModule['getElementOffsets']>;
    dir?: boolean;
    el?: HTMLElement;
    indexEl?: number;
  }) {
    this.top = initialDimensions.top;
    this.left = initialDimensions.left;
    this.height = initialDimensions.height;
    this.width = initialDimensions.width;
    this.offsets = initialDimensions.offsets;
    this.dir = initialDimensions.dir;
    this.el = initialDimensions.el;
    this.indexEl = initialDimensions.indexEl;
  }

  /**
   * Calculates the difference between the current and previous dimensions.
   * If there are no previous dimensions, it will return zero differences.
   *
   * @returns An object containing the differences in `top` and `left` positions.
   */
  public calculateDimensionDifference(dimension: Dimension): { topDifference: number; leftDifference: number } {
    const topDifference = dimension.top - this.top;
    const leftDifference = dimension.left - this.left;

    return { topDifference, leftDifference };
  }

  /**
   * Updates the current dimensions by adding the given differences to the `top` and `left` values.
   *
   * @param topDifference - The difference to add to the current `top` value.
   * @param leftDifference - The difference to add to the current `left` value.
   */
  public adjustDimensions(difference: { topDifference: number; leftDifference: number }): Dimension {
    this.top += difference.topDifference;
    this.left += difference.leftDifference;

    return this;
  }

  /**
   * Determines the placement ('before' or 'after') based on the X and Y coordinates and center points.
   *
   * @param {number} mouseX X coordinate of the mouse
   * @param {number} mouseY Y coordinate of the mouse
   * @return {Placement} 'before' or 'after'
   */
  public determinePlacement(mouseX: number, mouseY: number): Placement {
    const xCenter = this.left + this.width / 2;
    const yCenter = this.top + this.height / 2;

    if (this.dir) {
      return mouseY < yCenter ? 'before' : 'after';
    } else {
      return mouseX < xCenter ? 'before' : 'after';
    }
  }
}
