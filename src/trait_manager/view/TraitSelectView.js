const TraitView = require('./TraitView');
const $ = Backbone.$;

module.exports = TraitView.extend({
  initialize(o) {
    TraitView.prototype.initialize.apply(this, arguments);
    let ppfx = this.ppfx;
    this.tmpl =
      '<div class="' +
      this.fieldClass +
      '"><div class="' +
      this.inputhClass +
      '"></div>' +
      '<div class="' +
      ppfx +
      'sel-arrow"><div class="' +
      ppfx +
      'd-s-arrow"></div></div> </div>';
  },

  /**
   * Returns input element
   * @return {HTMLElement}
   * @private
   */
  getInputEl() {
    if (!this.$input) {
      let md = this.model;
      let opts = md.get('options') || [];
      let input = '<select>';

      if (opts.length) {
        _.each(opts, el => {
          let name, value, style;
          let attrs = '';
          if (typeof el === 'string') {
            name = el;
            value = el;
          } else {
            name = el.name ? el.name : el.value;
            value = el.value.replace(/"/g, '&quot;');
            style = el.style ? el.style.replace(/"/g, '&quot;') : '';
            attrs += style ? 'style="' + style + '"' : '';
          }
          input +=
            '<option value="' + value + '" ' + attrs + '>' + name + '</option>';
        });
      }

      input += '</select>';
      this.input = input;
      this.$input = $(this.input);

      let target = this.target;
      let name = md.get('name');
      let val = md.get('value');

      if (md.get('changeProp')) {
        val = val || target.get(name);
      } else {
        let attrs = target.get('attributes');
        val = attrs[name];
      }

      if (val) this.$input.val(val);
    }

    return this.$input.get(0);
  }
});
