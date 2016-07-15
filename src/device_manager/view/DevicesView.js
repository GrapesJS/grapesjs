define(['backbone'],
function(Backbone) {

  return Backbone.View.extend({

    //template: _.template(assetsTemplate),

    initialize: function(o) {
      this.config = o.config || {};
      this.ppfx = this.config.pStylePrefix || '';
    },

    /**
     * Return devices options
     * @return {string} String of options
     */
    getOptions: function(){
      var result = '';
      this.collection.each(function(device){
        var name = device.get('name');
        result += '<option value="' + name+ '">' + name + '</option>';
      });
      return result;
    },

    render: function() {
      /*
      this.$el.html(this.template({
        ppfx: this.ppfx,
      }));
       */
      //this.$el.attr({class: this.ppfx + 'frame'});
      return this;
    },

  });
});