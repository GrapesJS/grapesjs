define(function(require) {

    var DomainViews = require('Abstract/view/DomainViews');
    var TraitView = require('./TraitView');
    var TraitSelectView = require('./TraitSelectView');
    var TraitCheckboxView = require('./TraitCheckboxView');
    var TraitNumberView = require('./TraitNumberView');

    return DomainViews.extend({

      itemView: TraitView,

      itemsView: {
        'text': TraitView,
        'number': TraitNumberView,
        'select': TraitSelectView,
        'checkbox': TraitCheckboxView,
      },

      initialize: function(o) {
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
      updatedCollection: function() {
        this.el.className = this.className;
        var comp = this.em.get('selectedComponent');
        if(comp){
          this.collection = comp.get('traits');
          this.render();
        }
      },

    });

});
