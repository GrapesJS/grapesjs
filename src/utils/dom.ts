import { each, isUndefined, isString } from 'underscore';

type AnyObject = Record<string, any>;

type vNode = {
  tag?: string;
  attributes?: AnyObject;
  children?: vNode[];
};

type ChildHTML = HTMLElement | string;

const KEY_TAG = 'tag';
const KEY_ATTR = 'attributes';
const KEY_CHILD = 'children';

export const motionsEv = 'transitionend oTransitionEnd transitionend webkitTransitionEnd';

export const isDoc = (el?: HTMLElement) => el && el.nodeType === 9;

export const removeEl = (el?: HTMLElement) => {
  const parent = el && el.parentNode;
  parent && parent.removeChild(el);
};

export const find = (el: HTMLElement, query: string) => el.querySelectorAll(query);

export const attrUp = (el?: HTMLElement, attrs: AnyObject = {}) =>
  el && el.setAttribute && each(attrs, (value, key) => el.setAttribute(key, value));

export const isVisible = (el?: HTMLElement) => {
  return el && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
};

export const empty = (node: HTMLElement) => {
  while (node.firstChild) node.removeChild(node.firstChild);
};

export const replaceWith = (oldEl: HTMLElement, newEl: HTMLElement) => {
  oldEl.parentNode?.replaceChild(newEl, oldEl);
};

export const appendAtIndex = (parent: HTMLElement, child: ChildHTML, index?: number) => {
  const { childNodes } = parent;
  const total = childNodes.length;
  const at = isUndefined(index) ? total : index;

  if (isString(child)) {
    // @ts-ignore
    parent.insertAdjacentHTML('beforeEnd', child);
    child = parent.lastChild as HTMLElement;
    parent.removeChild(child);
  }

  if (at >= total) {
    parent.appendChild(child);
  } else {
    parent.insertBefore(child, childNodes[at]);
  }
};

export const append = (parent: HTMLElement, child: ChildHTML) => appendAtIndex(parent, child);

export const createEl = (tag: string, attrs: AnyObject = {}, child?: ChildHTML) => {
  const el = document.createElement(tag);
  attrs && each(attrs, (value, key) => el.setAttribute(key, value));

  if (child) {
    if (isString(child)) el.innerHTML = child;
    else el.appendChild(child);
  }

  return el;
};

export const createText = (str: string) => document.createTextNode(str);

// Unfortunately just creating `KeyboardEvent(e.type, e)` is not enough,
// the keyCode/which will be always `0`. Even if it's an old/deprecated
// property keymaster (and many others) still use it... using `defineProperty`
// hack seems the only way
export const createCustomEvent = (e: any, cls: any) => {
  let oEvent: any;
  const { type } = e;
  try {
    // @ts-ignore
    oEvent = new window[cls](type, e);
  } catch (err) {
    oEvent = document.createEvent(cls);
    oEvent.initEvent(type, true, true);
  }
  oEvent._parentEvent = e;
  if (type.indexOf('key') === 0) {
    oEvent.keyCodeVal = e.keyCode;
    ['keyCode', 'which'].forEach(prop => {
      Object.defineProperty(oEvent, prop, {
        get() {
          return this.keyCodeVal;
        },
      });
    });
  }
  return oEvent;
};

/**
 * Append an array of vNodes to an element
 * @param {HTMLElement} node HTML element
 * @param {Array} vNodes Array of node objects
 */
export const appendVNodes = (node: HTMLElement, vNodes: vNode | vNode[] = []) => {
  const vNodesArr = Array.isArray(vNodes) ? vNodes : [vNodes];
  vNodesArr.forEach(vnode => {
    const tag = vnode[KEY_TAG] || 'div';
    const attr = vnode[KEY_ATTR] || {};
    const el = document.createElement(tag);

    each(attr, (value, key) => {
      el.setAttribute(key, value);
    });

    node.appendChild(el);
  });
};
