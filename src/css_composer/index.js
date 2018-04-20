/**
 * This module contains and manage CSS rules for the template inside the canvas
 * Before using the methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var cssComposer = editor.CssComposer;
 * ```
 *
 * @module CssComposer
 * @param {Object} config Configurations
 * @param {string|Array<Object>} [config.rules=[]] CSS string or an array of rule objects
 * @example
 * ...
 * CssComposer: {
 *    rules: '.myClass{ color: red}',
 * }
 */
import { isArray } from 'underscore';

module.exports = () => {
  let em;
  var c = {},
    defaults = require('./config/config'),
    CssRule = require('./model/CssRule'),
    CssRules = require('./model/CssRules'),
    CssRulesView = require('./view/CssRulesView');
  const Selectors = require('selector_manager/model/Selectors');
  const Selector = require('selector_manager/model/Selector');

  var rules, rulesView;

  return {
    Selectors,

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'CssComposer',

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
      rules.add(c.rules);
    },

    /**
     * Do stuff after load
     * @param  {Editor} em
     * @private
     */
    postLoad(em) {
      const ev = 'add remove';
      const rules = this.getAll();
      const um = em.get('UndoManager');
      um && um.add(rules);
      em.stopListening(rules, ev, this.handleChange);
      em.listenTo(rules, ev, this.handleChange);
      rules.each(rule => this.handleChange(rule, { avoidStore: 1 }));
    },

    /**
     * Handle rule changes
     * @private
     */
    handleChange(model, opts = {}) {
      const ev = 'change:style';
      const um = em.get('UndoManager');
      um && um.add(model);
      const handleUpdates = em.handleUpdates.bind(em);
      em.stopListening(model, ev, handleUpdates);
      em.listenTo(model, ev, handleUpdates);
      !opts.avoidStore && handleUpdates('', '', opts);
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
      var obj = {};
      var keys = this.storageKey();
      if (keys.indexOf('css') >= 0) obj.css = c.em.getCss();
      if (keys.indexOf('styles') >= 0) obj.styles = JSON.stringify(rules);
      if (!noStore) c.stm.store(obj);
      return obj;
    },

    /**
     * Add new rule to the collection, if not yet exists with the same selectors
     * @param {Array<Selector>} selectors Array of selectors
     * @param {String} state Css rule state
     * @param {String} width For which device this style is oriented
     * @param {Object} opts Other options for the rule
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
    add(selectors, state, width, opts = {}) {
      var s = state || '';
      var w = width || '';
      var opt = { ...opts };
      var rule = this.get(selectors, s, w, opt);

      // do not create rules that were found before
      // unless this is an at-rule, for which multiple declarations
      // make sense (e.g. multiple `@font-type`s)
      if (rule && rule.config && !rule.config.atRuleType) {
        return rule;
      } else {
        opt.state = s;
        opt.mediaText = w;
        opt.selectors = '';
        rule = new CssRule(opt, c);
        rule.get('selectors').add(selectors);
        rules.add(rule);
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
    clear() {
      this.getAll().reset();
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
        var model = this.add(newSels, rule.state, rule.mediaText, rule);
        var updateStyle = !modelExists || !opts.avoidUpdateStyle;
        const style = rule.style || {};

        if (updateStyle) {
          let styleUpdate = opts.extend
            ? { ...model.get('style'), ...style }
            : style;
          model.set('style', styleUpdate);
        }

        result.push(model);
      }

      return result;
    },

    /**
     * Add/update the CSS rule with id selector
     * @param {string} name Id selector name, eg. 'my-id'
     * @param {Object} style  Style properties and values
     * @param {Object} [opts={}]  Custom options, like `state` and `mediaText`
     * @return {CssRule} The new/updated rule
     * @example
     * const rule = cc.setIdRule('myid', { color: 'red' });
     * const ruleHover = cc.setIdRule('myid', { color: 'blue' }, { state: 'hover' });
     * // This will add current CSS:
     * // #myid { color: red }
     * // #myid:hover { color: blue }
     */
    setIdRule(name, style = {}, opts = {}) {
      const state = opts.state || '';
      const media = opts.mediaText || em.getCurrentMedia();
      const sm = em.get('SelectorManager');
      const selector = sm.add({ name, type: Selector.TYPE_ID });
      const rule = this.add(selector, state, media);
      rule.setStyle(style, opts);
      return rule;
    },

    /**
     * Get the CSS rule by id selector
     * @param {string} name Id selector name, eg. 'my-id'
     * @param  {Object} [opts={}]  Custom options, like `state` and `mediaText`
     * @return {CssRule}
     * @example
     * const rule = cc.getIdRule('myid');
     * const ruleHover = cc.setIdRule('myid', { state: 'hover' });
     */
    getIdRule(name, opts = {}) {
      const state = opts.state || '';
      const media = opts.mediaText || em.getCurrentMedia();
      const selector = em.get('SelectorManager').get(name, Selector.TYPE_ID);
      return selector && this.get(selector, state, media);
    },

    /**
     * Add/update the CSS rule with class selector
     * @param {string} name Class selector name, eg. 'my-class'
     * @param {Object} style  Style properties and values
     * @param {Object} [opts={}]  Custom options, like `state` and `mediaText`
     * @return {CssRule} The new/updated rule
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

    /**
     * Render the block of CSS rules
     * @return {HTMLElement}
     * @private
     */
    render() {
      return rulesView.render().el;
    }
  };
};
