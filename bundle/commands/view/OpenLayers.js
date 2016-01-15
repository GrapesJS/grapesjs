define(['Navigator'], function(Layers) {
		/** 
		 * @class OpenStyleManager
		 * */
		return {
			
			run: function(em, sender)
			{
				if(!this.$layers){
					var collection	= em.get('Components').getComponent().get('components'),
						config		= em.get('Config'),
						panels		= em.get('Panels'),
						lyStylePfx	= config.layers.stylePrefix || 'nv-';
					
					config.layers.stylePrefix = config.stylePrefix + lyStylePfx;
					var layers		= new Layers(collection, config.layers);
					this.$layers 	= layers.render();
					
					if(!panels.getPanel('views-container'))
						this.panel	= panels.addPanel({ id: 'views-container'});
					else
						this.panel	= panels.getPanel('views-container');
					
					this.panel.set('appendContent', this.$layers).trigger('change:appendContent');
				}
				this.$layers.show();
			},
			
			stop: function()
			{
				if(this.$layers)
					this.$layers.hide();
			}
		};
	});