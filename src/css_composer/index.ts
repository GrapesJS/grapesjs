/**
 * This module manages CSS rules in the canvas.
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/GrapesJS/grapesjs/blob/master/src/css_composer/config/config.ts)
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
 * @module Css
 */

import { isArray, isString, isUndefined } from 'underscore';
import { isObject } from '../utils/mixins';
import Selectors from '../selector_manager/model/Selectors';
import Selector from '../selector_manager/model/Selector';
import defaults, { CssComposerConfig } from './config/config';
import CssRule, { CssRuleJSON, CssRuleProperties } from './model/CssRule';
import CssRules from './model/CssRules';
import CssRulesView from './view/CssRulesView';
import { ItemManagerModule } from '../abstract/Module';
import EditorModel from '../editor/model/Editor';
import Component from '../dom_components/model/Component';
import { ObjectAny, PrevToNewIdMap } from '../common';

/** @private */
interface RuleOptions {
  /**
   * At-rule type, eg. `media`
   */
  atRuleType?: string;
  /**
   * At-rule parameters, eg. `(min-width: 500px)`
   */
  atRuleParams?: string;
}

/** @private */
interface SetRuleOptions extends RuleOptions {
  /**
   * If the rule exists already, merge passed styles instead of replacing them.
   */
  addStyles?: boolean;
}

/** @private */
export interface GetSetRuleOptions {
  state?: string;
  mediaText?: string;
  addOpts?: ObjectAny;
  current?: boolean;
}

type CssRuleStyle = Required<CssRuleProperties>['style'];

export default class CssComposer extends ItemManagerModule<CssComposerConfig & { pStylePrefix?: string }> {
  rules: CssRules;
  rulesView?: CssRulesView;

  Selectors = Selectors;

  storageKey = 'styles';

  /**
   * Initializes module. Automatically called with a new instance of the editor
   * @param {Object} config Configurations
   * @private
   */
  constructor(em: EditorModel) {
    super(em, 'CssComposer', null, {}, defaults);
    const { config } = this;

    const ppfx = config.pStylePrefix;
    if (ppfx) config.stylePrefix = ppfx + config.stylePrefix;

    // @ts-ignore
    config.rules = this.em.config.style || config.rules || '';

    this.rules = new CssRules([], config);
  }

  /**
   * On load callback
   * @private
   */
  onLoad() {
    this.rules.add(this.config.rules, { silent: true });
  }

  /**
   * Do stuff after load
   * @param  {Editor} em
   * @private
   */
  postLoad() {
    const um = this.em?.get('UndoManager');
    um && um.add(this.getAll());
  }

  store() {
    return this.getProjectData();
  }

  load(data: any) {
    return this.loadProjectData(data, {
      // @ts-ignore Fix add() first in CssRules
      all: this.rules,
    });
  }

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
  add(selectors: any, state?: string, width?: string, opts = {}, addOpts = {}) {
    const s = state || '';
    const w = width || '';
    const opt = { ...opts } as CssRuleProperties;
    let rule = this.get(selectors, s, w, opt);

    // do not create rules that were found before
    // unless this is a single at-rule, for which multiple declarations
    // make sense (e.g. multiple `@font-type`s)
    if (rule && rule.config && !rule.config.singleAtRule) {
      return rule;
    } else {
      opt.state = s;
      opt.mediaText = w;
      opt.selectors = [];
      // #4727: Prevent updating atRuleType if already defined
      if (w && !opt.atRuleType) {
        opt.atRuleType = 'media';
      }
      rule = new CssRule(opt, this.config);
      // @ts-ignore
      rule.get('selectors').add(selectors, addOpts);
      this.rules.add(rule, addOpts);
      return rule;
    }
  }

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
  get(
    selectors: any,
    state?: string,
    width?: string,
    ruleProps?: Omit<CssRuleProperties, 'selectors'>
  ): CssRule | undefined {
    let slc = selectors;
    if (isString(selectors)) {
      const sm = this.em.Selectors;
      const singleSel = selectors.split(',')[0].trim();
      const node = this.em.Parser.parserCss.checkNode({ selectors: singleSel } as any)[0];
      slc = sm.get(node.selectors as string[]);
    }
    return this.rules.find(rule => rule.compare(slc, state, width, ruleProps)) || null;
  }

  getAll() {
    return this.rules;
  }

