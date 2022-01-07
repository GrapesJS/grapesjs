import Backbone from 'backbone';
import { extend, isString, isArray } from 'underscore';
import { appendAtIndex } from 'utils/dom';
import SectorView from './SectorView';

export default Backbone.View.extend({
  initialize(o = {}) {
    const config = o.config || {};
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.target = o.target || {};
    this.config = config;
    const { module, em } = o;
    this.module = module;
    this.em = em;

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
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
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
          rule = rules.filter(rule => rule.get('selectors').getFullString() === target)[0];
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
      config,
    }).render().el;
    appendAtIndex(appendTo, rendered, opts.at);

    return rendered;
  },

  render() {
    const { $el, pfx, ppfx } = this;
    $el.empty();
    const frag = document.createDocumentFragment();
    this.collection.each(model => this.addToCollection(model, frag));
    $el.append(frag);
    $el.addClass(`${pfx}sectors ${ppfx}one-bg ${ppfx}two-color`);
    return this;
  },
});
