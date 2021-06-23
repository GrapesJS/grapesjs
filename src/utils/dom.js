// DOM helpers
import { each, isUndefined, isString } from 'underscore';

const KEY_TAG = 'tag';
const KEY_ATTR = 'attributes';
const KEY_CHILD = 'children';

export const motionsEv =
  'transitionend oTransitionEnd transitionend webkitTransitionEnd';

export const isDoc = el => el && el.nodeType === 9;

export const removeEl = el => {
  const parent = el && el.parentNode;
  parent && parent.removeChild(el);
};

export const find = (el, query) => el.querySelectorAll(query);

export const attrUp = (el, attrs = {}) =>
  el &&
  el.setAttribute &&
  each(attrs, (value, key) => el.setAttribute(key, value));

export const isVisible = el => {
  return (
    el && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)
  );
};

export const empty = node => {
  while (node.firstChild) node.removeChild(node.firstChild);
};

export const replaceWith = (oldEl, newEl) => {
  oldEl.parentNode.replaceChild(newEl, oldEl);
};

export const appendAtIndex = (parent, child, index) => {
  const { childNodes } = parent;
  const total = childNodes.length;
  const at = isUndefined(index) ? total : index;

  if (isString(child)) {
    parent.insertAdjacentHTML('beforeEnd', child);
    child = parent.lastChild;
    parent.removeChild(child);
  }

  if (at >= total) {
    parent.appendChild(child);
  } else {
    parent.insertBefore(child, childNodes[at]);
  }
};

export const append = (parent, child) => appendAtIndex(parent, child);

export const createEl = (tag, attrs = '', child) => {
  const el = document.createElement(tag);
  attrs && each(attrs, (value, key) => el.setAttribute(key, value));

  if (child) {
    if (isString(child)) el.innerHTML = child;
    else el.appendChild(child);
  }

  return el;
};

// Unfortunately just creating `KeyboardEvent(e.type, e)` is not enough,
// the keyCode/which will be always `0`. Even if it's an old/deprecated
// property keymaster (and many others) still use it... using `defineProperty`
// hack seems the only way
export const createCustomEvent = (e, cls) => {
  let oEvent;
  try {
    oEvent = new window[cls](e.type, e);
  } catch (e) {
    oEvent = document.createEvent(cls);
    oEvent.initEvent(e.type, true, true);
  }
  oEvent.keyCodeVal = e.keyCode;
  oEvent._parentEvent = e;
  ['keyCode', 'which'].forEach(prop => {
    Object.defineProperty(oEvent, prop, {
      get() {
        return this.keyCodeVal;
      }
    });
  });
  return oEvent;
};

/**
 * Append an array of vNodes to an element
 * @param {HTMLElement} node HTML element
 * @param {Array} vNodes Array of node objects
 */
export const appendVNodes = (node, vNodes = []) => {
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
