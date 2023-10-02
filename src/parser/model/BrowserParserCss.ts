import { keys } from 'underscore';
import { CssRuleJSON } from '../../css_composer/model/CssRule';
import { ObjectStrings } from '../../common';

/** @see https://developer.mozilla.org/en-US/docs/Web/API/CSSRule/type */
const CSS_RULE_TYPES = {
  STYLE_RULE: 1,
  CHARSET_RULE: 2,
  IMPORT_RULE: 3,
  MEDIA_RULE: 4,
  FONT_FACE_RULE: 5,
  PAGE_RULE: 6,
  KEYFRAMES_RULE: 7,
  KEYFRAME_RULE: 8,
  NAMESPACE_RULE: 10,
  COUNTER_STYLE_RULE: 11,
  SUPPORTS_RULE: 12,
  DOCUMENT_RULE: 13,
  FONT_FEATURE_VALUES_RULE: 14,
  VIEWPORT_RULE: 15,
  REGION_STYLE_RULE: 16,
};

/** @see https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule  */
const AT_RULE_NAMES: ObjectStrings = {
  [CSS_RULE_TYPES.MEDIA_RULE]: 'media',
  [CSS_RULE_TYPES.FONT_FACE_RULE]: 'font-face',
  [CSS_RULE_TYPES.PAGE_RULE]: 'page',
  [CSS_RULE_TYPES.KEYFRAMES_RULE]: 'keyframes',
  [CSS_RULE_TYPES.COUNTER_STYLE_RULE]: 'counter-style',
  [CSS_RULE_TYPES.SUPPORTS_RULE]: 'supports',
  [CSS_RULE_TYPES.DOCUMENT_RULE]: 'document',
  [CSS_RULE_TYPES.FONT_FEATURE_VALUES_RULE]: 'font-feature-values',
  [CSS_RULE_TYPES.VIEWPORT_RULE]: 'viewport',
};

const AT_RULE_KEYS = keys(AT_RULE_NAMES);

const SINGLE_AT_RULE_TYPES = [
  CSS_RULE_TYPES.FONT_FACE_RULE,
  CSS_RULE_TYPES.PAGE_RULE,
  CSS_RULE_TYPES.COUNTER_STYLE_RULE,
  CSS_RULE_TYPES.VIEWPORT_RULE,
];

const NESTABLE_AT_RULE_NAMES = AT_RULE_KEYS.filter(i => SINGLE_AT_RULE_TYPES.indexOf(Number(i)) < 0)
  .map(i => AT_RULE_NAMES[i])
  .concat(['container', 'layer']);

const SINGLE_AT_RULE_NAMES = SINGLE_AT_RULE_TYPES.map(n => AT_RULE_NAMES[n]);

/**
 * Parse selector string to array.
 * Only classe based are valid as CSS rules inside editor, not valid
 * selectors will be dropped as additional
 * It's ok with the last part of the string as state (:hover, :active)
 * @param  {string} str Selectors string
 * @return {Object}
 * @example
 * var res = parseSelector('.test1, .test1.test2, .test2 .test3');
 * console.log(res);
 * // { result: [['test1'], ['test1', 'test2']], add: ['.test2 .test3'] }
 */
