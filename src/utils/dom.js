// DOM helpers
import { each, isUndefined } from 'underscore';

const KEY_TAG = 'tag';
const KEY_ATTR = 'attributes';
const KEY_CHILD = 'children';

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

  if (at >= total) {
    parent.appendChild(child);
  } else {
    parent.insertBefore(child, childNodes[at]);
  }
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
