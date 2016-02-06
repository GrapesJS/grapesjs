define(['backbone', './InsertCustom'],
	function(Backbone, InsertCustom) {
		/**
		 * @class ImageComponent
		 * */
		return _.extend({}, InsertCustom, {

			/**
			 * Trigger before insert
			 * @param 	{Object}	object
			 *
			 * */
			beforeInsert: function(object){
				object.type 			= 'image';
				object.style			= {};
				object.attributes = {};
				if (!this.nearToFloat()) {
					object.style.display	= 'block';
				}
				// This allow to avoid 'ghosts' on drag
				object.attributes.onmousedown = 'return false';
				if (this.config.firstCentered && (this.$wp.get(0) == this.posTargetEl.get(0)) ) {
					object.style.margin 	= '0 auto';
				}
			},

			/**
			 * Trigger after insert
			 * @param	{Object}	model	Model created after insert
			 *
			 * */
			afterInsert: function(model){
				model.trigger('dblclick');
				if(this.sender)
					this.sender.set('active', false);
			},


		});
	});