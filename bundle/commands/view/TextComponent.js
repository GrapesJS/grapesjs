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
			 * @return 	void
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
			 * @return 	void
			 * */
			afterDraw: function(model){
				if(!model.set)
					return;
				model.trigger('focus');
				if(this.senderBtn)
					this.senderBtn.set('active',false);
			},
			
			/** 
			 * Run method 
			 * */
			run: function(em, sender){
				this.enable();
				this.senderBtn	= sender;
			},
			
		});
	});