  /**
   * Add a raw collection of rule objects
   * This method overrides styles, in case, of already defined rule
   * @param {String|Array<Object>} data CSS string or an array of rule objects, eg. [{selectors: ['class1'], style: {....}}, ..]
   * @param {Object} opts Options
   * @param {Object} props Additional properties to add on rules
   * @return {Array<Model>}
   * @private
   */
  addCollection(data: string | CssRuleJSON[], opts: Record<string, any> = {}, props = {}) {
    const { em } = this;
    const result: CssRule[] = [];

    if (isString(data)) {
      data = em.Parser.parseCss(data);
    }

    const d = data instanceof Array ? data : [data];

    for (var i = 0, l = d.length; i < l; i++) {
      const rule = (d[i] || {}) as CssRuleJSON;
      if (!rule.selectors) continue;

      const sm = em?.Selectors;
      if (!sm) console.warn('Selector Manager not found');
      const sl = rule.selectors;
      const sels = sl instanceof Array ? sl : [sl];
      const newSels = [];

      for (let j = 0, le = sels.length; j < le; j++) {
        // @ts-ignore
        const selec = sm.add(sels[j]);
        newSels.push(selec);
      }

      const modelExists = this.get(newSels, rule.state, rule.mediaText, rule);
      const model = this.add(newSels, rule.state, rule.mediaText, rule, opts);
      const updateStyle = !modelExists || !opts.avoidUpdateStyle;
      const style = rule.style || {};

      isObject(props) && model.set(props, opts);

      if (updateStyle) {
        const styleUpdate = opts.extend ? { ...model.get('style'), ...style } : style;
        model.set('style', styleUpdate, opts);
      }

      result.push(model);
    }

    return result;
  }

  /**
   * Add CssRules via CSS string.
   * @param {String} css CSS string of rules to add.
   * @returns {Array<[CssRule]>} Array of rules
   * @example
   * const addedRules = css.addRules('.my-cls{ color: red } @media (max-width: 992px) { .my-cls{ color: darkred } }');
   * // Check rules
   * console.log(addedRules.map(rule => rule.toCSS()));
   */
  addRules(css: string) {
    return this.addCollection(css);
  }

