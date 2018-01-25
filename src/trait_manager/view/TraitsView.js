let DomainViews = require('domain_abstract/view/DomainViews');
let TraitView = require('./TraitView');
let TraitSelectView = require('./TraitSelectView');
let TraitCheckboxView = require('./TraitCheckboxView');
let TraitNumberView = require('./TraitNumberView');
let TraitColorView = require('./TraitColorView');

module.exports = DomainViews.extend({
  itemView: TraitView,

  itemsView: {
    text: TraitView,
    number: TraitNumberView,
    select: TraitSelectView,
    checkbox: TraitCheckboxView,
    color: TraitColorView
  },

  initialize(o) {
    this.config = o.config || {};
    this.em = o.editor;
    this.pfx = this.config.stylePrefix || '';
    this.className = this.pfx + 'traits';
    this.listenTo(this.em, 'change:selectedComponent', this.updatedCollection);
    this.updatedCollection();
  },

  /**
   * Update view collection
   * @private
   */
  updatedCollection() {
    this.el.className = this.className;
    let comp = this.em.get('selectedComponent');
    if (comp) {
      this.collection = comp.get('traits');
      this.render();
    }
  }
});
