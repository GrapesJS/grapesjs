define(['backbone'],
	function (Backbone) {
		/**
		 * @class JsonGenerator
		 * */
		return Backbone.Model.extend({

			/** @inheritdoc */
			getId	: function()
			{
				return 'json';
			},

			/** @inheritdoc */
			build: function(model)
			{
				var json	= model.toJSON();
				this.beforeEach(json);

				// Avoid jshint 'loopfunc' error
				_.each(json,function(v, attr){
					var obj	= json[attr];
					if(obj instanceof Backbone.Model){
						json[attr] = this.build(obj);
					}else if(obj instanceof Backbone.Collection){
						var coll	= obj;
						json[attr]	= [];
						if(coll.length){
							coll.each(function (el, index) {
								json[attr][index] = this.build(el);
							}, this);
						}
					}

				}, this);

				return json;
			},

			/**
			 * Execute on each object
			 * @param {Object} obj
			 */
			beforeEach: function(obj) {
				delete obj.status;
			}

		});
});
