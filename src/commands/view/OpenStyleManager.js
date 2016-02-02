define(['StyleManager'], function(StyleManager) {
		/**
		 * @class OpenStyleManager
		 * */
		return {

			run: function(em, sender)
			{
				this.sender	= sender;
				if(!this.$sm){
					var config		= em.get('Config'),
							panels		= em.get('Panels'),
							pfx				= config.styleManager.stylePrefix || 'sm-';

					config.styleManager.stylePrefix = config.stylePrefix + pfx;
					config.styleManager.target		= em;

					var sm		= new StyleManager(config.styleManager);
					this.$sm	= sm.render();

					if(!panels.getPanel('views-container'))
						this.panel	= panels.addPanel({ id: 'views-container'});
					else
						this.panel	= panels.getPanel('views-container');

					// Create header
					this.$header	= $('<div>', {
						class	: config.styleManager.stylePrefix + 'header',
						text 	: config.styleManager.textNoElement,
					});

					// Add all to the panel
					this.panel.set('appendContent', this.$sm.add(this.$header) ).trigger('change:appendContent');

					this.target		= em;
					this.listenTo( this.target ,'change:selectedComponent', this.toggleSm);
				}
				this.toggleSm();
			},

			/**
			 * Toggle Style Manager visibility
			 */
			toggleSm: function()
			{
					if(!this.sender.get('active'))
						return;
					if(this.target.get('selectedComponent')){
							this.$sm.show();
							this.$header.hide();
					}else{
							this.$sm.hide();
							this.$header.show();
					}
			},

			stop: function()
			{
				if(this.$sm)
					this.$sm.hide();
				if(this.$header)
					this.$header.hide();
			}
		};
	});