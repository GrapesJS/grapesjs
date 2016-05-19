define(['backbone'],
	function (Backbone) {

		return Backbone.Model.extend({

			defaults: {
				checkLocal: true,
			},

			/** @inheritdoc */
			store	: function(name, value) {
				this.checkStorageEnvironment();
				localStorage.setItem(name, value );
			},

			/** @inheritdoc */
			load: function(name){
				var result	= null;
				this.checkStorageEnvironment();
				if(localStorage.getItem(name))
					result 	= localStorage.getItem(name);
				try{
					var prx	= "Loading '" + name + "': ";
					if(!result)
						throw prx + ' Resource was not found';
				}catch(err){
					console.warn(err);
				}
				return result;
			},

			/** @inheritdoc */
			remove	: function(name) {
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
