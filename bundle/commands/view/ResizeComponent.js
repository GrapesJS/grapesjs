define(['backbone', 'jqueryUi', './MoveComponent'],
	function(Backbone, jqueryUi, MoveComponent) {
		/** 
		 * @class ResizeComponent
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
				var um = 'px';
				var model = el.element.data("model");
				delete model.get('style')['min-height'];			//resize event removes fixed measures
				delete model.get('style')['min-width'];
				model.get('style').height = el.size.height+um;	//update with new height and width
				model.get('style').width = el.size.width+um;
				model.get('style').overflow = 'auto';
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