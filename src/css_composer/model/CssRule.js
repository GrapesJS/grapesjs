import { map } from 'underscore';
import Backbone from 'backbone';
import Styleable from 'domain_abstract/model/Styleable';
import { isEmpty, forEach, isString } from 'underscore';
import Selectors from 'selector_manager/model/Selectors';
import { isEmptyObj } from 'utils/mixins';

const { CSS } = window;

export default Backbone.Model.extend(Styleable).extend({
  defaults: {
    // Css selectors
    selectors: [],

    // Additional string css selectors
    selectorsAdd: '',

    // Css properties style
    style: {},

    // On which device width this rule should be rendered, eg. @media (max-width: 1000px)
    mediaText: '',

    // State of the rule, eg: hover | pressed | focused
    state: '',

    // Indicates if the rule is stylable
    stylable: true,

    // Type of at-rule, eg. 'media', 'font-face', etc.
    atRuleType: '',

    // This particolar property is used only on at-rules, like 'page' or
    // 'font-face', where the block containes only style declarations
    singleAtRule: 0,

    // If true, sets '!important' on all properties
    // You can use an array to specify properties to set important
    // Used in view
    important: 0,

    _undo: true
  },

  initialize(c, opt = {}) {
    this.config = c || {};
    this.opt = opt;
    this.em = opt.em;
    this.ensureSelectors();
    this.on('change', this.__onChange);
  },

  __onChange(m, opts) {
    const { em } = this;
    const changed = this.changedAttributes();
    !isEmptyObj(changed) && em && em.changesUp(opts);
  },

  clone() {
    const opts = { ...this.opt };
    const attr = { ...this.attributes };
    attr.selectors = this.get('selectors').map(s => s.clone());
    return new this.constructor(attr, opts);
  },

  ensureSelectors(m, c, opts) {
    const { em } = this;
    const sm = em && em.get('SelectorManager');
    const toListen = [this, 'change:selectors', this.ensureSelectors];
    let sels = this.getSelectors();
    this.stopListening(...toListen);

    if (sels.models) {
      sels = [...sels.models];
    }

    sels = isString(sels) ? [sels] : sels;

    if (Array.isArray(sels)) {
      const res = sels.filter(i => i).map(i => (sm ? sm.add(i) : i));
      sels = new Selectors(res);
    }

    this.set('selectors', sels, opts);
    this.listenTo(...toListen);
  },

  /**
   * Returns an at-rule statement if possible, eg. '@media (...)', '@keyframes'
   * @return {string}
   */
  getAtRule() {
    const type = this.get('atRuleType');
    const condition = this.get('mediaText');
    // Avoid breaks with the last condition
    const typeStr = type ? `@${type}` : condition ? '@media' : '';

    return typeStr + (condition && typeStr ? ` ${condition}` : '');
  },

  /**
   * Return selectors fo the rule as a string
   * @return {string}
   */
  selectorsToString(opts = {}) {
    const result = [];
    const state = this.get('state');
    const wrapper = this.get('wrapper');
    const addSelector = this.get('selectorsAdd');
    const isBody = wrapper && opts.body;
    const selOpts = {
      escape: str => (CSS && CSS.escape ? CSS.escape(str) : str)
    };
    const selectors = isBody
      ? 'body'
      : this.get('selectors').getFullString(0, selOpts);
    const stateStr = state && !opts.skipState ? `:${state}` : '';
    selectors && result.push(`${selectors}${stateStr}`);
    addSelector && !opts.skipAdd && result.push(addSelector);
    return result.join(', ');
  },

  /**
   * Get declaration block
   * @param {Object} [opts={}] Options
   * @return {string}
   */
  getDeclaration(opts = {}) {
    let result = '';
    const selectors = this.selectorsToString(opts);
    const style = this.styleToString(opts);
    const singleAtRule = this.get('singleAtRule');

    if ((selectors || singleAtRule) && style) {
      result = singleAtRule ? style : `${selectors}{${style}}`;
    }

    return result;
  },

  /**
   * Returns CSS string of the rule
   * @param {Object} [opts={}] Options
   * @return {string}
   */
  toCSS(opts = {}) {
    let result = '';
    const atRule = this.getAtRule();
    const block = this.getDeclaration(opts);
    block && (result = block);

    if (atRule && result) {
      result = `${atRule}{${result}}`;
    }

    return result;
  },

  toJSON(...args) {
    const obj = Backbone.Model.prototype.toJSON.apply(this, args);

    if (this.em.getConfig('avoidDefaults')) {
      const defaults = this.defaults;

      forEach(defaults, (value, key) => {
        if (obj[key] === value) {
          delete obj[key];
        }
      });

      if (isEmpty(obj.selectors)) delete obj.selectors;
      if (isEmpty(obj.style)) delete obj.style;
    }

    return obj;
  },

  /**
   * Compare the actual model with parameters
   * @param   {Object} selectors Collection of selectors
   * @param   {String} state Css rule state
   * @param   {String} width For which device this style is oriented
   * @param {Object} ruleProps Other rule props
   * @return  {Boolean}
   * @private
   */
  compare(selectors, state, width, ruleProps = {}) {
    var st = state || '';
    var wd = width || '';
    var selectorsAdd = ruleProps.selectorsAdd || '';
    var atRuleType = ruleProps.atRuleType || '';
    if (!(selectors instanceof Array) && !selectors.models)
      selectors = [selectors];
    var a1 = map(selectors.models || selectors, model => model.getFullName());
    var a2 = map(this.get('selectors').models, model => model.getFullName());
    var f = false;

    if (a1.length !== a2.length) return f;

    for (var i = 0; i < a1.length; i++) {
      var re = 0;
      for (var j = 0; j < a2.length; j++) {
        if (a1[i] === a2[j]) re = 1;
      }
      if (re === 0) return f;
    }

    if (
      this.get('state') !== st ||
      this.get('mediaText') !== wd ||
      this.get('selectorsAdd') !== selectorsAdd ||
      this.get('atRuleType') !== atRuleType
    ) {
      return f;
    }

    return true;
  }
});
