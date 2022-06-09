import { isEmpty, forEach, isString, isArray } from 'underscore';
import { Model } from '../../common';
import StyleableModel from '../../domain_abstract/model/StyleableModel';
import Selectors from '../../selector_manager/model/Selectors';
import { getMediaLength } from '../../code_manager/model/CssGenerator';
import { isEmptyObj, hasWin } from '../../utils/mixins';

const { CSS } = hasWin() ? window : {};

/**
 * @typedef CssRule
 * @property {Array<Selector>} selectors Array of selectors
 * @property {Object} style Object containing style definitions
 * @property {String} [selectorsAdd=''] Additional string css selectors
 * @property {String} [atRuleType=''] Type of at-rule, eg. `media`, 'font-face'
 * @property {String} [mediaText=''] At-rule value, eg. `(max-width: 1000px)`
 * @property {Boolean} [singleAtRule=false] This property is used only on at-rules, like 'page' or 'font-face', where the block containes only style declarations
 * @property {String} [state=''] State of the rule, eg: `hover`, `focused`
 * @property {Boolean|Array<String>} [important=false] If true, sets `!important` on all properties. You can also pass an array to specify properties on which use important
 * @property {Boolean} [stylable=true] Indicates if the rule is stylable from the editor
 *
 * [Device]: device.html
 * [State]: state.html
 * [Component]: component.html
 */
export default class CssRule extends StyleableModel {
  defaults() {
    return {
      selectors: [],
      selectorsAdd: '',
      style: {},
      mediaText: '',
      state: '',
      stylable: true,
      atRuleType: '',
      singleAtRule: false,
      important: false,
      group: '',
      // If true, won't be stored in JSON or showed in CSS
      shallow: false,
      _undo: true,
    };
  }

  initialize(c, opt = {}) {
    this.config = c || {};
    this.opt = opt;
    this.em = opt.em;
    this.ensureSelectors();
    this.on('change', this.__onChange);
  }

  __onChange(m, opts) {
    const { em } = this;
    const changed = this.changedAttributes();
    !isEmptyObj(changed) && em && em.changesUp(opts);
  }

