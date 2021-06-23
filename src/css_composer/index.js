/**
 * This module contains and manage CSS rules for the template inside the canvas.
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
 * const cssComposer = editor.CssComposer;
 * ```
 *
 * * [load](#load)
 * * [store](#store)
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [clear](#clear)
 * * [setRule](#setrule)
 * * [getRule](#getrule)
 *
 * @module CssComposer
 */

import { isArray, isUndefined } from 'underscore';
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
      rulesView = new CssRulesView({
        collection: rules,
        config: c
      });
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
        rule = new CssRule(opt, c);
        rule.get('selectors').add(selectors, addOpts);
        rules.add(rule, addOpts);
        return rule;
      }
    },

    /**
     * Get the rule
     * @param {Array<Selector>} selectors Array of selectors
     * @param {String} state Css rule state
     * @param {String} width For which device this style is oriented
     * @param {Object} ruleProps Other rule props
     * @return  {Model|null}
     * @example
     * var sm = editor.SelectorManager;
     * var sel1 = sm.add('myClass1');
     * var sel2 = sm.add('myClass2');
     * var rule = cssComposer.get([sel1, sel2], 'hover');
     * // Update the style
     * rule.set('style', {
     *   width: '300px',
     *   color: '#000',
     * });
     * */
    get(selectors, state, width, ruleProps) {
      var rule = null;
      rules.each(m => {
        if (rule) return;
        if (m.compare(selectors, state, width, ruleProps)) rule = m;
      });
      return rule;
    },

    /**
     * Get the collection of rules
     * @return {Collection}
     * */
    getAll() {
      return rules;
    },

    /**
     * Remove all rules
     * @return {this}
     */
    clear(opts = {}) {
      this.getAll().reset(null, opts);
      return this;
    },

    /**
     * Add a raw collection of rule objects
     * This method overrides styles, in case, of already defined rule
     * @param {Array<Object>} data Array of rule objects, eg . [{selectors: ['class1'], style: {....}}, ..]
     * @param {Object} opts Options
     * @return {Array<Model>}
     * @private
     */
    addCollection(data, opts = {}) {
      var result = [];
      var d = data instanceof Array ? data : [data];

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

        if (updateStyle) {
          let styleUpdate = opts.extend
            ? { ...model.get('style'), ...style }
            : style;
          model.set('style', styleUpdate, opts);
        }

        result.push(model);
      }

      return result;
    },

    /**
     * Add/update the CSS rule with a generic selector
     * @param {string} selectors Selector, eg. '.myclass'
     * @param {Object} style  Style properties and values
     * @param {Object} [opts={}]  Additional properties
     * @param {String} [opts.atRuleType='']  At-rule type, eg. 'media'
     * @param {String} [opts.atRuleParams='']  At-rule parameters, eg. '(min-width: 500px)'
     * @return {CssRule} The new/updated rule
     * @example
     * // Simple class-based rule
     * const rule = cc.setRule('.class1.class2', { color: 'red' });
     * console.log(rule.toCSS()) // output: .class1.class2 { color: red }
     * // With state and other mixed selector
     * const rule = cc.setRule('.class1.class2:hover, div#myid', { color: 'red' });
     * // output: .class1.class2:hover, div#myid { color: red }
     * // With media
     * const rule = cc.setRule('.class1:hover', { color: 'red' }, {
     *  atRuleType: 'media',
     *  atRuleParams: '(min-width: 500px)',
     * });
     * // output: @media (min-width: 500px) { .class1:hover { color: red } }
     */
    setRule(selectors, style, opts = {}) {
      const { atRuleType, atRuleParams } = opts;
      const node = em.get('Parser').parserCss.checkNode({
        selectors,
        style
      })[0];
      const { state, selectorsAdd } = node;
      const sm = em.get('SelectorManager');
      const selector = sm.add(node.selectors);
      const rule = this.add(selector, state, atRuleParams, {
        selectorsAdd,
        atRule: atRuleType
      });
      rule.setStyle(style, opts);
      return rule;
    },

    /**
     * Get the CSS rule by a generic selector
     * @param {string} selectors Selector, eg. '.myclass:hover'
     * @param {String} [opts.atRuleType='']  At-rule type, eg. 'media'
     * @param {String} [opts.atRuleParams='']  At-rule parameters, eg. '(min-width: 500px)'
     * @return {CssRule}
     * @example
     * const rule = cc.getRule('.myclass1:hover');
     * const rule2 = cc.getRule('.myclass1:hover, div#myid');
     * const rule3 = cc.getRule('.myclass1', {
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
          atRule: atRuleType
        })
      );
    },

    /**
     * Find rules, in different states (eg. like `:hover`) and media queries, matching the selector.
     * @param {string} selector Selector, eg. '.myclass'
     * @returns {Array<CssRule>}
     * @example
     * // Common scenario, take all the component specific rules
     * const id = someComponent.getId();
     * const rules = cc.getRules(`#${id}`);
     * console.log(rules.map(rule => rule.toCSS()))
     */
    getRules(selector) {
      const rules = this.getAll();
      const result = rules.filter(
        r => r.getSelectors().getFullString() === selector
      );
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
     * const rule = cc.setIdRule('myid', { color: 'red' });
     * const ruleHover = cc.setIdRule('myid', { color: 'blue' }, { state: 'hover' });
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
     * const rule = cc.getIdRule('myid');
     * const ruleHover = cc.setIdRule('myid', { state: 'hover' });
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
     * const rule = cc.setClassRule('myclass', { color: 'red' });
     * const ruleHover = cc.setClassRule('myclass', { color: 'blue' }, { state: 'hover' });
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
     * const rule = cc.getClassRule('myclass');
     * const ruleHover = cc.getClassRule('myclass', { state: 'hover' });
     */
    getClassRule(name, opts = {}) {
      const state = opts.state || '';
      const media = opts.mediaText || em.getCurrentMedia();
      const selector = em.get('SelectorManager').get(name, Selector.TYPE_CLASS);
      return selector && this.get(selector, state, media);
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
      return rulesView.render().el;
    },

    destroy() {
      rules.reset();
      rules.stopListening();
      rulesView.remove();
      [em, rules, rulesView].forEach(i => (i = null));
      c = {};
    }
  };
};
