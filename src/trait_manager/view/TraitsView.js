//var DomainViews = require('domain_abstract/view/DomainViews');
var CategorizableView = require('domain_abstract/view/CategorizableView');
var TraitView = require('./TraitView');
var TraitSelectView = require('./TraitSelectView');
var TraitCheckboxView = require('./TraitCheckboxView');
var TraitNumberView = require('./TraitNumberView');
var TraitColorView = require('./TraitColorView');
var CategoryView = require('domain_abstract/view/CategoryView');

module.exports = CategorizableView.extend({

  itemView: TraitView,

  itemsView: {
    'text': TraitView,
    'number': TraitNumberView,
    'select': TraitSelectView,
    'checkbox': TraitCheckboxView,
    'color': TraitColorView,
  },

  categorizableType: 'block',

  initialize(o) {
    CategorizableView.prototype.initialize.apply(this, arguments);
    this.em = o.editor;
    this.config = o.config;
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
