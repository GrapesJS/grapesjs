import { keys } from 'underscore';

// At-rules
// https://developer.mozilla.org/it/docs/Web/API/CSSRule#Type_constants
const atRules = {
  4: 'media',
  5: 'font-face',
  6: 'page',
  7: 'keyframes',
  11: 'counter-style',
  12: 'supports',
  13: 'document',
  14: 'font-feature-values',
  15: 'viewport'
};
const atRuleKeys = keys(atRules);
const singleAtRules = ['5', '6', '11', '15'];

module.exports = config => ({
  /**
   * Parse selector string to array.
   * Only classe based are valid as CSS rules inside editor, not valid
   * selectors will be dropped as additional
   * It's ok with the last part of the string as state (:hover, :active)
   * @param  {string} str Selectors string
   * @return {Object}
   * @example
   * var res = ParserCss.parseSelector('.test1, .test1.test2, .test2 .test3');
   * console.log(res);
   * // {
   * //result: [['test1'], ['test1', 'test2']],
   * //add: ['.test2 .test3']
   * //}
   */
  parseSelector(str = '') {
    const add = [];
    const result = [];
    const sels = str.split(',');

    for (var i = 0, len = sels.length; i < len; i++) {
      var sel = sels[i].trim();

      // Will accept only concatenated classes and last
      // class might be with state (eg. :hover), nothing else.
      // Can also accept SINGLE ID selectors, eg. `#myid`, `#myid:hover`
      // Composed are not valid: `#myid.some-class`, `#myid.some-class:hover`
      if (
        /^(\.{1}[\w\-]+)+(:{1,2}[\w\-()]+)?$/gi.test(sel) ||
        /^(#{1}[\w\-]+){1}(:{1,2}[\w\-()]+)?$/gi.test(sel)
      ) {
        var cls = sel.split('.').filter(Boolean);
        result.push(cls);
      } else {
        add.push(sel);
      }
    }

    return {
      result,
      add
    };
  },

  /**
   * Parse style declarations of the node
   * @param {CSSRule} node
   * @return {Object}
   */
  parseStyle(node) {
    const stl = node.style;
    const style = {};

    for (var i = 0, len = stl.length; i < len; i++) {
      const propName = stl[i];
      const propValue = stl.getPropertyValue(propName);
      const important = stl.getPropertyPriority(propName);
      style[propName] = `${propValue}${important ? ` !${important}` : ''}`;
    }

    return style;
  },

  /**
   * Get the condition when possible
   * @param  {CSSRule} node
   * @return {string}
   */
  parseCondition(node) {
    const condition =
      node.conditionText ||
      (node.media && node.media.mediaText) ||
      node.name ||
      node.selectorText ||
      '';
    return condition.trim();
  },

  /**
   * Fetch data from node
   * @param  {StyleSheet|CSSRule} el
   * @return {Array<Object>}
   */
  parseNode(el) {
    var result = [];
    var nodes = el.cssRules || [];

    for (var i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];
      const type = node.type.toString();
      let singleAtRule = 0;
      let atRuleType = '';
      let condition = '';
      // keyText is for CSSKeyframeRule
      let sels = node.selectorText || node.keyText;
      const isSingleAtRule = singleAtRules.indexOf(type) >= 0;

      // Check if the node is an at-rule
      if (isSingleAtRule) {
        singleAtRule = 1;
        atRuleType = atRules[type];
        condition = this.parseCondition(node);
      } else if (atRuleKeys.indexOf(type) >= 0) {
        var subRules = this.parseNode(node);
        condition = this.parseCondition(node);

        for (var s = 0, lens = subRules.length; s < lens; s++) {
          var subRule = subRules[s];
          condition && (subRule.mediaText = condition);
          subRule.atRuleType = atRules[type];
        }
        result = result.concat(subRules);
      }

      if (!sels && !isSingleAtRule) continue;
      const style = this.parseStyle(node);
      const selsParsed = this.parseSelector(sels);
      const selsAdd = selsParsed.add;
      sels = selsParsed.result;

      let lastRule;
      // For each group of selectors
      for (var k = 0, len3 = sels.length; k < len3; k++) {
        var selArr = sels[k];
        var model = {};
        singleAtRule && (model.singleAtRule = singleAtRule);
        atRuleType && (model.atRuleType = atRuleType);

        //Isolate state from selector
        var stateArr = selArr[selArr.length - 1].split(/:(.+)/);
        if (stateArr[1]) {
          selArr[selArr.length - 1] = stateArr[0];
          model.state = stateArr[1];
          stateArr.splice(stateArr.length - 1, 1);
        }

        model.selectors = selArr;
        model.style = style;
        lastRule = model;
        result.push(model);
      }

      // Need to push somewhere not class-based selectors, if some rule was
      // created will push them there, otherwise will create a new rule
      if (selsAdd.length) {
        var selsAddStr = selsAdd.join(', ');
        if (lastRule) {
          lastRule.selectorsAdd = selsAddStr;
        } else {
          const model = {
            selectors: [],
            selectorsAdd: selsAddStr,
            style
          };
          singleAtRule && (model.singleAtRule = singleAtRule);
          atRuleType && (model.atRuleType = atRuleType);
          condition && (model.mediaText = condition);
          result.push(model);
        }
      }
      // console.log('LAST PUSH', result[result.length - 1]);
    }

    return result;
  },

  /**
   * Parse CSS string to a desired model object
   * @param  {string} str HTML string
   * @return {Object|Array<Object>}
   */
  parse(str) {
    const el = document.createElement('style');
    el.innerHTML = str;

    // There is no .sheet before adding it to the <head>
    document.head.appendChild(el);
    const sheet = el.sheet;
    document.head.removeChild(el);
    const result = this.parseNode(sheet);

    return result.length == 1 ? result[0] : result;
  }
});
