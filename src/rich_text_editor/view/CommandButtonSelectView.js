var Backbone = require('backbone');
var CommandButtonView = require('./CommandButtonView');

module.exports = CommandButtonView.extend({

  initialize(o, config) {
    CommandButtonView.prototype.initialize.apply(this, arguments);
  },

  getInput() {
    var m = this.model;
    if(!this.input){
      var cmd = m.get('command');
      var input = '<select data-edit="' + cmd +'">';
      var opts = m.get('options');
      var label = m.get('title') || m.get('command');
      input += '<option>' + label + '</option>';
      for(var i = 0, len = opts.length; i < len; i++){
        var opt = opts[i];
        var value = opt.value;
        var name = opt.name || value;
        input += '<option value="' + value + '">' + name + '</option>';
      }
      input += '</select>';
      this.input = $(input);
    }
    return this.input;
  },

  getInputCont() {
    var input = this.getInput();
    var pfx = this.ppfx;
    var cont = $('<div class="'+pfx+'field '+pfx+'select"><div class="'+pfx+'sel-arrow"><div class="'+pfx+'d-s-arrow"></div></div></div>');
    return cont.append(input);
  },

  render(...args) {
    CommandButtonView.prototype.render.apply(this, args);
    this.$el.html(this.getInputCont());
    return this;
  }
});
