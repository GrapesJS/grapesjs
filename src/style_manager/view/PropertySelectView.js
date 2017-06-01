var Backbone = require('backbone');
var PropertyView = require('./PropertyView');

module.exports = PropertyView.extend({

  template: _.template(`
  <div class="<%= ppfx %>field <%= ppfx %>select">
    <span id='<%= pfx %>input-holder'></span>
    <div class="<%= ppfx %>sel-arrow">
      <div class="<%= ppfx %>d-s-arrow"></div>
    </div>
  </div>
  <div style="clear:both"></div>`),

  initialize(options) {
    PropertyView.prototype.initialize.apply(this, arguments);
    this.list = this.model.get('list') || [];
  },

  /** @inheritdoc */
  renderInput() {
    var pfx  = this.pfx;
    if(!this.$input){
      var input = '<select>';

      if (this.list && this.list.length) {
        _.each(this.list, el => {
          var name = el.name ? el.name : el.value;
          var style = el.style ? el.style.replace(/"/g,'&quot;') : '';
          var styleAttr = style ? 'style="' + style + '"' : '';
          input += '<option value="'+el.value.replace(/"/g,'&quot;')+'" ' + styleAttr + '>'+name+'</option>';
        });
      }

      input += '</select>';
      this.input = input;
      this.$input = $(this.input);
      this.$el.find('#'+ pfx +'input-holder').html(this.$input);
    }
    this.setValue(this.componentValue, 0);
  },

});
