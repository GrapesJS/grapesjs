define(['backbone', './InsertCustom'],
	function(Backbone, InsertCustom) {
		/**
		 * @class ImageComponent
		 * @private
		 * */
		return _.extend({}, InsertCustom, {

			/**
			 * Trigger before insert
			 * @param 	{Object}	object
			 * @private
			 *
			 * */
			beforeInsert: function(object){
				object.type = 'image';
				object.style = {};
				object.attributes = {};
				object.attributes.onmousedown = 'return false';
				if (this.config.firstCentered &&
					 this.getCanvasWrapper() == this.sorter.target ) {
					object.style.margin = '0 auto';
				}
			},

			/**
			 * Trigger after insert
			 * @param	{Object}	model	Model created after insert
			 * @private
			 * */
			afterInsert: function(model){
				model.trigger('dblclick');
				if(this.sender)
					this.sender.set('active', false);
			},


		});
	});