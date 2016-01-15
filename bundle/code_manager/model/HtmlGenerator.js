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
					var tag 	= m.get('tagName'),		// Tag name
						attr 	= '',					// Attributes string
						cln		= m.get('components');	// Children
					
					_.each(m.get('attributes'),function(value, prop){
						attr 	+= value && prop!='style' ? ' ' + prop + '="' + value + '" ' : '';
					});
					
					code += '<'+tag+' id="'+m.cid+'"' + attr + '>' + m.get('content');
					
					if(cln.length)
						code += this.build(cln);
					
					code += '</'+tag+'>';
				}, this);
				
				return code;
			},
			
		});
});
