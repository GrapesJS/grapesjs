/**
 * This module manages CSS rules in the canvas.
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/css_composer/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  cssComposer: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const css = editor.Css;
 * ```
 *
 * * [addRules](#addrules)
 * * [setRule](#setrule)
 * * [getRule](#getrule)
 * * [getRules](#getrules)
 * * [remove](#remove)
 * * [clear](#clear)
 *
 * [CssRule]: css_rule.html
 *
 * @module CssComposer
 */

import { isArray, isString, isUndefined, each } from 'underscore';
import { isObject } from 'utils/mixins';
import defaults from './config/config';
import CssRule from './model/CssRule';
import CssRules from './model/CssRules';
import CssRulesView from './view/CssRulesView';
import Selectors from 'selector_manager/model/Selectors';
import Selector from 'selector_manager/model/Selector';

export default () => {
  let em;
  var c = {};
  var rules, rulesView;

  return {
    Selectors,

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'CssComposer',

    getConfig() {
      return c;
    },

    /**
     * Mandatory for the storage manager
     * @type {String}
     * @private
     */
    storageKey() {
      var keys = [];
      var smc = (c.stm && c.stm.getConfig()) || {};
      if (smc.storeCss) keys.push('css');
      if (smc.storeStyles) keys.push('styles');
      return keys;
    },

    /**
     * Initializes module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     * @private
     */
    init(config) {
      c = config || {};
      for (var name in defaults) {
        if (!(name in c)) c[name] = defaults[name];
      }

      var ppfx = c.pStylePrefix;
      if (ppfx) c.stylePrefix = ppfx + c.stylePrefix;

      var elStyle = (c.em && c.em.config.style) || '';
      c.rules = elStyle || c.rules;

      em = c.em;
      rules = new CssRules([], c);
      return this;
    },

    /**
     * On load callback
     * @private
     */
    onLoad() {
      rules.add(c.rules, { silent: 1 });
    },

    /**
     * Do stuff after load
     * @param  {Editor} em
     * @private
     */
    postLoad() {
      const um = em && em.get('UndoManager');
      um && um.add(this.getAll());
    },

    /**
     * Load data from the passed object, if the object is empty will try to fetch them
     * autonomously from the storage manager.
     * The fetched data will be added to the collection
     * @param {Object} data Object of data to load
     * @return {Object} Loaded rules
     * @private
     */
    load(data) {
      var d = data || '';

      if (!d && c.stm) {
        d = c.em.getCacheLoad();
      }

      var obj = d.styles || '';

      if (d.styles) {
        try {
          obj = JSON.parse(d.styles);
        } catch (err) {}
      } else if (d.css) {
        obj = c.em.get('Parser').parseCss(d.css);
      }

      if (isArray(obj)) {
        obj.length && rules.reset(obj);
      } else if (obj) {
        rules.reset(obj);
      }

      return obj;
    },

    /**
     * Store data to the selected storage
     * @param {Boolean} noStore If true, won't store
     * @return {Object} Data to store
     * @private
     */
    store(noStore) {
      if (!c.stm) return;
      const obj = {};
      const keys = this.storageKey();
      const hasPages = em && em.get('hasPages');
      if (keys.indexOf('css') >= 0 && !hasPages) obj.css = c.em.getCss();
      if (keys.indexOf('styles') >= 0) obj.styles = JSON.stringify(rules);
      if (!noStore) c.stm.store(obj);
      return obj;
    },

    /**
     * Add new rule to the collection, if not yet exists with the same selectors
     * @param {Array<Selector>} selectors Array of selectors
     * @param {String} state Css rule state
     * @param {String} width For which device this style is oriented
     * @param {Object} props Other props for the rule
     * @param {Object} opts Options for the add of new rule
     * @return {Model}
     * @private
     * @example
     * var sm = editor.SelectorManager;
     * var sel1 = sm.add('myClass1');
     * var sel2 = sm.add('myClass2');
     * var rule = cssComposer.add([sel1, sel2], 'hover');
     * rule.set('style', {
     *   width: '100px',
     *   color: '#fff',
     * });
     * */
    add(selectors, state, width, opts = {}, addOpts = {}) {
      var s = state || '';
      var w = width || '';
      var opt = { ...opts };
      var rule = this.get(selectors, s, w, opt);

      // do not create rules that were found before
      // unless this is a single at-rule, for which multiple declarations
      // make sense (e.g. multiple `@font-type`s)
      if (rule && rule.config && !rule.config.singleAtRule) {
        return rule;
      } else {
        opt.state = s;
        opt.mediaText = w;
        opt.selectors = [];
        w && (opt.atRuleType = 'media');
        rule = new CssRule(opt, c);
        rule.get('selectors').add(selectors, addOpts);
        rules.add(rule, addOpts);
        return rule;
      }
    },

    /**
     * Get the rule
     * @param {String|Array<Selector>} selectors Array of selectors or selector string, eg `.myClass1.myClass2`
     * @param {String} state Css rule state, eg. 'hover'
     * @param {String} width Media rule value, eg. '(max-width: 992px)'
     * @param {Object} ruleProps Other rule props
     * @return  {Model|null}
     * @private
     * @example
     * const sm = editor.SelectorManager;
     * const sel1 = sm.add('myClass1');
     * const sel2 = sm.add('myClass2');
     * const rule = cssComposer.get([sel1, sel2], 'hover', '(max-width: 992px)');
     * // Update the style
     * rule.set('style', {
     *   width: '300px',
     *   color: '#000',
     * });
     * */
    get(selectors, state, width, ruleProps) {
      let slc = selectors;
      if (isString(selectors)) {
        const sm = em.get('SelectorManager');
        const singleSel = selectors.split(',')[0].trim();
        const node = em.get('Parser').parserCss.checkNode({ selectors: singleSel })[0];
        slc = sm.get(node.selectors);
      }
      return rules.find(rule => rule.compare(slc, state, width, ruleProps)) || null;
    },

    getAll() {
      return rules;
    },

    /**
     * Add a raw collection of rule objects
     * This method overrides styles, in case, of already defined rule
     * @param {String|Array<Object>} data CSS string or an array of rule objects, eg. [{selectors: ['class1'], style: {....}}, ..]
     * @param {Object} opts Options
     * @param {Object} props Additional properties to add on rules
     * @return {Array<Model>}
     * @private
     */
    addCollection(data, opts = {}, props = {}) {
      const result = [];

      if (isString(data)) {
        data = em.get('Parser').parseCss(data);
      }

      const d = data instanceof Array ? data : [data];

      for (var i = 0, l = d.length; i < l; i++) {
        var rule = d[i] || {};
        if (!rule.selectors) continue;
        var sm = c.em && c.em.get('SelectorManager');
        if (!sm) console.warn('Selector Manager not found');
        var sl = rule.selectors;
        var sels = sl instanceof Array ? sl : [sl];
        var newSels = [];

        for (var j = 0, le = sels.length; j < le; j++) {
          var selec = sm.add(sels[j]);
          newSels.push(selec);
        }

        var modelExists = this.get(newSels, rule.state, rule.mediaText, rule);
        var model = this.add(newSels, rule.state, rule.mediaText, rule, opts);
        var updateStyle = !modelExists || !opts.avoidUpdateStyle;
        const style = rule.style || {};

        isObject(props) && model.set(props, opts);

        if (updateStyle) {
          let styleUpdate = opts.extend ? { ...model.get('style'), ...style } : style;
          model.set('style', styleUpdate, opts);
        }

        result.push(model);
      }

      return result;
    },

    /**
     * Add CssRules via CSS string.
     * @param {String} css CSS string of rules to add.
     * @returns {Array<[CssRule]>} Array of rules
     * @example
     * const addedRules = css.addRules('.my-cls{ color: red } @media (max-width: 992px) { .my-cls{ color: darkred } }');
     * // Check rules
     * console.log(addedRules.map(rule => rule.toCSS()));
     */
    addRules(css) {
      return this.addCollection(css);
    },

    /**
     * Add/update the CssRule.
     * @param {String} selectors Selector string, eg. `.myclass`
     * @param {Object} style  Style properties and values
     * @param {Object} [opts={}]  Additional properties
     * @param {String} [opts.atRuleType='']  At-rule type, eg. `media`
     * @param {String} [opts.atRuleParams='']  At-rule parameters, eg. `(min-width: 500px)`
     * @returns {[CssRule]} The new/updated CssRule
     * @example
     * // Simple class-based rule
     * const rule = css.setRule('.class1.class2', { color: 'red' });
     * console.log(rule.toCSS()) // output: .class1.class2 { color: red }
     * // With state and other mixed selector
     * const rule = css.setRule('.class1.class2:hover, div#myid', { color: 'red' });
     * // output: .class1.class2:hover, div#myid { color: red }
     * // With media
     * const rule = css.setRule('.class1:hover', { color: 'red' }, {
     *  atRuleType: 'media',
     *  atRuleParams: '(min-width: 500px)',
     * });
     * // output: @media (min-width: 500px) { .class1:hover { color: red } }
     */
    setRule(selectors, style, opts = {}) {
      const { atRuleType, atRuleParams } = opts;
      const node = em.get('Parser').parserCss.checkNode({
        selectors,
        style,
      })[0];
      const { state, selectorsAdd } = node;
      const sm = em.get('SelectorManager');
      const selector = sm.add(node.selectors);
      const rule = this.add(selector, state, atRuleParams, {
        selectorsAdd,
        atRule: atRuleType,
      });
      rule.setStyle(style, opts);
      return rule;
    },

    /**
     * Get the CssRule.
     * @param {String} selectors Selector string, eg. `.myclass:hover`
     * @param {Object} [opts={}]  Additional properties
     * @param {String} [opts.atRuleType='']  At-rule type, eg. `media`
     * @param {String} [opts.atRuleParams='']  At-rule parameters, eg. '(min-width: 500px)'
     * @returns {[CssRule]}
     * @example
     * const rule = css.getRule('.myclass1:hover');
     * const rule2 = css.getRule('.myclass1:hover, div#myid');
     * const rule3 = css.getRule('.myclass1', {
     *  atRuleType: 'media',
     *  atRuleParams: '(min-width: 500px)',
     * });
     */
    getRule(selectors, opts = {}) {
      const sm = em.get('SelectorManager');
      const node = em.get('Parser').parserCss.checkNode({ selectors })[0];
      const selector = sm.get(node.selectors);
      const { state, selectorsAdd } = node;
      const { atRuleType, atRuleParams } = opts;
      return (
        selector &&
        this.get(selector, state, atRuleParams, {
          selectorsAdd,
          atRule: atRuleType,
        })
      );
    },

    /**
     * Get all rules or filtered by a matching selector.
     * @param {String} [selector=''] Selector, eg. `.myclass`
     * @returns {Array<[CssRule]>}
     * @example
     * // Take all the component specific rules
     * const id = someComponent.getId();
     * const rules = css.getRules(`#${id}`);
     * console.log(rules.map(rule => rule.toCSS()))
     * // All rules in the project
     * console.log(css.getRules())
     */
    getRules(selector) {
      const rules = this.getAll();
      if (!selector) return [...rules.models];
      const sels = isString(selector) ? selector.split(',').map(s => s.trim()) : selector;
      const result = rules.filter(r => sels.indexOf(r.getSelectors().getFullString()) >= 0);
      return result;
    },

    /**
     * Add/update the CSS rule with id selector
     * @param {string} name Id selector name, eg. 'my-id'
     * @param {Object} style  Style properties and values
     * @param {Object} [opts={}]  Custom options, like `state` and `mediaText`
     * @return {CssRule} The new/updated rule
     * @private
     * @example
     * const rule = css.setIdRule('myid', { color: 'red' });
     * const ruleHover = css.setIdRule('myid', { color: 'blue' }, { state: 'hover' });
     * // This will add current CSS:
     * // #myid { color: red }
     * // #myid:hover { color: blue }
     */
    setIdRule(name, style = {}, opts = {}) {
      const { addOpts = {}, mediaText } = opts;
      const state = opts.state || '';
      const media = !isUndefined(mediaText) ? mediaText : em.getCurrentMedia();
      const sm = em.get('SelectorManager');
      const selector = sm.add({ name, type: Selector.TYPE_ID }, addOpts);
      const rule = this.add(selector, state, media, {}, addOpts);
      rule.setStyle(style, { ...opts, ...addOpts });
      return rule;
    },

    /**
     * Get the CSS rule by id selector
     * @param {string} name Id selector name, eg. 'my-id'
     * @param  {Object} [opts={}]  Custom options, like `state` and `mediaText`
     * @return {CssRule}
     * @private
     * @example
     * const rule = css.getIdRule('myid');
     * const ruleHover = css.setIdRule('myid', { state: 'hover' });
     */
    getIdRule(name, opts = {}) {
      const { mediaText } = opts;
      const state = opts.state || '';
      const media = !isUndefined(mediaText) ? mediaText : em.getCurrentMedia();
      const selector = em.get('SelectorManager').get(name, Selector.TYPE_ID);
      return selector && this.get(selector, state, media);
    },

    /**
     * Add/update the CSS rule with class selector
     * @param {string} name Class selector name, eg. 'my-class'
     * @param {Object} style  Style properties and values
     * @param {Object} [opts={}]  Custom options, like `state` and `mediaText`
     * @return {CssRule} The new/updated rule
     * @private
     * @example
     * const rule = css.setClassRule('myclass', { color: 'red' });
     * const ruleHover = css.setClassRule('myclass', { color: 'blue' }, { state: 'hover' });
     * // This will add current CSS:
     * // .myclass { color: red }
     * // .myclass:hover { color: blue }
     */
    setClassRule(name, style = {}, opts = {}) {
      const state = opts.state || '';
      const media = opts.mediaText || em.getCurrentMedia();
      const sm = em.get('SelectorManager');
      const selector = sm.add({ name, type: Selector.TYPE_CLASS });
      const rule = this.add(selector, state, media);
      rule.setStyle(style, opts);
      return rule;
    },

    /**
     * Get the CSS rule by class selector
     * @param {string} name Class selector name, eg. 'my-class'
     * @param  {Object} [opts={}]  Custom options, like `state` and `mediaText`
     * @return {CssRule}
     * @private
     * @example
     * const rule = css.getClassRule('myclass');
     * const ruleHover = css.getClassRule('myclass', { state: 'hover' });
     */
    getClassRule(name, opts = {}) {
      const state = opts.state || '';
      const media = opts.mediaText || em.getCurrentMedia();
      const selector = em.get('SelectorManager').get(name, Selector.TYPE_CLASS);
      return selector && this.get(selector, state, media);
    },

    /**
     * Remove rule, by CssRule or matching selector (eg. the selector will match also at-rules like `@media`)
     * @param {String|[CssRule]|Array<[CssRule]>} rule CssRule or matching selector.
     * @return {Array<[CssRule]>} Removed rules
     * @example
     * // Remove by CssRule
     * const toRemove = css.getRules('.my-cls');
     * css.remove(toRemove);
     * // Remove by selector
     * css.remove('.my-cls-2');
     */
    remove(rule, opts) {
      const toRemove = isString(rule) ? this.getRules(rule) : rule;
      const result = this.getAll().remove(toRemove, opts);
      return isArray(result) ? result : [result];
    },

    /**
     * Remove all rules
     * @return {this}
     */
    clear(opts = {}) {
      this.getAll().reset(null, opts);
      return this;
    },

    getComponentRules(cmp, opts = {}) {
      let { state, mediaText, current } = opts;
      if (current) {
        state = em.get('state') || '';
        mediaText = em.getCurrentMedia();
      }
      const id = cmp.getId();
      const rules = this.getAll().filter(r => {
        if (!isUndefined(state) && r.get('state') !== state) return;
        if (!isUndefined(mediaText) && r.get('mediaText') !== mediaText) return;
        return r.getSelectorsString() === `#${id}`;
      });
      return rules;
    },

    /**
     * Render the block of CSS rules
     * @return {HTMLElement}
     * @private
     */
    render() {
      rulesView && rulesView.remove();
      rulesView = new CssRulesView({
        collection: rules,
        config: c,
      });
      return rulesView.render().el;
    },

    destroy() {
      rules.reset();
      rules.stopListening();
      rulesView && rulesView.remove();
      [em, rules, rulesView].forEach(i => (i = null));
      c = {};
    },
  };
};
