import { isArray, isElement, isUndefined, keys } from 'underscore';
import ComponentView from '../dom_components/view/ComponentView';
import EditorModel from '../editor/model/Editor';
import { isTextNode } from './dom';
import Component from '../dom_components/model/Component';
import { ObjectAny } from '../common';

export const wait = (mls: number = 0) => new Promise(res => setTimeout(res, mls));

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
const shallowDiff = (objOrig: ObjectAny, objNew: ObjectAny) => {
  const result: ObjectAny = {};
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

const hasDnd = (em: EditorModel) => {
  return 'draggable' in document.createElement('i') && (em ? em.config.nativeDnD! : true);
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

export const deepMerge = (...args: ObjectAny[]) => {
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

const isObject = (val: any): val is ObjectAny => val && !Array.isArray(val) && typeof val === 'object';
const isEmptyObj = (val: ObjectAny) => Object.keys(val).length <= 0;

const capitalize = (str: string = '') => str && str.charAt(0).toUpperCase() + str.substring(1);
const isRule = (obj: any) => obj && obj.toCSS;

const getViewEl = <T extends any>(el?: Node): T | undefined => (el as any)?.__gjsv;

export const isComponent = (obj: any): obj is Component => !!obj?.toHTML;

export const getComponentView = (el?: Node) => getViewEl<ComponentView>(el);

export const getComponentModel = (el?: Node) => getComponentView(el)?.model;

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
  hasDnd,
  upFirst,
  matches,
  getModel,
  camelCase,
  getElement,
  shallowDiff,
  normalizeFloat,
  getUnitFromValue,
  capitalize,
  getViewEl,
  setViewEl,
  appendStyles,
  isObject,
  isEmptyObj,
  createId,
  isRule,
};
