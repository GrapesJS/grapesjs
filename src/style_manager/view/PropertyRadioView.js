var Backbone = require('backbone');
var PropertyView = require('./PropertyView');

module.exports = PropertyView.extend({

  template: _.template(`
  <div class="<%= ppfx %>field <%= ppfx %>field-radio">
    <span id='<%= pfx %>input-holder'></span>
  </div>
  <div style="clear:both"></div>`),

  initialize(options) {
    PropertyView.prototype.initialize.apply(this, arguments);
    this.list = this.model.get('list') || [];
    this.className = this.className + ' '+ this.pfx +'list';
  },

  /** @inheritdoc */
  renderInput() {
    var pfx = this.pfx;
    var ppfx = this.ppfx;
    var itemCls = ppfx + 'radio-item-label';
    var prop = this.property;

    if(!this.$input) {
      if(this.list && this.list.length) {
        var input = '';
        _.each(this.list, el => {
          var cl = el.className ? el.className + ' ' + pfx + 'icon ' + itemCls : '',
          id = prop + '-' + el.value,
          labelTxt = el.name ? el.name : el.value;
          var titleAttr = el.title ? 'title="' + el.title + '"': '';
          input += '<div class="' + ppfx + 'radio-item">'+
            '<input class="'+pfx+'radio" type="radio" id="'+ id +'" name="'+prop+'" value="'+el.value+'" />'+
            '<label class="'+(cl ? cl : itemCls)+'" ' + titleAttr + ' for="'+ id +'">' + (cl ? '' : labelTxt) + '</label></div>';
        });
        this.input = input;
        this.$inputEl = $(this.input);
        this.$el.find('#'+ pfx +'input-holder').html(this.$inputEl);
        this.$input = this.$inputEl.find('input[name="'+this.property+'"]');
      }
    }

    this.setValue(this.componentValue);
  },

  /**
   * Returns value from input
   * @return {string}
   */
  getInputValue() {
    return this.$input ? this.$el.find('input:checked').val() : '';
  },

  /** @inheritdoc */
  setValue(value) {
    var v = this.model.get('value') || this.defaultValue;

    if(value)
      v  = value;

    if(this.$input)
      this.$input.filter('[value="'+v+'"]').prop('checked', true);

    this.model.set({value: v},{silent: true});
  },

});
