define(['backbone'],
	function (Backbone) {

		return Backbone.Model.extend({

			defaults: {
				checkLocal: true,
			},

			/** @inheritdoc */
			store: function(name, value) {
				this.checkStorageEnvironment();
				localStorage.setItem(name, value);
			},

			/** @inheritdoc */
			load: function(name){
				this.checkStorageEnvironment();
				return localStorage.getItem(name);
			},

			/** @inheritdoc */
			remove: function(name) {
				this.checkStorageEnvironment();
				localStorage.removeItem(name);
			},

			/**
			 * Check storage environment
			 * */
			checkStorageEnvironment: function() {
				if(this.get('checkLocal') && !localStorage)
					console.warn("Your browser doesn't support localStorage");
			},

		});
});
