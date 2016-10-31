define(['./ComponentImage'],
	function (Component) {

		return Component.extend({

			defaults: _.extend({}, Component.prototype.defaults, {
					type: 'video',
					tagName: 'video',
					provider: '', // on change of provider, traits are switched
					traits: this.getSourceTraits(),
			}),

			// Listen provider change and switch traits, in TraitView listen traits change

			/**
			 * Return the provider trait
			 * @return {Object}
			 * @private
			 */
			getProviderTrait: function() {
				return {
					type: 'select',
					label: 'Provider',
					name: 'provider',
					changeProp: 1,
					options: [
						{value: 'so', name: 'HTML5 Source'},
						{value: 'yt', name: 'Youtube'},
						{value: 'vi', name: 'Vimeo'}
					]
				};
			},

			/**
			 * Return traits for the source provider
			 * @return {Array<Object>}
			 * @private
			 */
			getSourceTraits: function() {
				return [
					this.getProviderTrait(), {
					type: 'stack',
					label: 'Sources',
					layers: []
				}];
			},

		});
});
