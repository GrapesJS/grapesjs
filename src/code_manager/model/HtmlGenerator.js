define(['backbone'],
	function (Backbone) {
		/**
		 * @class HtmlGenerator
		 * */
		return Backbone.Model.extend({

			/** @inheritdoc */
			getId	: function(){
				return 'html';
			},

			/** @inheritdoc */
			build: function(model){
				var coll 	= model.get('components') || model,
					code 	= '';

				coll.each(function(m){
					var tag 	= m.get('tagName'),			// Tag name
							sTag	= 0,										// Single tag
							attr 	= '',										// Attributes string
							cln		= m.get('components');	// Children

					_.each(m.get('attributes'),function(value, prop){
						if(prop == 'onmousedown')
							return;
						attr 	+= value && prop!='style' ? ' ' + prop + '="' + value + '" ' : '';
					});

					if(m.get('type') == 'image'){
							tag 	= 'img';
							sTag	= 1;
							attr 	+= 'src="' + m.get('src') + '"';
					}

					code += '<'+tag+' id="'+m.cid+'"' + attr + (sTag ? '/' : '') + '>' + m.get('content');

					if(cln.length)
						code += this.build(cln);

					if(!sTag)
						code += '</'+tag+'>';

				}, this);

				return code;
			},

		});
});
