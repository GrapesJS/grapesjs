import { keys, isUndefined, isElement, isArray } from 'underscore';

export const hasWin = () => typeof window !== 'undefined';

const elProt = hasWin() ? window.Element.prototype : {};
const matches =
  elProt.matches ||
  elProt.webkitMatchesSelector ||
  elProt.mozMatchesSelector ||
  elProt.msMatchesSelector;

/**
 * Import styles asynchronously
 * @param {String|Array<String>} styles
 */
const appendStyles = (styles, opts = {}) => {
  const stls = isArray(styles) ? [...styles] : [styles];

  if (stls.length) {
    const href = stls.shift();

    if (
      href &&
      (!opts.unique || !document.querySelector(`link[href="${href}"]`))
    ) {
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
const shallowDiff = (objOrig, objNew) => {
  const result = {};
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

const on = (el, ev, fn, opts) => {
  ev = ev.split(/\s+/);
  el = el instanceof Array ? el : [el];

  for (let i = 0; i < ev.length; ++i) {
    el.forEach(elem => elem && elem.addEventListener(ev[i], fn, opts));
  }
};

const off = (el, ev, fn, opts) => {
  ev = ev.split(/\s+/);
  el = el instanceof Array ? el : [el];

  for (let i = 0; i < ev.length; ++i) {
    el.forEach(elem => elem && elem.removeEventListener(ev[i], fn, opts));
  }
};

const getUnitFromValue = value => {
  return value.replace(parseFloat(value), '');
};

const upFirst = value => value[0].toUpperCase() + value.toLowerCase().slice(1);

const camelCase = value => {
  const values = value.split('-').filter(String);
  return values[0].toLowerCase() + values.slice(1).map(upFirst);
};

const normalizeFloat = (value, step = 1, valueDef = 0) => {
  let stepDecimals = 0;
  if (isNaN(value)) return valueDef;
  value = parseFloat(value);

  if (Math.floor(value) !== value) {
    const side = step.toString().split('.')[1];
    stepDecimals = side ? side.length : 0;
  }

  return stepDecimals ? parseFloat(value.toFixed(stepDecimals)) : value;
};

const hasDnd = em => {
  return (
    'draggable' in document.createElement('i') &&
    (em ? em.get('Config').nativeDnD : 1)
  );
};

/**
 * Ensure to fetch the element from the input argument
 * @param  {HTMLElement|Component} el Component or HTML element
 * @return {HTMLElement}
 */
const getElement = el => {
  if (isElement(el) || isTextNode(el)) {
    return el;
  } else if (el && el.getEl) {
    return el.getEl();
  }
};

/**
 * Check if element is a text node
 * @param  {HTMLElement} el
 * @return {Boolean}
 */
const isTextNode = el => el && el.nodeType === 3;

/**
 * Check if element is a comment node
 * @param  {HTMLElement} el
 * @return {Boolean}
 */
export const isCommentNode = el => el && el.nodeType === 8;

/**
 * Check if element is a comment node
 * @param  {HTMLElement} el
 * @return {Boolean}
 */
export const isTaggableNode = el => el && !isTextNode(el) && !isCommentNode(el);

export const find = (arr, test) => {
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

/**
 * Ensure to fetch the model from the input argument
 * @param  {HTMLElement|Component} el Component or HTML element
 * @return {Component}
 */
const getModel = (el, $) => {
  let model = el;
  isElement(el) && (model = $(el).data('model'));
  return model;
};

const getElRect = el => {
  const def = {
    top: 0,
    left: 0,
    width: 0,
    height: 0
  };
  if (!el) return def;
  let rectText;

  if (isTextNode(el)) {
    const range = document.createRange();
    range.selectNode(el);
    rectText = range.getBoundingClientRect();
    range.detach();
  }

  return (
    rectText || (el.getBoundingClientRect ? el.getBoundingClientRect() : def)
  );
};

/**
 * Get cross-device pointer event
 * @param  {Event} ev
 * @return {Event}
 */
const getPointerEvent = ev =>
  ev.touches && ev.touches[0] ? ev.touches[0] : ev;

/**
 * Get cross-browser keycode
 * @param  {Event} ev
 * @return {Number}
 */
const getKeyCode = ev => ev.which || ev.keyCode;
const getKeyChar = ev => String.fromCharCode(getKeyCode(ev));
const isEscKey = ev => getKeyCode(ev) === 27;
const isEnterKey = ev => getKeyCode(ev) === 13;
const isObject = val =>
  val !== null && !Array.isArray(val) && typeof val === 'object';
const isEmptyObj = val => Object.keys(val).length <= 0;

const capitalize = str => str && str.charAt(0).toUpperCase() + str.substring(1);
const isComponent = obj => obj && obj.toHTML;
const isRule = obj => obj && obj.toCSS;

const getViewEl = el => el.__gjsv;
const setViewEl = (el, view) => {
  el.__gjsv = view;
};

const createId = (length = 16) => {
  let result = '';
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const len = chars.length;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * len));
  }
  return result;
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
  isRule
};
