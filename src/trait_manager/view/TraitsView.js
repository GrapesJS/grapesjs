var DomainViews = require('domain_abstract/view/DomainViews');
var TraitView = require('./TraitView');
var TraitSelectView = require('./TraitSelectView');
var TraitCheckboxView = require('./TraitCheckboxView');
var TraitNumberView = require('./TraitNumberView');
var TraitColorView = require('./TraitColorView');

module.exports = DomainViews.extend({

  itemView: TraitView,

  itemsView: {
    'text': TraitView,
    'number': TraitNumberView,
    'select': TraitSelectView,
    'checkbox': TraitCheckboxView,
    'color': TraitColorView,
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
    var comp = this.em.get('selectedComponent');
    if(comp){
      this.collection = comp.get('traits');
      this.render();
    }
  },

});
