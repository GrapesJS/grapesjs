define(['./ComponentImage'],
	function (Component) {

		return Component.extend({

			defaults: _.extend({}, Component.prototype.defaults, {
					type: 'video',
					tagName: 'video',
					provider: '', // on change of provider, traits are switched
					loop: 0,
					muted: 0,
					autoplay: 0,
					controls: 1,
					sources: [],
			}),

			initialize: function(o, opt) {
				this.set('traits', this.getSourceTraits());
				Component.prototype.initialize.apply(this, arguments);
				this.listenTo(this, 'change:provider', this.updateTraits);
			},

			/**
			 * Update traits by provider
			 * @private
			 */
			updateTraits: function() {
				var prov = this.get('provider');
				var traits = this.getSourceTraits();
				switch (prov) {
					case 'yt':
						traits = this.getYoutubeTraits();
						break;
					case 'vi':
						traits = this.getVimeoTraits();
						break;
				}
				this.loadTraits(traits);
				this.sm.trigger('change:selectedComponent');
			},

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
					value: this.get('provider'),
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
						label: 'Source',
						name: 'src',
						placeholder: 'eg. ./media/video.mp4',
						changeProp: 1,
					},{
						type: 'checkbox',
						label: 'Autoplay',
						name: 'autoplay',
						changeProp: 1,
					},{
						type: 'checkbox',
						label: 'Loop',
						name: 'loop',
						changeProp: 1,
					},{
						type: 'checkbox',
						label: 'Controls',
						name: 'controls',
						changeProp: 1,
					}];
			},

			/**
			 * Return traits for the source provider
			 * @return {Array<Object>}
			 * @private
			 */
			getYoutubeTraits: function() {
				return [
					this.getProviderTrait(), {
						label: 'Video ID',
						name: 'src',
						placeholder: 'eg. jNQXAC9IVRw',
						changeProp: 1,
					}];
			},

			/**
			 * Return traits for the source provider
			 * @return {Array<Object>}
			 * @private
			 */
			getVimeoTraits: function() {
				return [
					this.getProviderTrait(), {
						label: 'Video ID',
						name: 'src',
						placeholder: 'eg. 123456789',
						changeProp: 1,
					}];
			},

		});
});
