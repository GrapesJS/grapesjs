const TraitView = require('./TraitView');
const $ = Backbone.$;

module.exports = TraitView.extend({

  initialize(o) {
    TraitView.prototype.initialize.apply(this, arguments);
    var ppfx = this.ppfx;
    this.tmpl = '<div class="' + this.fieldClass +'"><div class="' + this.inputhClass +'"></div>'+
    '<div class="' + ppfx + 'sel-arrow"><div class="' + ppfx + 'd-s-arrow"></div></div> </div>';
  },

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if(!this.$input) {
      var md = this.model;
      var opts = md.get('options') || [];
      var input = '<select>';

      if (opts.length) {
        _.each(opts, el => {
          var name, value, style;
          var attrs = '';
          if(typeof el === 'string'){
            name = el;
            value = el;
          }else{
            name = el.name ? el.name : el.value;
            value = el.value.replace(/"/g,'&quot;');
            style = el.style ? el.style.replace(/"/g,'&quot;') : '';
            attrs += style ? 'style="' + style + '"' : '';
          }
          input += '<option value="' + value + '" ' + attrs + '>' + name + '</option>';
        });
      }

      input += '</select>';
      this.input = input;
      this.$input = $(this.input);

      var target = this.target;
      var name = md.get('name');
      var val = md.get('value');

      if (md.get('changeProp')) {
        val = val || target.get(name);
      } else {
        var attrs = target.get('attributes');
        val = attrs[name];
      }

      if(val)
        this.$input.val(val);
    }

    return this.$input.get(0);
  },

});
