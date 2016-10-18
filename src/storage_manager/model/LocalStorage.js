define(['backbone'],
	function (Backbone) {

		return Backbone.Model.extend({

			defaults: {
				checkLocal: true,
			},

			/**
			* @private
			*/
			store: function(data) {
				this.checkStorageEnvironment();

				for(var key in data)
					localStorage.setItem(key, data[key]);
			},

			/**
			 * @private
			 */
			load: function(keys){
				this.checkStorageEnvironment();
				var result = {};

				for (var i = 0, len = keys.length; i < len; i++){
					var value = localStorage.getItem(keys[i]);
					if(value)
						result[keys[i]] = value;
				}

				return result;
			},

			/**
			 * @private
			 */
			remove: function(keys) {
				this.checkStorageEnvironment();

				for (var i = 0, len = keys.length; i < len; i++)
					localStorage.removeItem(keys[i]);
			},

			/**
			 * Check storage environment
			 * @private
			 * */
			checkStorageEnvironment: function() {
				if(this.get('checkLocal') && !localStorage)
					console.warn("Your browser doesn't support localStorage");
			},

		});
});
