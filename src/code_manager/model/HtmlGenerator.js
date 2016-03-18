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
					var tag = m.get('tagName'),			// Tag name
							sTag = 0,										// Single tag
							attr = '',										// Attributes string
							attrId = '',
							strCls = '',
							cln = m.get('components'),		// Children
							attrs = m.get('attributes'),
							classes = m.get('classes');
					_.each(attrs,function(value, prop){
						if(prop == 'onmousedown')
							return;
						attr 	+= value && prop!='style' ? ' ' + prop + '="' + value + '"' : '';
					});

					if(m.get('type') == 'image'){
							tag 	= 'img';
							sTag	= 1;
							attr 	+= 'src="' + m.get('src') + '"';
					}

					if(!_.isEmpty(m.get('style')))
						attrId = ' id="' + m.cid + '" ';

					classes.each(function(m){
						strCls += ' ' + m.get('name');
					});

					strCls = strCls !== '' ? ' class="' + strCls.trim() + '"' : '';
					code += '<' + tag + strCls + attrId + attr + (sTag ? '/' : '') + '>' + m.get('content');

					if(cln.length)
						code += this.build(cln);

					if(!sTag)
						code += '</'+tag+'>';

				}, this);

				return code;
			},

		});
});
