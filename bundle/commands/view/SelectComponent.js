define(function() {
		/** 
		 * @class SelectComponent
		 * */
		return {
			
			enable: function(){
				this.startSelectComponent();
			},
			
			/** Start select component event
			 * @return void
			 * */
			startSelectComponent: function(){
				var that = this;
				
				if(!this.$el.length)
					this.$el = $('#' + this.canvasId);
				
				this.$el.find('*').on('mouseover',function(e){ that.highlightComponent(e,this); })
						.on('mouseout'	 ,function(e){ that.removeHighlightComponent(e,this); })
						.on('click'		 ,function(e){ that.selectComponent(e,this); });
				this.selEl = this.$el.find('*');
			},
			
			/** Stop select component event
			 * @param Event
			 * @return void
			 * */
			stopSelectComponent: function(e){
				if(this.selEl)
					this.selEl.trigger('mouseout').off('mouseover mouseout click');
				this.selEl = null;
			},
			
			/** Highlight component when pointer is over it
			 * @param Event
			 * @param Object Component
			 * @return void
			 * */
			highlightComponent: function(e, el){
				e.stopPropagation();
			    $(el).addClass(this.hoverClass);
			    this.attachBadge(el);
			},
			/** Remove highlight from component
			 * @param Event
			 * @param Object Component
			 * @return void
			 * */
			removeHighlightComponent: function(e, el){
				e.stopPropagation();
			    $(el).removeClass(this.hoverClass);
			    if(this.badge)										//Hide badge if possible
			    	this.badge.css({ left: -10000, top:-10000 });	//TODO HIDE
			},
			/** Select highlighted component
			 * @param Event
			 * @param Object Component
			 * @return void
			 * */
			selectComponent: function(e, el){
				this.onSelect(e,el);								//Callback on select
			},
			
			/** Say what to do after the component was selected
			 * @param Event
			 * @param Object Selected element
			 * */
			onSelect: function(e,el){
				e.stopPropagation();
				if(this.$selected)																	//Check if already selected before
					this.$selected.removeClass('selected-component');
				this.$selected = $(el).addClass('selected-component');
				if(this.$selected.data('model')){
					// Generates too much recursions with JsonGenerator
					//this.$selected.data('model').set('previousModel',this.editorModel.get('selectedComponent'));
					this.editorModel.set('selectedComponent',this.$selected.data('model')); 			//Update selected component
					this.$selected.data('model').set('status','selected');
				}
			},
			
			/** Removes all highlighting effects on components
			 * @return void
			 * */
			clean: function(){
				this.$el.find('*').removeClass(this.hoverClass);
			},
			
			/** Attach badge to component
			 * @param Object Component
			 * @return void
			 * */
			attachBadge: function(el){
				var model = $(el).data("model");
				if(!model || !model.get('badgable'))
					return;
				if(!this.badge)
					this.createBadge();
				var badgeH = this.badge.outerHeight();
				this.updateBadgeLabel(model);
				var $el = $(el);
				if(!this.wrapper)
					this.wrapper = $('#wrapper');
				if(!this.wrapperTop)
					this.wrapperTop = this.wrapper.offset() ? this.wrapper.offset().top : 0;
				if(!this.wrapperLeft)
					this.wrapperLeft= this.wrapper.offset() ? this.wrapper.offset().left : 0;
				var relativeT = ($el.offset().top - this.wrapperTop) + this.wrapper.scrollTop();
				var relativeL = ($el.offset().left- this.wrapperLeft) + this.wrapper.scrollLeft();
				if( (relativeT-badgeH) > this.wrapperTop)											//If it's possible set badge to top
					relativeT -= badgeH;
				this.badge.css({ left: relativeL, top:relativeT });
			},
			
			/** Create badge for the component
			 * @return void
			 * */
			createBadge: function (){
				this.badge = $('<div>', {class: this.badgeClass + " no-dots"}).appendTo('#' + this.wrapperId);
			},
			
			/** Remove badge
			 * @return void
			 * */
			removeBadge: function (){
				if(this.badge){	
					this.badge.remove();
					delete this.badge;
				}
			},
			
			/** Updates badge label
			 * @param Object Model
			 * @return void
			 * */
			updateBadgeLabel: function (model){
				if(model)
					this.badge.html( model.getName() );
			},
			
			/** Run method 
			 * */
			run: function(){
				this.enable();
				this.render();
				this.active = true;
			},
			
			/** Stop method 
			 * */
			stop: function(){
				if(this.editorModel.get('selectedComponent'))
					this.editorModel.get('selectedComponent').set('status','');
				this.$el.unbind();												//removes all attached events
				if(this.$selected)												//check if already selected before
					this.$selected.removeClass('selected-component');
				this.removeBadge();														
				this.clean();
				this.$el.find('*').unbind('mouseover').unbind('mouseout').unbind('click');
				this.editorModel.set('selectedComponent',null);
				this.active = false;
			}
		};
});