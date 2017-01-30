define(['backbone','./TraitView'],
	function (Backbone, TraitView) {

	return TraitView.extend({

		initialize: function(o) {
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
		getInputEl: function() {
      if(!this.$input){
				var md = this.model;
        var opts = md.get('options') || [];
        this.input = '<select>';
				if(opts.length){
					_.each(opts, function(el){
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
						this.input += '<option value="' + value + '" ' + attrs + '>' + name + '</option>';
					}, this);
				}
				this.input 	+= '</select>';
				this.$input = $(this.input);
				var val = md.get('value');
				if(val)
					this.$input.val(val);
      }
			return this.$input.get(0);
		},

	});
});
