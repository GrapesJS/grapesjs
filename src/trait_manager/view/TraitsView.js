var DomainViews = require('domain_abstract/view/DomainViews');
var TraitView = require('./TraitView');
var TraitSelectView = require('./TraitSelectView');
var TraitCheckboxView = require('./TraitCheckboxView');
var TraitNumberView = require('./TraitNumberView');
var TraitColorView = require('./TraitColorView');

module.exports = DomainViews.extend({
  itemView: TraitView,

  itemsView: {
    text: TraitView,
    number: TraitNumberView,
    select: TraitSelectView,
    checkbox: TraitCheckboxView,
    color: TraitColorView
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

    if (comp) {
      this.collection = comp.get('traits');
      this.render();
    }
  }
});
