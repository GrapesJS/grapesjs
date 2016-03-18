define(['backbone'],
	function (Backbone) {
		/**
		 * @class CssGenerator
		 * */
		return Backbone.Model.extend({

			initialize: function(){
				this.buff = [];
			},

			/** @inheritdoc */
			getId	: function()
			{
				return 'css';
			},

			/** @inheritdoc */
			build: function(model, cssc)
			{
				var coll 	= model.get('components') || model,
					code 	= '';

				coll.each(function(m){
					var css = m.get('style'),
						cls = m.get('classes'),
						cln = m.get('components');

					// Get id-relative style
					if(css && Object.keys(css).length !== 0){
						code 	+= '#' + m.cid + '{';

						for(var prop in css)
							if(css.hasOwnProperty(prop))
								code += prop + ':' + css[prop] + ';';

						code 	+= '}';
					}

					if(cssc && cls.length){
						var rule = cssc.getRule(cls.models);
						if(rule){
							var selectors = rule.get('selectors');
							var ruleStyle = rule.get('style');
							var strSel = '';
							selectors.each(function(selector){
								strSel += '.' + selector.get('name');
							});
							if(this.buff.indexOf(strSel) < 0){
								this.buff.push(strSel);
								code += strSel + '{';
								if(ruleStyle && Object.keys(ruleStyle).length !== 0){
									for(var prop2 in ruleStyle)
										if(ruleStyle.hasOwnProperty(prop2))
											code += prop2 + ':' + ruleStyle[prop2] + ';';
								}
								code += '}';
							}
						}
					}

					if(cln.length)
						code 	+= this.build(cln, cssc);

				}, this);

				return code;
			},

		});
});