  clone() {
    const opts = { ...this.opt };
    const attr = { ...this.attributes };
    attr.selectors = this.get('selectors').map(s => s.clone());
    return new this.constructor(attr, opts);
  }

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
  }

  /**
   * Returns the at-rule statement when exists, eg. `@media (...)`, `@keyframes`
   * @returns {String}
   * @example
   * const cssRule = editor.Css.setRule('.class1', { color: 'red' }, {
   *  atRuleType: 'media',
   *  atRuleParams: '(min-width: 500px)'
   * });
   * cssRule.getAtRule(); // "@media (min-width: 500px)"
   */
  getAtRule() {
    const type = this.get('atRuleType');
    const condition = this.get('mediaText');
    // Avoid breaks with the last condition
    const typeStr = type ? `@${type}` : condition ? '@media' : '';

    return typeStr + (condition && typeStr ? ` ${condition}` : '');
  }

  /**
   * Return selectors of the rule as a string
   * @param {Object} [opts] Options
   * @param {Boolean} [opts.skipState] Skip state from the result
   * @returns {String}
   * @example
   * const cssRule = editor.Css.setRule('.class1:hover', { color: 'red' });
   * cssRule.selectorsToString(); // ".class1:hover"
   * cssRule.selectorsToString({ skipState: true }); // ".class1"
   */
  selectorsToString(opts = {}) {
    const result = [];
    const state = this.get('state');
    const addSelector = this.get('selectorsAdd');
    const selOpts = {
      escape: str => (CSS && CSS.escape ? CSS.escape(str) : str),
    };
    const selectors = this.get('selectors').getFullString(0, selOpts);
    const stateStr = state && !opts.skipState ? `:${state}` : '';
    selectors && result.push(`${selectors}${stateStr}`);
    addSelector && !opts.skipAdd && result.push(addSelector);
    return result.join(', ');
  }

  /**
   * Get declaration block (without the at-rule statement)
   * @param {Object} [opts={}] Options (same as in `selectorsToString`)
   * @returns {String}
   * @example
   * const cssRule = editor.Css.setRule('.class1', { color: 'red' }, {
   *  atRuleType: 'media',
   *  atRuleParams: '(min-width: 500px)'
   * });
   * cssRule.getDeclaration() // ".class1{color:red;}"
   */
  getDeclaration(opts = {}) {
    let result = '';
    const { important } = this.attributes;
    const selectors = this.selectorsToString(opts);
    const style = this.styleToString({ important, ...opts });
    const singleAtRule = this.get('singleAtRule');

    if ((selectors || singleAtRule) && (style || opts.allowEmpty)) {
      result = singleAtRule ? style : `${selectors}{${style}}`;
    }

    return result;
  }

  /**
   * Get the Device the rule is related to.
   * @returns {[Device]|null}
   * @example
   * const device = rule.getDevice();
   * console.log(device?.getName());
   */
  getDevice() {
    const { em } = this;
    const { atRuleType, mediaText } = this.attributes;
    const devices = em?.get('DeviceManager').getDevices() || [];
    const deviceDefault = devices.filter(d => d.getWidthMedia() === '')[0];
    if (atRuleType !== 'media' || !mediaText) {
      return deviceDefault || null;
    }
    return devices.filter(d => d.getWidthMedia() === getMediaLength(mediaText))[0] || null;
  }

  /**
   * Get the State the rule is related to.
   * @returns {[State]|null}
   * @example
   * const state = rule.getState();
   * console.log(state?.getLabel());
   */
  getState() {
    const { em } = this;
    const stateValue = this.get('state');
    const states = em.get('SelectorManager').getStates() || [];
    return states.filter(s => s.getName() === stateValue)[0] || null;
  }

  /**
   * Returns the related Component (valid only for component-specific rules).
   * @returns {[Component]|null}
   * @example
   * const cmp = rule.getComponent();
   * console.log(cmp?.toHTML());
   */
  getComponent() {
    const sel = this.getSelectors();
    const sngl = sel.length == 1 && sel.at(0);
    const cmpId = sngl && sngl.isId() && sngl.get('name');
    return (cmpId && this.em?.get('DomComponents').getById(cmpId)) || null;
  }

  /**
   * Return the CSS string of the rule
   * @param {Object} [opts={}] Options (same as in `getDeclaration`)
   * @return {String} CSS string
   * @example
   * const cssRule = editor.Css.setRule('.class1', { color: 'red' }, {
   *  atRuleType: 'media',
   *  atRuleParams: '(min-width: 500px)'
   * });
   * cssRule.toCSS() // "@media (min-width: 500px){.class1{color:red;}}"
   */
  toCSS(opts = {}) {
    let result = '';
    const atRule = this.getAtRule();
    const block = this.getDeclaration(opts);
    if (block || opts.allowEmpty) {
      result = block;
    }

    if (atRule && result) {
      result = `${atRule}{${result}}`;
    }

    return result;
  }

  toJSON(...args) {
    const obj = Model.prototype.toJSON.apply(this, args);

    if (this.em.getConfig().avoidDefaults) {
      const defaults = this.defaults();

      forEach(defaults, (value, key) => {
        if (obj[key] === value) {
          delete obj[key];
        }
      });

      // Delete the property used for partial updates
      delete obj.style.__p;

      if (isEmpty(obj.selectors)) delete obj.selectors;
      if (isEmpty(obj.style)) delete obj.style;
    }

    return obj;
  }

  /**
   * Compare the actual model with parameters
   * @param {Object} selectors Collection of selectors
   * @param {String} state Css rule state
   * @param {String} width For which device this style is oriented
   * @param {Object} ruleProps Other rule props
   * @returns  {Boolean}
   * @private
   */
  compare(selectors, state, width, ruleProps = {}) {
    const st = state || '';
    const wd = width || '';
    const selAdd = ruleProps.selectorsAdd || '';
    let atRule = ruleProps.atRuleType || '';
    const sel = !isArray(selectors) && !selectors.models ? [selectors] : selectors.models || selectors;

    // Fix atRuleType in case is not specified with width
    if (wd && !atRule) atRule = 'media';

    const a1 = sel.map(model => model.getFullName());
    const a2 = this.get('selectors').map(model => model.getFullName());

    // Check selectors
    const a1S = a1.slice().sort();
    const a2S = a2.slice().sort();
    if (a1.length !== a2.length || !a1S.every((v, i) => v === a2S[i])) {
      return false;
    }

    // Check other properties
    if (
      this.get('state') !== st ||
      this.get('mediaText') !== wd ||
      this.get('selectorsAdd') !== selAdd ||
      this.get('atRuleType') !== atRule
    ) {
      return false;
    }

    return true;
  }
}
