define(['backbone'],
function(Backbone) {

  return Backbone.View.extend({

    initialize: function(o) {
      this.config = o.config || {};
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
      this.el.innerHTML = this.model.get('label');
      return this;
    },

  });
});