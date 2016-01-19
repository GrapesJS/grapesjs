define(['backbone'], 
	function (Backbone) {
		/**
		 * @class CssGenerator
		 * */
		return Backbone.Model.extend({
			
			/** @inheritdoc */
			getId	: function()
			{
				return 'css'; 
			},
			
			/** @inheritdoc */
			build: function(model)
			{
				
				var coll 	= model.get('components') || model,
					code 	= '';
				
				coll.each(function(m){
					var css 	= m.get('style'),
						cln		= m.get('components');	// Children
					
					if(css && Object.keys(css).length !== 0){
						code 	+= '#' + m.cid + '{';
						
						for(var prop in css)
							if(css.hasOwnProperty(prop))
								code += prop + ': ' + css[prop] + ';';
						
						code 	+= '}';
					}
					
					if(cln.length)
						code 	+= this.build(cln);
					
				}, this);
				
				return code;
			},
			
		});
});
