import Backbone from 'backbone';
import { extend, isString, isArray } from 'underscore';
import { isTaggableNode } from 'utils/mixins';
import { appendAtIndex } from 'utils/dom';
import SectorView from './SectorView';

const helperCls = 'hc-state';

export default Backbone.View.extend({
  initialize(o = {}) {
    const config = o.config || {};
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.target = o.target || {};
    this.config = config;

    // The target that will emit events for properties
    const target = {};
    extend(target, Backbone.Events);
    const body = document.body;
    const dummy = document.createElement(`el-${new Date().getTime()}`);
    body.appendChild(dummy);
    target.computedDefault = { ...window.getComputedStyle(dummy) };
    body.removeChild(dummy);
    this.propTarget = target;
    const coll = this.collection;
    const events =
      'component:toggled component:update:classes change:state change:device frame:resized';
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
    this.listenTo(this.target, events, this.targetUpdated);
  },

  remove() {
    Backbone.View.prototype.remove.apply(this, arguments);
    ['target', 'config', 'propTarget'].forEach(i => (this[i] = {}));
  },

  /**
   * Add to collection
   * @param {Object} model Model
   * @return {Object}
   * @private
   * */
  addTo(model, coll, opts = {}) {
    this.addToCollection(model, null, opts);
  },

  toggleStateCls(targets = [], enable) {
    targets.forEach(trg => {
      const el = trg.getEl();
      el && el.classList && el.classList[enable ? 'add' : 'remove'](helperCls);
    });
  },

  /**
   * Fired when target is updated
   * @private
   */
  targetUpdated(trg) {
    const em = this.target;
    const pt = this.propTarget;
    const targets = em.getSelectedAll();
    let model = em.getSelected();
    const mdToClear = trg && !!trg.toHTML ? trg : model;

    // Clean components
    mdToClear && this.toggleStateCls([mdToClear]);
    if (!model) return;

    const config = em.get('Config');
    const state = !config.devicePreviewMode ? em.get('state') : '';
    const { componentFirst } = em.get('SelectorManager').getConfig();
    const el = model.getEl();
    pt.helper = null;
    pt.targets = null;

    // Create computed style container
    if (el && isTaggableNode(el)) {
      const stateStr = state ? `:${state}` : null;
      pt.computed = window.getComputedStyle(el, stateStr);
    }

    // Create a new rule for the state as a helper
    const appendStateRule = (style = {}) => {
      const cc = em.get('CssComposer');
      const rules = cc.getAll();
      let helperRule = cc.getClassRule(helperCls);

      if (!helperRule) {
        helperRule = cc.setClassRule(helperCls);
      } else {
        // I will make it last again, otherwise it could be overridden
        rules.remove(helperRule);
        rules.add(helperRule);
      }

      helperRule.set('important', 1);
      helperRule.setStyle(style);
      pt.helper = helperRule;
    };

    const sm = em.get('StyleManager');
    const target = sm.getModelToStyle(model);

    if (state) {
      appendStateRule(target.getStyle());
      this.toggleStateCls(targets, 1);
    }

    pt.model = target;
    pt.parentRules = sm.getParentRules(target, state);
    if (componentFirst) {
      pt.targets = targets.map(t => sm.getModelToStyle(t)).filter(Boolean);
    }
    pt.trigger('update');
  },

  /**
   * Select different target for the Style Manager.
   * It could be a Component, CSSRule, or a string of any CSS selector
   * @param {Component|CSSRule|String|Array<Component|CSSRule|String>} target
   * @return {Array<Styleable>} Array of Components/CSSRules
   */
  setTarget(target, opts = {}) {
    const em = this.target;
    const trgs = isArray(target) ? target : [target];
    const { targetIsClass, stylable } = opts;
    const models = [];

    trgs.forEach(target => {
      let model = target;

      if (isString(target)) {
        let rule;
        const rules = em.get('CssComposer').getAll();

        if (targetIsClass) {
          rule = rules.filter(
            rule => rule.get('selectors').getFullString() === target
          )[0];
        }

        if (!rule) {
          rule = rules.filter(rule => rule.get('selectorsAdd') === target)[0];
        }

        if (!rule) {
          rule = rules.add({ selectors: [], selectorsAdd: target });
        }

        stylable && rule.set({ stylable });
        model = rule;
      }

      models.push(model);
    });

    const pt = this.propTarget;
    pt.targets = models;
    pt.trigger('update', { targets: models });
    return models;
  },

  /**
   * Add new object to collection
   * @param {Object} model Model
   * @param  {Object} fragmentEl collection
   * @return {Object} Object created
   * @private
   * */
  addToCollection(model, fragmentEl, opts = {}) {
    const { pfx, target, propTarget, config, el } = this;
    const appendTo = fragmentEl || el;
    const rendered = new SectorView({
      model,
      id: `${pfx}${model.get('id')}`,
      name: model.get('name'),
      properties: model.get('properties'),
      target,
      propTarget,
      config
    }).render().el;
    appendAtIndex(appendTo, rendered, opts.at);

    return rendered;
  },

  render() {
    const frag = document.createDocumentFragment();
    const $el = this.$el;
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    $el.empty();
    this.collection.each(model => this.addToCollection(model, frag));
    $el.append(frag);
    $el.addClass(`${pfx}sectors ${ppfx}one-bg ${ppfx}two-color`);
    return this;
  }
});
