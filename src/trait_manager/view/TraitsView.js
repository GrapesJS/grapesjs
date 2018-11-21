const DomainViews = require('domain_abstract/view/DomainViews');
const TraitView = require('./TraitView');
const TraitSelectView = require('./TraitSelectView');
const TraitCheckboxView = require('./TraitCheckboxView');
const TraitNumberView = require('./TraitNumberView');
const TraitColorView = require('./TraitColorView');
const TraitButtonView = require('./TraitButtonView');

module.exports = DomainViews.extend({
  itemView: TraitView,

  itemsView: {
    text: TraitView,
    number: TraitNumberView,
    select: TraitSelectView,
    checkbox: TraitCheckboxView,
    color: TraitColorView,
    button: TraitButtonView
  },

  initialize(o = {}) {
    const config = o.config || {};
    this.config = config;
    this.em = o.editor;
    this.pfx = config.stylePrefix || '';
    this.ppfx = config.pStylePrefix || '';
    this.className = this.pfx + 'traits';
    const toListen = 'component:toggled';
    this.listenTo(this.em, toListen, this.updatedCollection);
    this.updatedCollection();
  },

  /**
   * Update view collection
   * @private
   */
  updatedCollection() {
    const ppfx = this.ppfx;
    const comp = this.em.getSelected();
    this.el.className = `${this.className} ${ppfx}one-bg ${ppfx}two-color`;
    this.collection = comp ? comp.get('traits') : [];
    this.render();
  }
});
