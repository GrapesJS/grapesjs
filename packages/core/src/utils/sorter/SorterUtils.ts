import { $, Model, SetOptions } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { isTextNode } from '../dom';
import { matches as matchesMixin } from '../mixins';
import { SortableTreeNode } from './SortableTreeNode';
import { Dimension, Placement, DragDirection, SorterOptions } from './types';

/**
 * Find the position based on passed dimensions and coordinates
 * @param {Array<Array>} dims Dimensions of nodes to parse
 * @param {number} posX X coordindate
 * @param {number} posY Y coordindate
 * @return {Object}
 * */
export function findPosition(dims: Dimension[], posX: number, posY: number) {
  const result = { index: 0, placement: 'before' as Placement };
  let leftLimit = 0;
  let xLimit = 0;
  let dimRight = 0;
  let yLimit = 0;
  let xCenter = 0;
  let yCenter = 0;
  let dimDown = 0;
  let dim: Dimension;

  // Each dim is: Top, Left, Height, Width
  for (var i = 0, len = dims.length; i < len; i++) {
    dim = dims[i];
    const { top, left, height, width } = dim;
    // Right position of the element. Left + Width
    dimRight = left + width;
    // Bottom position of the element. Top + Height
    dimDown = top + height;
    // X center position of the element. Left + (Width / 2)
    xCenter = left + width / 2;
    // Y center position of the element. Top + (Height / 2)
    yCenter = top + height / 2;
    // Skip if over the limits
    if (
      (xLimit && left > xLimit) ||
      (yLimit && yCenter >= yLimit) || // >= avoid issue with clearfixes
      (leftLimit && dimRight < leftLimit)
    )
      continue;
    result.index = i;
    // If it's not in flow (like 'float' element)
    if (!dim.dir) {
      if (posY < dimDown) yLimit = dimDown;
      //If x lefter than center
      if (posX < xCenter) {
        xLimit = xCenter;
        result.placement = 'before';
      } else {
        leftLimit = xCenter;
        result.placement = 'after';
      }
    } else {
      // If y upper than center
      if (posY < yCenter) {
        result.placement = 'before';
        break;
      } else result.placement = 'after'; // After last element
    }
  }

  return result;
}
/**
 * Get the offset of the element
 * @param  {HTMLElement} el
 * @return {Object}
 */
export function offset(el: HTMLElement) {
  const rect = el.getBoundingClientRect();

  return {
    top: rect.top + document.body.scrollTop,
    left: rect.left + document.body.scrollLeft,
  };
}
/**
 * Returns true if the element matches with selector
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 */
export function matches(el: HTMLElement, selector: string): boolean {
  return matchesMixin.call(el, selector);
}

/**
 * Sort according to the position in the dom
 * @param {Object} model2
 * @param {Object} model1
 */
export function sortDom(model1: any, model2: any) {
  const model1Parents = parents(model1);
  const model2Parents = parents(model2);
  // common ancesters
  const ancesters = model2Parents.filter((p: any) => model1Parents.includes(p));
  const ancester = ancesters[0];
  if (!ancester) {
    // this is never supposed to happen
    return model1.model.index() - model2.model.index();
  }
  // find siblings in the common ancester
  // the sibling is the element inside the ancester
  const s1 = model2Parents[model2Parents.indexOf(ancester) - 1];
  const s2 = model1Parents[model1Parents.indexOf(ancester) - 1];
  // order according to the position in the DOM
  return s2.index() - s1.index();
}
/**
 * Build an array of all the parents, including the component itself
 * @return {Model|null}
 */
function parents(model: any): any[] {
  return model ? [model].concat(parents(model.parent())) : [];
}

/**
 * Closest parent
 * @param {Element} el
 * @param {String} selector
 * @return {Element|null}
 */
export function closest(el: HTMLElement, selector: string): HTMLElement | undefined {
  if (!el) return;
  let elem = el.parentNode;

  while (elem && elem.nodeType === 1) {
    if (matches(elem as HTMLElement, selector)) return elem as HTMLElement;
    elem = elem.parentNode;
  }
}
/**
 * Determines if an element is in the normal flow of the document.
 * This checks whether the element is not floated or positioned in a way that removes it from the flow.
 *
 * @param  {HTMLElement} el - The element to check.
 * @param  {HTMLElement} [parent=document.body] - The parent element for additional checks (defaults to `document.body`).
 * @return {boolean} Returns `true` if the element is in flow, otherwise `false`.
 * @private
 */
