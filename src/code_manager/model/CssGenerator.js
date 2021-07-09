import Backbone from 'backbone';
import { bindAll, isUndefined, each } from 'underscore';

const maxValue = Number.MAX_VALUE;

export default Backbone.Model.extend({
  initialize() {
    bindAll(this, 'sortRules');
    this.compCls = [];
    this.ids = [];
  },

  /**
   * Get CSS from a component
   * @param {Model} model
   * @return {String}
   */
  buildFromModel(model, opts = {}) {
    let code = '';
    const em = this.em;
    const avoidInline = em && em.getConfig('avoidInlineStyle');
    const style = model.styleToString();
    const classes = model.get('classes');
    const wrapperIsBody = opts.wrapperIsBody;
    const isWrapper = model.get('wrapper');
    this.ids.push(`#${model.getId()}`);

    // Let's know what classes I've found
    classes.each(model => this.compCls.push(model.getFullName()));

    if (!avoidInline && style) {
      let selector = `#${model.getId()}`;
      selector = wrapperIsBody && isWrapper ? 'body' : selector;
      code = `${selector}{${style}}`;
    }

    const components = model.components();
    components.each(model => (code += this.buildFromModel(model, opts)));
    return code;
  },

  build(model, opts = {}) {
    const { json } = opts;
    const em = opts.em || '';
    const cssc = opts.cssc || (em && em.get('CssComposer'));
    this.em = em;
    this.compCls = [];
    this.ids = [];
    this.model = model;
    const codeJson = [];
    let code = model ? this.buildFromModel(model, opts) : '';
    const clearStyles =
      isUndefined(opts.clearStyles) && em
        ? em.getConfig('clearStyles')
        : opts.clearStyles;

    if (cssc) {
      const rules = opts.rules || cssc.getAll();
      const atRules = {};
      const dump = [];

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
          codeJson.push(res);
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

          json && codeJson.push(ruleStr);
        });

        if (rulesStr) {
          code += `${atRule}{${rulesStr}}`;
        }
      });

      em && clearStyles && rules.remove && rules.remove(dump);
    }

    return json ? codeJson.filter(r => r) : code;
  },

  /**
   * Get CSS from the rule model
   * @param {Model} rule
   * @return {string} CSS string
   */
  buildFromRule(rule, dump, opts = {}) {
    let result = '';
    const { model } = this;
    const selectorStrNoAdd = rule.selectorsToString({ skipAdd: 1 });
    const selectorsAdd = rule.get('selectorsAdd');
    const singleAtRule = rule.get('singleAtRule');
    let found;

    // This will not render a rule if there is no its component
    rule.get('selectors').each(selector => {
      const name = selector.getFullName();
      if (
        this.compCls.indexOf(name) >= 0 ||
        this.ids.indexOf(name) >= 0 ||
        opts.keepUnusedStyles
      ) {
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
  },

  /**
   * Get the numeric length of the media query string
   * @param  {String} mediaQuery Media query string
   * @return {Number}
   */
  getQueryLength(mediaQuery) {
    const length = /(-?\d*\.?\d+)\w{0,}/.exec(mediaQuery);
    if (!length) return maxValue;

    return parseFloat(length[1]);
  },

  /**
   * Return a sorted array from media query object
   * @param  {Object} items
   * @return {Array}
   */
  sortMediaObject(items = {}) {
    const itemsArr = [];
    each(items, (value, key) => itemsArr.push({ key, value }));
    return itemsArr.sort((a, b) => {
      const isMobFirst = [a.key, b.key].every(
        mquery => mquery.indexOf('min-width') !== -1
      );
      const left = isMobFirst ? a.key : b.key;
      const right = isMobFirst ? b.key : a.key;
      return this.getQueryLength(left) - this.getQueryLength(right);
    });
  },

  sortRules(a, b) {
    const getKey = rule => rule.get('mediaText');
    const isMobFirst = [getKey(a), getKey(b)].every(
      q => q.indexOf('min-width') !== -1
    );
    const left = isMobFirst ? getKey(a) : getKey(b);
    const right = isMobFirst ? getKey(b) : getKey(a);
    return this.getQueryLength(left) - this.getQueryLength(right);
  }
});
