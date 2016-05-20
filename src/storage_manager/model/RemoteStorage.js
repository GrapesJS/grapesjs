define(['backbone'],
	function (Backbone) {
		/**
		 * @class RemoteStorage
		 * */
		return Backbone.Model.extend({

			defaults: {
				urlStore: '',
				urlLoad: '',
				params: {},
				beforeSend: function(){},
				onComplete: function(){},
			},

			/** @inheritdoc */
			store: function(name, value) {
				var fd = new FormData(),
				params = this.get('params');
				fd.append(name, value);

				for(var key in params)
					fd.append(key, params[key]);

				$.ajax({
					url: this.get('urlStore'),
					beforeSend: this.get('beforeSend'),
					complete: this.get('onComplete'),
					processData: false,
					contentType: false,
					type: 'POST',
					data: fd,
				});
			},

			/** @inheritdoc */
			load: function(name){
				var result = null;
				$.ajax({
					url: this.get('urlLoad'),
					beforeSend: this.get('beforeSend'),
					complete: this.get('onComplete'),
					data: this.get('paramsLoad'),
					async: false,
					type: 'GET',
				}).done(function(d){
					result = d.data ? d.data[name] : d[name];
				});
				return result;
			},

		});
});
