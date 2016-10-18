define([ 'backbone','./Button'],
	function (Backbone, Button) {
		/**
		 * @class Buttons
		 * */
		return Backbone.Collection.extend({

			model: Button,

			/**
			 * Deactivate all buttons, except one passed
			 * @param	{Object}	except	Model to ignore
			 * @param	{Boolean}	r 		Recursive flag
			 *
			 * @return	void
			 * */
			deactivateAllExceptOne: function(except, r){
				this.forEach(function(model, index) {
					if(model !== except){
						model.set('active', false);
						if(r && model.get('buttons').length)
							model.get('buttons').deactivateAllExceptOne(except,r);
					}
				});
			},

			/**
			 * Deactivate all buttons
			 * @param	{String}	ctx Context string
			 *
			 * @return	void
			 * */
			deactivateAll: function(ctx){
				var context = ctx || '';
				this.forEach(function(model, index) {
					if( model.get('context') == context ){
						model.set('active', false);
						if(model.get('buttons').length)
							model.get('buttons').deactivateAll(context);
					}
				});
			},

		});
});
