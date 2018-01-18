import { extend } from 'underscore';

const SectorView = require('./SectorView');

module.exports = Backbone.View.extend({
  initialize(o) {
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.target = o.target || {};

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
      'change:selectedComponent component:update:classes component:update:state change:device';
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
    this.listenTo(this.target, events, this.targetUpdated);
  },

  /**
   * Add to collection
   * @param {Object} model Model
   * @return {Object}
   * @private
   * */
  addTo(model) {
    this.addToCollection(model);
  },

  /**
   * Fired when target is updated
   * @private
   */
  targetUpdated() {
    const em = this.target;
    const pt = this.propTarget;
    let model = em.getSelected();
    if (!model) return;

    const config = em.get('Config');
    const state = !config.devicePreviewMode ? model.get('state') : '';
    const el = model.getEl();
    pt.helper = null;

    // Create computed style container
    if (el) {
      const stateStr = state ? `:${state}` : null;
      pt.computed = window.getComputedStyle(el, stateStr);
    }

    // Create a new rule for the state as a helper
    const appendStateRule = (style = {}) => {
      const cc = em.get('CssComposer');
      const helperCls = 'hc-state';
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

    model = em.get('StyleManager').getModelToStyle(model);
    state && appendStateRule(model.getStyle());
    pt.model = model;
    pt.trigger('update');
  },

  /**
   * Add new object to collection
   * @param {Object} model Model
   * @param  {Object} fragmentEl collection
   * @return {Object} Object created
   * @private
   * */
  addToCollection(model, fragmentEl) {
    var fragment = fragmentEl || null;
    var view = new SectorView({
      model,
      id:
        this.pfx +
        model
          .get('name')
          .replace(' ', '_')
          .toLowerCase(),
      name: model.get('name'),
      properties: model.get('properties'),
      target: this.target,
      propTarget: this.propTarget,
      config: this.config
    });
    var rendered = view.render().el;

    if (fragment) {
      fragment.appendChild(rendered);
    } else {
      this.$el.append(rendered);
    }

    return rendered;
  },

  render() {
    var fragment = document.createDocumentFragment();
    this.$el.empty();

    this.collection.each(function(model) {
      this.addToCollection(model, fragment);
    }, this);

    this.$el.attr('id', this.pfx + 'sectors');
    this.$el.append(fragment);
    return this;
  }
});
