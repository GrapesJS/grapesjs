var Backbone = require('backbone');
var vTemplate = require('text!./../template/editor.html');

module.exports = Backbone.View.extend({

  template: _.template(vTemplate),

  initialize: function(o){
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix;
  },

  render: function(){
    var obj = this.model.toJSON();
    obj.pfx = this.pfx;
    this.$el.html( this.template(obj) );
    this.$el.attr('class', this.pfx + 'editor-c');
    this.$el.find('#'+this.pfx+'code').html(this.model.get('input'));
    return this;
  },

});
