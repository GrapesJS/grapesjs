import { bindAll, isUndefined, each } from 'underscore';
import { Model } from '../../common';
import CssComposer from '../../css_composer';
import CssRule from '../../css_composer/model/CssRule';
import CssRules from '../../css_composer/model/CssRules';
import Component from '../../dom_components/model/Component';
import EditorModel from '../../editor/model/Editor';
import { hasWin } from '../../utils/mixins';

const maxValue = Number.MAX_VALUE;

export const getMediaLength = (mediaQuery: string) => {
  const length = /(-?\d*\.?\d+)\w{0,}/.exec(mediaQuery);
  return !length ? '' : length[0];
};

type CssGeneratorBuildOptions = {
  json?: boolean;
  em?: EditorModel;
  cssc?: CssComposer;
  clearStyles?: boolean;
  onlyMatched?: boolean;
  keepUnusedStyles?: boolean;
  rules?: CssRules;
};

type AtRules = Record<string, CssRule[]>;

export default class CssGenerator extends Model {
  compCls: string[];
  ids: string[];
  model?: Component;
  em?: EditorModel;

  constructor() {
    super();
    bindAll(this, 'sortRules');
    this.compCls = [];
    this.ids = [];
  }

  /**
   * Get CSS from a component
   * @param {Model} model
   * @return {String}
   */
  buildFromModel(model: Component, opts: CssGeneratorBuildOptions = {}) {
    let code = '';
    const em = this.em;
    const avoidInline = em && em.getConfig().avoidInlineStyle;
    const style = model.styleToString();
    const classes = model.get('classes');
    this.ids.push(`#${model.getId()}`);

    // Let's know what classes I've found
    classes.forEach((model: any) => this.compCls.push(model.getFullName()));

    if (!avoidInline && style) {
      code = `#${model.getId()}{${style}}`;
    }

    const components = model.components();
    components.forEach((model: Component) => (code += this.buildFromModel(model, opts)));
    return code;
  }

  build(model: Component, opts: CssGeneratorBuildOptions = {}) {
    const { json } = opts;
    const em = opts.em;
    const cssc = opts.cssc || em?.Css;
    this.em = em;
    this.compCls = [];
    this.ids = [];
    this.model = model;
    const codeJson: CssRule[] = [];
    let code = model ? this.buildFromModel(model, opts) : '';
    const clearStyles = isUndefined(opts.clearStyles) && em ? em.getConfig().clearStyles : opts.clearStyles;

    if (cssc) {
      let rules: CssRules | CssRule[] = opts.rules || cssc.getAll();
      const atRules: AtRules = {};
      const dump: CssRule[] = [];

      if (opts.onlyMatched && model && hasWin()) {
        rules = this.matchedRules(model, rules);
      }

      rules.forEach(rule => {
        const atRule = rule.getAtRule();

        if (atRule) {
          const mRules = atRules[atRule];
          if (mRules) {
            mRules.push(rule);
          } else {
            atRules[atRule] = [rule];
          }
          return;
        }

        const res = this.buildFromRule(rule, dump, opts);

        if (json) {
          codeJson.push(res as CssRule);
        } else {
          code += res;
        }
      });

      this.sortMediaObject(atRules).forEach(item => {
        let rulesStr = '';
        const atRule = item.key;
        const mRules = item.value;

        mRules.forEach(rule => {
          const ruleStr = this.buildFromRule(rule, dump, opts);

          if (rule.get('singleAtRule')) {
            code += `${atRule}{${ruleStr}}`;
          } else {
            rulesStr += ruleStr;
          }

          json && codeJson.push(ruleStr as CssRule);
        });

        if (rulesStr) {
          code += `${atRule}{${rulesStr}}`;
        }
      });

      // @ts-ignore
      em && clearStyles && rules.remove && rules.remove(dump);
    }

    return json ? codeJson.filter(r => r) : code;
  }

  /**
   * Get CSS from the rule model
   * @param {Model} rule
   * @return {string} CSS string
   */
  buildFromRule(rule: CssRule, dump: CssRule[], opts: CssGeneratorBuildOptions = {}) {
    let result: CssRule | string = '';
    const { model } = this;
    const selectorStrNoAdd = rule.selectorsToString({ skipAdd: 1 });
    const selectorsAdd = rule.get('selectorsAdd');
    const singleAtRule = rule.get('singleAtRule');
    let found;

    // This will not render a rule if there is no its component
    rule.get('selectors')?.forEach(selector => {
      const name = selector.getFullName();
      if (this.compCls.indexOf(name) >= 0 || this.ids.indexOf(name) >= 0 || opts.keepUnusedStyles) {
        found = 1;
      }
    });

    if ((selectorStrNoAdd && found) || selectorsAdd || singleAtRule || !model) {
      const block = rule.getDeclaration({ body: 1 });
      block && (opts.json ? (result = rule) : (result += block));
    } else {
      dump.push(rule);
    }

    return result;
  }

  /**
   * Get matched rules of a component
   * @param {Component} component
   * @param {Array<CSSRule>} rules
   * @returns {Array<CSSRule>}
   */
  matchedRules(component: Component, rules: CssRules) {
    const el = component.getEl();
    let result: CssRule[] = [];

    rules.forEach(rule => {
      try {
        if (
          rule
            .selectorsToString()
            .split(',')
            .some(selector => el.matches(this.__cleanSelector(selector)))
        ) {
          result.push(rule);
        }
      } catch (err) {}
    });

    component.components().forEach((component: Component) => {
      result = result.concat(this.matchedRules(component, rules));
    });

    // Remove duplicates
    result = result.filter((rule, i) => result.indexOf(rule) === i);

    return result;
  }

  /**
   * Get the numeric length of the media query string
   * @param  {String} mediaQuery Media query string
   * @return {Number}
   */
  getQueryLength(mediaQuery: string) {
    const length = /(-?\d*\.?\d+)\w{0,}/.exec(mediaQuery);
    if (!length) return maxValue;

    return parseFloat(length[1]);
  }

  /**
   * Return a sorted array from media query object
   * @param  {Object} items
   * @return {Array}
   */
  sortMediaObject(items: AtRules = {}) {
    const itemsArr: { key: string; value: CssRule[] }[] = [];
    each(items, (value, key) => itemsArr.push({ key, value }));
    return itemsArr.sort((a, b) => {
      const isMobFirst = [a.key, b.key].every(mquery => mquery.indexOf('min-width') !== -1);
      const left = isMobFirst ? a.key : b.key;
      const right = isMobFirst ? b.key : a.key;
      return this.getQueryLength(left) - this.getQueryLength(right);
    });
  }

  sortRules(a: CssRule, b: CssRule) {
    const getKey = (rule: CssRule) => rule.get('mediaText') || '';
    const isMobFirst = [getKey(a), getKey(b)].every(q => q.indexOf('min-width') !== -1);
    const left = isMobFirst ? getKey(a) : getKey(b);
    const right = isMobFirst ? getKey(b) : getKey(a);
    return this.getQueryLength(left) - this.getQueryLength(right);
  }

  /**
   * Return passed selector without states
   * @param {String} selector
   * @returns {String}
   * @private
   */
  __cleanSelector(selector: string) {
    return selector
      .split(' ')
      .map(item => item.split(':')[0])
      .join(' ');
  }
}
