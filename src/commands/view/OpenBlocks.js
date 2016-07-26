define(function() {

		return {

			run: function(editor, sender) {
				var config = editor.Config;
				var pfx = config.stylePrefix;
				var bm = editor.BlockManager;
				if(!this.blocks){
					this.blocks = $('<div/>').get(0);
					this.blocks.appendChild(bm.render());
					var panels = editor.Panels;
					if(!panels.getPanel('views-container'))
						panelC = panels.addPanel({id: 'views-container'});
					else
						panelC = panels.getPanel('views-container');
					panelC.set('appendContent', this.blocks).trigger('change:appendContent');
				}

				this.blocks.style.display = 'block';
			},

			stop: function() {
				if(this.blocks)
					this.blocks.style.display = 'none';
			}
		};
	});