export function isInFlow(el: HTMLElement, parent: HTMLElement = document.body): boolean {
  return !!el && isStyleInFlow(el, parent);
}

/**
 * Checks if an element has styles that keep it in the document flow.
 * Considers properties like `float`, `position`, and certain display types.
 *
 * @param  {HTMLElement} el - The element to check.
 * @param  {HTMLElement} parent - The parent element for additional style checks.
 * @return {boolean} Returns `true` if the element is styled to be in flow, otherwise `false`.
 * @private
 */
function isStyleInFlow(el: HTMLElement, parent: HTMLElement): boolean {
  if (isTextNode(el)) return false;

  const elementStyles = el.style || {};
  const $el = $(el);
  const $parent = $(parent);

  // Check overflow property
  if (elementStyles.overflow && elementStyles.overflow !== 'visible') return false;

  // Check float property
  const elementFloat = $el.css('float');
  if (elementFloat && elementFloat !== 'none') return false;

  // Check parent for flexbox display and non-column flex-direction
  if ($parent.css('display') === 'flex' && $parent.css('flex-direction') !== 'column') return false;

  // Check position property
  if (!isInFlowPosition(elementStyles.position)) return false;

  // Check tag and display properties
  return isFlowElementTag(el) || isFlowElementDisplay($el);
}

/**
 * Determines if the element's `position` style keeps it in the flow.
 *
 * @param {string} position - The position style of the element.
 * @return {boolean} Returns `true` if the position keeps the element in flow.
 * @private
 */
function isInFlowPosition(position: string): boolean {
  switch (position) {
    case 'static':
    case 'relative':
    case '':
      return true;
    default:
      return false;
  }
}

/**
 * Checks if the element's tag name represents an element typically in flow.
 *
 * @param {HTMLElement} el - The element to check.
 * @return {boolean} Returns `true` if the tag name represents a flow element.
 * @private
 */
function isFlowElementTag(el: HTMLElement): boolean {
  const flowTags = ['TR', 'TBODY', 'THEAD', 'TFOOT'];
  return flowTags.includes(el.tagName);
}

/**
 * Checks if the element's display style keeps it in flow.
 *
 * @param {JQuery} $el - The jQuery-wrapped element to check.
 * @return {boolean} Returns `true` if the display style represents a flow element.
 * @private
 */
function isFlowElementDisplay($el: JQuery): boolean {
  const display = $el.css('display');
  const flowDisplays = ['block', 'list-item', 'table', 'flex', 'grid'];
  return flowDisplays.includes(display);
}

export function getDocument(em?: EditorModel, el?: HTMLElement) {
  const elDoc = el ? el.ownerDocument : em?.Canvas.getBody().ownerDocument;
  return elDoc;
}

export function getMergedOptions<T, NodeType extends SortableTreeNode<T>>(sorterOptions: SorterOptions<T, NodeType>) {
  const defaultOptions = {
    containerContext: {
      container: '' as any,
      placeholderElement: '' as any,
      containerSel: '*',
      itemSel: '*',
      pfx: '',
      document,
    },
    positionOptions: {
      borderOffset: 10,
      relative: false,
      windowMargin: 0,
      offsetTop: 0,
      offsetLeft: 0,
      scale: 1,
      canvasRelative: false,
    },
    dragBehavior: {
      dragDirection: DragDirection.Vertical,
      nested: false,
      selectOnEnd: true,
    },
    eventHandlers: {},
  };

  const mergedOptions = {
    ...defaultOptions,
    ...sorterOptions,
    containerContext: {
      ...defaultOptions.containerContext,
      ...sorterOptions.containerContext,
    },
    positionOptions: {
      ...defaultOptions.positionOptions,
      ...sorterOptions.positionOptions,
    },
    dragBehavior: {
      ...defaultOptions.dragBehavior,
      ...sorterOptions.dragBehavior,
    },
    eventHandlers: {
      ...defaultOptions.eventHandlers,
      ...sorterOptions.eventHandlers,
    },
  };

  return mergedOptions;
}
