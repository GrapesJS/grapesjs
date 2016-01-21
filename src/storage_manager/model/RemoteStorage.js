define(['backbone'],
	function (Backbone) {
		/**
		 * @class RemoteStorage
		 * */
		return Backbone.Model.extend({

			defaults: {
				urlLoad				: 'http://localhost/load',
				urlStore			: 'http://localhost/store',
				beforeSend			: function(){},
				onComplete			: function(){},
				paramsStore			: {},
				paramsLoad			: {},
				errorLoad			: 'Response is not a valid JSON',
			},

			/** @inheritdoc */
			getId	: function() {
				return	'remote';
			},

			/** @inheritdoc */
			store	: function(name, value) {
				var fd 		= new FormData(),
					params	= this.get('paramsStore');
				fd.append( name, value );
				for(var key in params){
					fd.append(key, params[key] );
				}
				$.ajax({
					url: 			this.get('urlStore'),
					beforeSend: 	this.get('beforeSend'),
					complete:		this.get('onComplete'),
					type: 			'POST',
					processData:	false,
					contentType: 	false,
					data: 			fd,
				});
			},

			/** @inheritdoc */
			load: function(name){
				var result 	= null,
					t		= this;
				$.ajax({
					url				:	this.get('urlLoad'),
					beforeSend		: 	this.get('beforeSend'),
					complete		:	this.get('onComplete'),
					data			: 	this.get('paramsLoad'),
					async			:   false,
					type			: 	'GET',
				}).done(function(d){
					try{
						var prx	= "Loading '" + name + "': ";

						if(typeof d !== 'object')
							throw prx + t.get('errorLoad');

						result = d.data ? d.data[name] : d[name];

						if(!result)
							throw prx + ' Resource was not found';

					}catch(err){
						console.warn(err);
					}
				});
				return result;
			},

			/** @inheritdoc */
			remove	: function(name) {

			},

		});
});
