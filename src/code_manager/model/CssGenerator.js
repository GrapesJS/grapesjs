define(['backbone'],
	function (Backbone) {
		/**
		 * @class CssGenerator
		 * */
		return Backbone.Model.extend({

			initialize: function(){
				this.compCls = [];
			},

			/**
			 * Get CSS from components
			 * @param {Model} model
			 * @return {String}
			 */
			buildFromComp: function(model) {
				var coll 	= model.get('components') || model,
					code 	= '';

				coll.each(function(m){
					var css = m.get('style'),
						cls = m.get('classes'),
						cln = m.get('components');
					cls.each(function(m){
						this.compCls.push(m.get('name'));
					}, this);

					if(css && Object.keys(css).length !== 0){
						code 	+= '#' + m.cid + '{';
						for(var prop in css){
							if(css.hasOwnProperty(prop))
								code += prop + ':' + css[prop] + ';';
						}
						code 	+= '}';
					}

					if(cln.length)
						code 	+= this.buildFromComp(cln);

				}, this);

				return code;
			},

			/** @inheritdoc */
			build: function(model, cssc) {
				this.compCls = [];
				var code 	= this.buildFromComp(model);
				var compCls = this.compCls;

				if(cssc){
					var rules = cssc.getAll();
					var mediaRules = {};
					rules.each(function(rule){
						var width = rule.get('maxWidth');

						// If width setted will render it later
						if(width){
							var mRule = mediaRules[width];
							if(mRule)
								mRule.push(rule);
							else
								mediaRules[width] = [rule];
							return;
						}

						code += this.buildFromRule(rule);
					}, this);

					// Get media rules
					for (var ruleW in mediaRules) {
						var meRules = mediaRules[ruleW];
						var ruleC = '';
						for(var i = 0, len = meRules.length; i < len; i++){
							ruleC += this.buildFromRule(meRules[i]);
						}
						if(ruleC)
							code += '@media (max-width: ' + ruleW + '){' + ruleC + '}';
					}

				}
				return code;
			},

			/**
			 * Get CSS from the rule model
			 * @param {Model} rule
			 * @return {string} CSS string
			 */
			buildFromRule: function(rule) {
				var result = '';
				var selectors = rule.get('selectors');
				var ruleStyle = rule.get('style');
				var state = rule.get('state');
				var strSel = '';
				var found = 0;
				var compCls = this.compCls;

				// Get string of selectors
				selectors.each(function(selector){
					strSel += '.' + selector.get('name');
					if(compCls.indexOf(selector.get('name')) > -1)
						found = 1;
				});

				if(strSel && found){
					strSel  += state ? ':' + state : '';
					var strStyle = '';

					// Get string of style properties
					if(ruleStyle && Object.keys(ruleStyle).length !== 0){
						for(var prop2 in ruleStyle){
							if(ruleStyle.hasOwnProperty(prop2))
								strStyle += prop2 + ':' + ruleStyle[prop2] + ';';
						}
					}

					if(strStyle)
						result += strSel + '{' + strStyle + '}';
				}

				return result;
			},

		});
});
