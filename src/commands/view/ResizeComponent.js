define(['backbone', 'jqueryUi', './MoveComponent'],
	function(Backbone, jqueryUi, MoveComponent) {
		/**
		 * @class ResizeComponent
		 * @private
		 * */
		return _.extend({}, MoveComponent,{

			enable: function(){
				var $this = this;
				this.startSelectComponent();
				this.$el.find('*').resizable({
					containment: 'parent',
					start: function(event,ui){
						ui.element[0].style.height = ui.element.height()+'px';
						ui.element.css({'min-height':'', 'min-width':'' });
					},
					stop: function(event,ui){
						ui.element.css('overflow','auto');
						$this.updateModel(ui);
					}
				});
			},


			/**
			 * Update model of resized element
			 * @param object Component model
			 * */
			updateModel: function(el){
				var um 		= 'px',
					model 	= el.element.data("model"),
					style	= _.clone(model.get('style'));
				delete style['min-height'];
				delete style['min-width'];
				style.height 	=  el.size.height + um;
				style.width		=  el.size.width + um;
				style.overflow	=  'auto';
				model.set('style', style);
			},

			/**
			 * Run method
			 * */
			run: function(){
				this.enable();
				this.active = true;
			},

			/**
			 * Stop method
			 * */
			stop: function(){
				this.stopSelectComponent();
				this.$el.find('.ui-resizable').resizable("destroy");
				this.$el.unbind();//removes all attached events
				this.active = false;
			}
		});
	});