  /**
   * Add/update the CssRule.
   * @param {String} selectors Selector string, eg. `.myclass`
   * @param {Object} style  Style properties and values. If the rule exists, styles will be replaced unless `addStyles` option is used.
   * @param {Object} [opts={}]  Additional properties.
   * @param {String} [opts.atRuleType='']  At-rule type, eg. `media`.
   * @param {String} [opts.atRuleParams='']  At-rule parameters, eg. `(min-width: 500px)`.
   * @param {Boolean} [opts.addStyles=false] If the rule exists already, merge passed styles instead of replacing them.
   * @returns {[CssRule]} The new/updated CssRule.
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
   * // output: `@media (min-width: 500px) { .class1:hover { color: red } }`
   *
   * // Update styles of existent rule
   * css.setRule('.class1', { color: 'red', background: 'red' });
   * css.setRule('.class1', { color: 'blue' }, { addStyles: true });
   * // output: .class1 { color: blue; background: red }
   */
  setRule(selectors: any, style: CssRuleProperties['style'] = {}, opts: SetRuleOptions = {}) {
    const { atRuleType, atRuleParams } = opts;
    const node = this.em.Parser.parserCss.checkNode({
      selectors,
      style,
    })[0];
    const { state, selectorsAdd } = node;
    const sm = this.em.Selectors;
    const selector = sm.add(node.selectors as any);
    const rule = this.add(selector, state, atRuleParams, {
      selectorsAdd,
      atRule: atRuleType,
    });

    if (opts.addStyles) {
      rule.addStyle(style, opts);
    } else {
      rule.setStyle(style, opts);
    }

    return rule;
  }

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
  getRule(selectors: any, opts: RuleOptions = {}) {
    const { em } = this;
    const sm = em.Selectors;
    const node = em.Parser.parserCss.checkNode({ selectors })[0];
    // @ts-ignore
    const selector = sm.get(node.selectors);
    const { state, selectorsAdd } = node;
    const { atRuleType, atRuleParams } = opts;
    return selector
      ? this.get(selector, state, atRuleParams, {
          selectorsAdd,
          atRuleType,
        })
      : undefined;
  }

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
  getRules(selector: string) {
    const rules = this.getAll();
    if (!selector) return [...rules.models];
    const optRuleSel = { sort: true };
    const sels = isString(selector) ? selector.split(',').map(s => s.trim()) : selector;
    const result = rules.filter(r => sels.indexOf(r.getSelectors().getFullString(null, optRuleSel)) >= 0);
    return result;
  }

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
  setIdRule(name: string, style: CssRuleStyle = {}, opts: GetSetRuleOptions = {}) {
    const { addOpts = {}, mediaText } = opts;
    const state = opts.state || '';
    const media = !isUndefined(mediaText) ? mediaText : this.em.getCurrentMedia();
    const sm = this.em.Selectors;
    const selector = sm.add({ name, type: Selector.TYPE_ID }, addOpts);
    const rule = this.add(selector, state, media, {}, addOpts);
    rule.setStyle(style, { ...opts, ...addOpts });
    return rule;
  }

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
  getIdRule(name: string, opts: GetSetRuleOptions = {}) {
    const { mediaText } = opts;
    const state = opts.state || '';
    const media = !isUndefined(mediaText) ? mediaText : this.em.getCurrentMedia();
    const selector = this.em.Selectors.get(name, Selector.TYPE_ID);
    return selector && this.get(selector, state, media);
  }

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
  setClassRule(name: string, style: CssRuleStyle = {}, opts: GetSetRuleOptions = {}) {
    const state = opts.state || '';
    const media = opts.mediaText || this.em.getCurrentMedia();
    const sm = this.em.Selectors;
    const selector = sm.add({ name, type: Selector.TYPE_CLASS });
    const rule = this.add(selector, state, media);
    rule.setStyle(style, opts);
    return rule;
  }

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
  getClassRule(name: string, opts: GetSetRuleOptions = {}) {
    const state = opts.state || '';
    const media = opts.mediaText || this.em.getCurrentMedia();
    const selector = this.em.Selectors.get(name, Selector.TYPE_CLASS);
    return selector && this.get(selector, state, media);
  }

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
  remove(rule: string | CssRule, opts?: any) {
    const toRemove = isString(rule) ? this.getRules(rule) : rule;
    const result = this.getAll().remove(toRemove, opts);
    return isArray(result) ? result : [result];
  }

  /**
   * Remove all rules
   * @return {this}
   */
  clear(opts = {}) {
    this.getAll().reset([], opts);
    return this;
  }

  getComponentRules(cmp: Component, opts: GetSetRuleOptions = {}) {
    let { state, mediaText, current } = opts;
    if (current) {
      state = this.em.get('state') || '';
      mediaText = this.em.getCurrentMedia();
    }
    const id = cmp.getId();
    const rules = this.getAll().filter(r => {
      if (!isUndefined(state) && r.get('state') !== state) return false;
      if (!isUndefined(mediaText) && r.get('mediaText') !== mediaText) return false;
      return r.getSelectorsString() === `#${id}`;
    });
    return rules;
  }

  /**
   * Render the block of CSS rules
   * @return {HTMLElement}
   * @private
   */
  render() {
    this.rulesView?.remove();
    this.rulesView = new CssRulesView({
      collection: this.rules,
      config: this.config,
    });
    return this.rulesView.render().el;
  }

  checkId(rule: CssRuleJSON | CssRuleJSON[], opts: { idMap?: PrevToNewIdMap } = {}) {
    const { idMap = {} } = opts;
    const changed: CssRuleJSON[] = [];

    if (!Object.keys(idMap).length) return changed;

    const rules = Array.isArray(rule) ? rule : [rule];
    rules.forEach(rule => {
      const sel = rule.selectors;

      if (sel && sel.length == 1) {
        const sSel = sel[0];

        if (isString(sSel)) {
          if (sSel[0] === '#') {
            const prevId = sSel.substring(1);
            const newId = idMap[prevId];
            if (prevId && newId) {
              sel[0] = `#${newId}`;
              changed.push(rule);
            }
          }
        } else if (sSel.name && sSel.type === Selector.TYPE_ID) {
          const newId = idMap[sSel.name];
          if (newId) {
            sSel.name = newId;
            changed.push(rule);
          }
        }
      }
    });

    return changed;
  }

  destroy() {
    this.rules.reset();
    this.rules.stopListening();
    this.rulesView?.remove();
  }
}
