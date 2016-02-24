define(['StyleManager'], function(StyleManager) {
		/**
		 * @class OpenStyleManager
		 * */
		return {

			run: function(em, sender)
			{
				this.sender	= sender;
				if(!this.$cn){
					var config		= em.get('Config'),
							panels		= em.get('Panels'),
							pfx				= config.styleManager.stylePrefix || 'sm-';

					config.styleManager.stylePrefix = config.stylePrefix + pfx;
					config.styleManager.target		= em;

					// Main container
					this.$cn = $('<div/>');
					// Secondary container
					this.$cn2 = $('<div/>');
					this.$cn.append(this.$cn2);

					// Class Manager container
					this.clm = em.get('ClassManager');
					if(this.clm){
						this.$clm = this.clm.renderTags();
						this.$cn2.append(this.$clm);
					}

					// Style Manager manager container
					this.sm = new StyleManager(config.styleManager);
					this.$sm = this.sm.render();
					this.$cn2.append(this.$sm);

					// Create header
					this.$header	= $('<div>', {
						class	: config.styleManager.stylePrefix + 'header',
						text 	: config.styleManager.textNoElement,
					});
					//this.$cn = this.$cn.add(this.$header);
					this.$cn.append(this.$header);

					// Create panel if not exists
					if(!panels.getPanel('views-container'))
						this.panel	= panels.addPanel({ id: 'views-container'});
					else
						this.panel	= panels.getPanel('views-container');

					// Add all containers to the panel
					this.panel.set('appendContent', this.$cn).trigger('change:appendContent');

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
							this.$cn2.show();
							this.$header.hide();
					}else{
							this.$cn2.hide();
							this.$header.show();
					}
			},

			stop: function()
			{
				// Hide secondary container if exists
				if(this.$cn2)
					this.$cn2.hide();

				// Hide header container if exists
				if(this.$header)
					this.$header.hide();
			}
		};
	});