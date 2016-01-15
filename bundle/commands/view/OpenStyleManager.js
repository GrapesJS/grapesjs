define(['StyleManager'], function(StyleManager) {
		/** 
		 * @class OpenStyleManager
		 * */
		return {
			
			run: function(em, sender)
			{
				if(!this.$sm){
					var config		= em.get('Config'),
						panels		= em.get('Panels'),
						smStylePfx	= config.styleManager.stylePrefix || 'sm-';
					
					config.styleManager.stylePrefix = config.stylePrefix + smStylePfx;
					config.styleManager.target		= em;
					
					var sm		= new StyleManager(config.styleManager);
					this.$sm	= sm.render();
					
					if(!panels.getPanel('views-container'))
						this.panel	= panels.addPanel({ id: 'views-container'});
					else
						this.panel	= panels.getPanel('views-container');
					
					this.panel.set('appendContent', this.$sm).trigger('change:appendContent');
				}
				this.$sm.show();
			},
			
			stop: function()
			{
				if(this.$sm)
					this.$sm.hide();
			}
		};
	});