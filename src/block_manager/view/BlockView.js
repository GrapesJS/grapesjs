define(['backbone'],
function(Backbone) {

  return Backbone.View.extend({

    initialize: function(o, config) {
      this.config = config || {};
      this.ppfx = this.config.pStylePrefix || '';
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
      this.el.innerHTML = this.model.get('label');
      this.$el.addClass(this.ppfx + 'block');
      return this;
    },

  });
});