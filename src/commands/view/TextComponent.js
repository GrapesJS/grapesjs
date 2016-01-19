define(['backbone', './CreateComponent'],
	function(Backbone, CreateComponent) {
		/**
		 * @class TextComponent
		 * */
		return _.extend({}, CreateComponent, {
			
			/** 
			 * This event is triggered at the beginning of a draw operation
			 * @param 	{Object} 	component	Object component before creation
			 * 
			 * */
			beforeDraw: function(component){
				component.type = 'text';
				if(!component.style)
					component.style	= {};
				component.style.padding = '10px';
			},
			
			/** 
			 * This event is triggered at the end of a draw operation
			 * @param 	{Object}	model	Component model created
			 * 
			 * */
			afterDraw: function(model){
				if(!model || !model.set)
					return;
				model.trigger('focus');
				if(this.sender)
					this.sender.set('active', false);
			},
			
		});
	});