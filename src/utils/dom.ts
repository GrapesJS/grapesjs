import { each, isArray, isString, isUndefined } from 'underscore';
import { ObjectAny } from '../common';

type vNode = {
  tag?: string;
  attributes?: ObjectAny;
  children?: vNode[];
};

type ChildHTML = HTMLElement | string;

type ClassNameInputType = string | number | boolean | null | undefined;

type ClassNameInput = ClassNameInputType | Array<ClassNameInputType>;

const KEY_TAG = 'tag';
const KEY_ATTR = 'attributes';
const KEY_CHILD = 'children';

export const motionsEv = 'transitionend oTransitionEnd transitionend webkitTransitionEnd';

export const isDoc = (el?: Node): el is Document => el?.nodeType === Node.DOCUMENT_NODE;

export const removeEl = (el?: HTMLElement) => {
  const parent = el && el.parentNode;
  parent && parent.removeChild(el);
};

export function cx(...inputs: ClassNameInput[]): string {
  const inp = Array.isArray(inputs[0]) ? inputs[0] : [...inputs];
  return inp.filter(Boolean).join(' ');
}

export const find = (el: HTMLElement, query: string) => el.querySelectorAll(query);

export const attrUp = (el?: HTMLElement, attrs: ObjectAny = {}) =>
  el && el.setAttribute && each(attrs, (value, key) => el.setAttribute(key, value));

export const isVisible = (el?: HTMLElement) => {
  return el && !!(el.offsetWidth || el.offsetHeight || el.getClientRects?.().length);
};

export const empty = (node: HTMLElement) => {
  while (node.firstChild) node.removeChild(node.firstChild);
};

export const replaceWith = (oldEl: HTMLElement, newEl: HTMLElement) => {
  oldEl.parentNode?.replaceChild(newEl, oldEl);
};

export const appendAtIndex = (parent: HTMLElement | DocumentFragment, child: ChildHTML, index?: number) => {
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

export const createEl = (tag: string, attrs: ObjectAny = {}, child?: ChildHTML) => {
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

/**
 * Check if element is a text node
 * @param  {Node} el
 * @return {Boolean}
 */
export const isTextNode = (el?: Node): el is Text => el?.nodeType === Node.TEXT_NODE;

/**
 * Check if element is a comment node
 * @param  {Node} el
 * @return {Boolean}
 */
export const isCommentNode = (el?: Node): el is Comment => el?.nodeType === Node.COMMENT_NODE;

/**
 * Check if taggable node
 * @param  {Node} el
 * @return {Boolean}
 */
export const isTaggableNode = (el?: Node) => el && !isTextNode(el) && !isCommentNode(el);

/**
 * Get DOMRect of the element.
 * @param el
 * @returns {DOMRect}
 */
export const getElRect = (el?: Element) => {
  const def = {
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  };
  if (!el) return def;
  let rectText;

  if (isTextNode(el)) {
    const range = document.createRange();
    range.selectNode(el);
    rectText = range.getBoundingClientRect();
    range.detach();
  }

  return rectText || (el.getBoundingClientRect ? el.getBoundingClientRect() : def);
};

/**
 * Get document scroll coordinates
 */
export const getDocumentScroll = (el?: HTMLElement) => {
  const doc = el?.ownerDocument || document;
  const docEl = doc.documentElement;
  const win = doc.defaultView || window;

  return {
    x: (win.pageXOffset || docEl.scrollLeft || 0) - (docEl.clientLeft || 0),
    y: (win.pageYOffset || docEl.scrollTop || 0) - (docEl.clientTop || 0),
  };
};

export const getKeyCode = (ev: KeyboardEvent) => ev.which || ev.keyCode;

export const getKeyChar = (ev: KeyboardEvent) => String.fromCharCode(getKeyCode(ev));

export const getPointerEvent = (ev: any): PointerEvent => (ev.touches && ev.touches[0] ? ev.touches[0] : ev);

export const isEscKey = (ev: KeyboardEvent) => getKeyCode(ev) === 27;

export const isEnterKey = (ev: KeyboardEvent) => getKeyCode(ev) === 13;

export const hasCtrlKey = (ev: WheelEvent) => ev.ctrlKey;

export const hasModifierKey = (ev: WheelEvent) => hasCtrlKey(ev) || ev.metaKey;

export const on = <E extends Event = Event>(
  el: EventTarget | EventTarget[],
  ev: string,
  fn: (ev: E) => void,
  opts?: boolean | AddEventListenerOptions
) => {
  const evs = ev.split(/\s+/);
  const els = isArray(el) ? el : [el];

  evs.forEach(ev => {
    els.forEach(el => el?.addEventListener(ev, fn as EventListener, opts));
  });
};

export const off = <E extends Event = Event>(
  el: EventTarget | EventTarget[],
  ev: string,
  fn: (ev: E) => void,
  opts?: boolean | AddEventListenerOptions
) => {
  const evs = ev.split(/\s+/);
  const els = isArray(el) ? el : [el];

  evs.forEach(ev => {
    els.forEach(el => el?.removeEventListener(ev, fn as EventListener, opts));
  });
};
