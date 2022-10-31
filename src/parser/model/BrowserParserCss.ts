import { keys } from 'underscore';
import { CssRuleProperties } from '../../css_composer/model/CssRule';

// At-rules
// https://developer.mozilla.org/it/docs/Web/API/CSSRule#Type_constants
const atRules: Record<string, string> = {
  4: 'media',
  5: 'font-face',
  6: 'page',
  7: 'keyframes',
  11: 'counter-style',
  12: 'supports',
  13: 'document',
  14: 'font-feature-values',
  15: 'viewport',
};
const atRuleKeys = keys(atRules);
const singleAtRules = ['5', '6', '11', '15'];
const singleAtRulesNames = ['font-face', 'page', 'counter-style', 'viewport'];

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
export const parseStyle = (node: CSSRule) => {
  // @ts-ignore
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
export const createNode = (selectors: string[], style = {}, opts = {}): CssRuleProperties => {
  const node: Partial<CssRuleProperties> = {};
  const selLen = selectors.length;
  const lastClass = selectors[selLen - 1];
  const stateArr = lastClass ? lastClass.split(/:(.+)/) : [];
  const state = stateArr[1];
  // @ts-ignore
  const { atRule, selectorsAdd, mediaText } = opts;
  const singleAtRule = singleAtRulesNames.indexOf(atRule) >= 0;
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

  // @ts-ignore
  node.selectors = selectors;
  node.style = style;

  return node as CssRuleProperties;
};

/**
 * Fetch data from node
 * @param  {StyleSheet|CSSRule} el
 * @return {Array<Object>}
 */
export const parseNode = (el: CSSStyleSheet | CSSRule) => {
  let result: CssRuleProperties[] = [];
  const nodes = (el as CSSStyleSheet).cssRules || [];

  for (let i = 0, len = nodes.length; i < len; i++) {
    const node: CSSRule = nodes[i];
    const type = node.type.toString();
    let singleAtRule = false;
    let atRuleType = '';
    let condition = '';
    // @ts-ignore keyText is for CSSKeyframeRule
    let sels: string = node.selectorText || node.keyText;
    const isSingleAtRule = singleAtRules.indexOf(type) >= 0;

    // Check if the node is an at-rule
    if (isSingleAtRule) {
      singleAtRule = true;
      atRuleType = atRules[type];
      condition = parseCondition(node);
    } else if (atRuleKeys.indexOf(type) >= 0) {
      const subRules = parseNode(node);
      condition = parseCondition(node);

      for (let s = 0, lens = subRules.length; s < lens; s++) {
        const subRule = subRules[s];
        condition && (subRule.mediaText = condition);
        subRule.atRuleType = atRules[type];
      }
      result = result.concat(subRules);
    }

    if (!sels && !isSingleAtRule) continue;

    const style = parseStyle(node);
    const selsParsed = parseSelector(sels);
    const selsAdd = selsParsed.add;
    const selsArr: string[][] = selsParsed.result;

    let lastRule;
    // For each group of selectors
    for (let k = 0, len3 = selsArr.length; k < len3; k++) {
      const model = createNode(selsArr[k], style, {
        atRule: atRules[type],
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
        const model: CssRuleProperties = {
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
  const sheet = el.sheet!;
  document.head.removeChild(el);

  return parseNode(sheet);
};
