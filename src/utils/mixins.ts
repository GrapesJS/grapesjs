import { keys, isUndefined, isElement, isArray } from 'underscore';
import EditorModel from '../editor/model/Editor';

export const isDef = (value: any) => typeof value !== 'undefined';

export const hasWin = () => typeof window !== 'undefined';

export const getGlobal = () =>
  typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : global;

export const toLowerCase = (str: string) => (str || '').toLowerCase();

const elProt = hasWin() ? window.Element.prototype : {};
// @ts-ignore
const matches = elProt.matches || elProt.webkitMatchesSelector || elProt.mozMatchesSelector || elProt.msMatchesSelector;

export const getUiClass = (em: EditorModel, defCls: string) => {
  const { stylePrefix, customUI } = em.getConfig();
  return [customUI && `${stylePrefix}cui`, defCls].filter(i => i).join(' ');
};

/**
 * Import styles asynchronously
 * @param {String|Array<String>} styles
 */
const appendStyles = (styles: {}, opts: { unique?: boolean; prepand?: boolean } = {}) => {
  const stls = isArray(styles) ? [...styles] : [styles];

  if (stls.length) {
    const href = stls.shift();

    if (href && (!opts.unique || !document.querySelector(`link[href="${href}"]`))) {
      const { head } = document;
      const link = document.createElement('link');
      link.href = href;
      link.rel = 'stylesheet';

      if (opts.prepand) {
        head.insertBefore(link, head.firstChild);
      } else {
        head.appendChild(link);
      }
    }

    appendStyles(stls);
  }
};

/**
 * Returns shallow diff between 2 objects
 * @param  {Object} objOrig
 * @param  {Objec} objNew
 * @return {Object}
 * @example
 * var a = {foo: 'bar', baz: 1, faz: 'sop'};
 * var b = {foo: 'bar', baz: 2, bar: ''};
 * shallowDiff(a, b);
 * // -> {baz: 2, faz: null, bar: ''};
 */
const shallowDiff = (objOrig: Record<string, any>, objNew: Record<string, any>) => {
  const result: Record<string, any> = {};
  const keysNew = keys(objNew);

  for (let prop in objOrig) {
    if (objOrig.hasOwnProperty(prop)) {
      const origValue = objOrig[prop];
      const newValue = objNew[prop];

      if (keysNew.indexOf(prop) >= 0) {
        if (origValue !== newValue) {
          result[prop] = newValue;
        }
      } else {
        result[prop] = null;
      }
    }
  }

  for (let prop in objNew) {
    if (objNew.hasOwnProperty(prop)) {
      if (isUndefined(objOrig[prop])) {
        result[prop] = objNew[prop];
      }
    }
  }

  return result;
};

const on = (
  el: HTMLElement | Window | Document | (Window | HTMLElement | Document)[],
  ev: string,
  fn: (ev: Event) => void,
  opts?: AddEventListenerOptions
) => {
  const evs = ev.split(/\s+/);
  el = el instanceof Array ? el : [el];

  for (let i = 0; i < evs.length; ++i) {
    el.forEach(elem => elem && elem.addEventListener(evs[i], fn, opts));
  }
};

const off = (
  el: HTMLElement | Window | Document | (Window | HTMLElement | Document)[],
  ev: string,
  fn: (ev: Event) => void,
  opts?: AddEventListenerOptions
) => {
  const evs = ev.split(/\s+/);
  el = el instanceof Array ? el : [el];

  for (let i = 0; i < evs.length; ++i) {
    el.forEach(elem => elem && elem.removeEventListener(evs[i], fn, opts));
  }
};

const getUnitFromValue = (value: any) => {
  return value.replace(parseFloat(value), '');
};

const upFirst = (value: string) => value[0].toUpperCase() + value.toLowerCase().slice(1);

const camelCase = (value: string) => {
  return value.replace(/-./g, x => x[1].toUpperCase());
};

const normalizeFloat = (value: any, step = 1, valueDef = 0) => {
  let stepDecimals = 0;
  if (isNaN(value)) return valueDef;
  value = parseFloat(value);

  if (Math.floor(value) !== value) {
    const side = step.toString().split('.')[1];
    stepDecimals = side ? side.length : 0;
  }

  return stepDecimals ? parseFloat(value.toFixed(stepDecimals)) : value;
};

const hasDnd = (em: any) => {
  return 'draggable' in document.createElement('i') && (em ? em.get('Config').nativeDnD : 1);
};

/**
 * Ensure to fetch the element from the input argument
 * @param  {HTMLElement|Component} el Component or HTML element
 * @return {HTMLElement}
 */
