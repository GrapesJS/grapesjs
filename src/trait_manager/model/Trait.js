define(['backbone'],
	function(Backbone) {

		return Backbone.Model.extend({

			defaults: {
				type: 'text', // text, number, range, select
				label: '',
				name: '',
				min: '',
				max: '',
				value: '',
				target: '',
				default: '',
				placeholder: '',
				changeProp: 0,
				options: [],
			},

			initialize: function(){
				if (this.get('target')) {
					this.target = this.get('target');
					this.unset('target');
				}
			},

		});
	});