export const parseSelector = (str = '') => {
  const add: string[] = [];
  const result: string[][] = [];
  const sels = str.split(',');

  for (var i = 0, len = sels.length; i < len; i++) {
    var sel = sels[i].trim();

    // Will accept only concatenated classes and last
    // class might be with state (eg. :hover), nothing else.
    // Can also accept SINGLE ID selectors, eg. `#myid`, `#myid:hover`
    // Composed are not valid: `#myid.some-class`, `#myid.some-class:hover`
    if (/^(\.{1}[\w\-]+)+(:{1,2}[\w\-()]+)?$/gi.test(sel) || /^(#{1}[\w\-]+){1}(:{1,2}[\w\-()]+)?$/gi.test(sel)) {
      var cls = sel.split('.').filter(Boolean);
      result.push(cls);
    } else {
      add.push(sel);
    }
  }

  return {
    result,
    add,
  };
};

/**
 * Parse style declarations of the node.
 * @param {CSSRule} node
 * @return {Object}
 */
export const parseStyle = (node: CSSStyleRule) => {
  const stl = node.style;
  const style: Record<string, string> = {};

  for (var i = 0, len = stl.length; i < len; i++) {
    const propName = stl[i];
    const propValue = stl.getPropertyValue(propName);
    const important = stl.getPropertyPriority(propName);
    style[propName] = `${propValue}${important ? ` !${important}` : ''}`;
  }

  return style;
};

/**
 * Get the condition when possible
 * @param  {CSSRule} node
 * @return {string}
 */
export const parseCondition = (node: CSSRule): string => {
  // @ts-ignore
  const condition = node.conditionText || (node.media && node.media.mediaText) || node.name || node.selectorText || '';
  return condition.trim();
};

/**
 * Create node for the editor
 * @param  {Array<String>} selectors Array containing strings of classes
 * @param {Object} style Key-value object of style declarations
 * @return {Object}
 */
export const createNode = (selectors: string[], style = {}, opts = {}): CssRuleJSON => {
  const node: Partial<CssRuleJSON> = {};
  const selLen = selectors.length;
  const lastClass = selectors[selLen - 1];
  const stateArr = lastClass ? lastClass.split(/:(.+)/) : [];
  const state = stateArr[1];
  // @ts-ignore
  const { atRule, selectorsAdd, mediaText } = opts;
  const singleAtRule = SINGLE_AT_RULE_NAMES.indexOf(atRule) >= 0;
  singleAtRule && (node.singleAtRule = true);
  atRule && (node.atRuleType = atRule);
  selectorsAdd && (node.selectorsAdd = selectorsAdd);
  mediaText && (node.mediaText = mediaText);

  // Isolate the state from selectors
  if (state) {
    selectors[selLen - 1] = stateArr[0];
    node.state = state;
    stateArr.splice(stateArr.length - 1, 1);
  }

  node.selectors = selectors;
  node.style = style;

  return node as CssRuleJSON;
};

export const getNestableAtRule = (node: CSSRule) => {
  const { cssText = '' } = node;
  return NESTABLE_AT_RULE_NAMES.find(name => cssText.indexOf(`@${name}`) === 0);
};

/**
 * Fetch data from node
 * @param  {StyleSheet|CSSRule} el
 * @return {Array<Object>}
 */
export const parseNode = (el: CSSStyleSheet | CSSRule) => {
  let result: CssRuleJSON[] = [];
  const nodes = (el as CSSStyleSheet).cssRules || [];

  for (let i = 0, len = nodes.length; i < len; i++) {
    const node = nodes[i];
    const { type } = node;
    let singleAtRule = false;
    let atRuleType = '';
    let condition = '';
    const sels = (node as CSSStyleRule).selectorText || (node as CSSKeyframeRule).keyText || '';
    const isSingleAtRule = SINGLE_AT_RULE_TYPES.indexOf(type) >= 0;

    // Check if the node is an at-rule
    if (isSingleAtRule) {
      singleAtRule = true;
      atRuleType = AT_RULE_NAMES[type];
      condition = parseCondition(node);
    } else if (AT_RULE_KEYS.indexOf(`${type}`) >= 0 || (!type && getNestableAtRule(node))) {
      const subRules = parseNode(node);
      const subAtRuleType = AT_RULE_NAMES[type] || getNestableAtRule(node);
      condition = parseCondition(node);

      for (let s = 0, lens = subRules.length; s < lens; s++) {
        const subRule = subRules[s];
        condition && (subRule.mediaText = condition);
        subRule.atRuleType = subAtRuleType;
      }
      result = result.concat(subRules);
    }

    if (!sels && !isSingleAtRule) continue;

    const style = parseStyle(node as CSSStyleRule);
    const selsParsed = parseSelector(sels);
    const selsAdd = selsParsed.add;
    const selsArr: string[][] = selsParsed.result;

    let lastRule;
    // For each group of selectors
    for (let k = 0, len3 = selsArr.length; k < len3; k++) {
      const model = createNode(selsArr[k], style, {
        atRule: AT_RULE_NAMES[type],
      });
      result.push(model);
      lastRule = model;
    }

    // Need to push somewhere not class-based selectors, if some rule was
    // created will push them there, otherwise will create a new rule
    if (selsAdd.length) {
      var selsAddStr = selsAdd.join(', ');
      if (lastRule) {
        lastRule.selectorsAdd = selsAddStr;
      } else {
        const model: CssRuleJSON = {
          selectors: [],
          selectorsAdd: selsAddStr,
          style,
        };
        singleAtRule && (model.singleAtRule = singleAtRule);
        atRuleType && (model.atRuleType = atRuleType);
        condition && (model.mediaText = condition);
        result.push(model);
      }
    }
  }

  return result;
};

/**
 * Parse CSS string and return the array of objects
 * @param  {String} str CSS string
 * @return {Array<Object>} Array of objects for the definition of CSSRules
 */
export default (str: string) => {
  const el = document.createElement('style');
  el.innerHTML = str;

  // There is no .sheet before adding it to the <head>
  document.head.appendChild(el);
  const sheet = el.sheet;
  document.head.removeChild(el);

  return sheet ? parseNode(sheet) : [];
};