const getElement = (el: HTMLElement) => {
  if (isElement(el) || isTextNode(el)) {
    return el;
    // @ts-ignore
  } else if (el && el.getEl) {
    // @ts-ignore
    return el.getEl();
  }
};

/**
 * Check if element is a text node
 * @param  {HTMLElement} el
 * @return {Boolean}
 */
const isTextNode = (el: HTMLElement) => el && el.nodeType === 3;

/**
 * Check if element is a comment node
 * @param  {HTMLElement} el
 * @return {Boolean}
 */
export const isCommentNode = (el: HTMLElement) => el && el.nodeType === 8;

/**
 * Check if element is a comment node
 * @param  {HTMLElement} el
 * @return {Boolean}
 */
export const isTaggableNode = (el: HTMLElement) => el && !isTextNode(el) && !isCommentNode(el);

export const find = (arr: any[], test: (item: any, i: number, arr: any[]) => boolean) => {
  let result = null;
  arr.some((el, i) => (test(el, i, arr) ? ((result = el), 1) : 0));
  return result;
};

export const escape = (str = '') => {
  return `${str}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#96;');
};

export const escapeNodeContent = (str = '') => {
  return `${str}`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

export const deepMerge = (...args: Record<string, any>[]) => {
  const target = { ...args[0] };

  for (let i = 1; i < args.length; i++) {
    const source = { ...args[i] };

    for (let key in source) {
      const targValue = target[key];
      const srcValue = source[key];

      if (isObject(targValue) && isObject(srcValue)) {
        target[key] = deepMerge(targValue, srcValue);
      } else {
        target[key] = srcValue;
      }
    }
  }

  return target;
};

/**
 * Ensure to fetch the model from the input argument
 * @param  {HTMLElement|Component} el Component or HTML element
 * @return {Component}
 */
const getModel = (el: any, $?: any) => {
  let model = el;
  if (!$ && el && el.__cashData) {
    model = el.__cashData.model;
  } else if (isElement(el)) {
    model = $(el).data('model');
  }
  return model;
};

const getElRect = (el?: HTMLElement) => {
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
 * Get cross-device pointer event
 * @param  {Event} ev
 * @return {PointerEvent}
 */
const getPointerEvent = (ev: Event) =>
  // @ts-ignore
  ev.touches && ev.touches[0] ? ev.touches[0] : ev;

/**
 * Get cross-browser keycode
 * @param  {Event} ev
 * @return {Number}
 */
const getKeyCode = (ev: KeyboardEvent) => ev.which || ev.keyCode;
const getKeyChar = (ev: KeyboardEvent) => String.fromCharCode(getKeyCode(ev));
const isEscKey = (ev: KeyboardEvent) => getKeyCode(ev) === 27;
const isEnterKey = (ev: KeyboardEvent) => getKeyCode(ev) === 13;
const isObject = (val: any): val is Object => val !== null && !Array.isArray(val) && typeof val === 'object';
const isEmptyObj = (val: Record<string, any>) => Object.keys(val).length <= 0;

const capitalize = (str: string) => str && str.charAt(0).toUpperCase() + str.substring(1);
const isComponent = (obj: any) => obj && obj.toHTML;
const isRule = (obj: any) => obj && obj.toCSS;

const getViewEl = (el: any) => el.__gjsv;
const setViewEl = (el: any, view: any) => {
  el.__gjsv = view;
};

const createId = (length = 16) => {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const len = chars.length;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * len));
  }
  return result;
};

export const buildBase64UrlFromSvg = (svg: string) => {
  if (svg && svg.substr(0, 4) === '<svg') {
    let base64Str = '';

    if (hasWin()) {
      base64Str = window.btoa(svg);
    } else if (typeof Buffer !== 'undefined') {
      base64Str = Buffer.from(svg, 'utf8').toString('base64');
    }

    return base64Str ? `data:image/svg+xml;base64,${base64Str}` : svg;
  }

  return svg;
};

export {
  on,
  off,
  hasDnd,
  upFirst,
  matches,
  getModel,
  getElRect,
  camelCase,
  isTextNode,
  getKeyCode,
  getKeyChar,
  isEscKey,
  isEnterKey,
  getElement,
  shallowDiff,
  normalizeFloat,
  getPointerEvent,
  getUnitFromValue,
  capitalize,
  getViewEl,
  setViewEl,
  appendStyles,
  isObject,
  isEmptyObj,
  isComponent,
  createId,
  isRule,
};
