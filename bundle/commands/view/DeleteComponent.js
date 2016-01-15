define(['backbone', './SelectComponent'],
	function(Backbone, SelectComponent) {
		/** 
		 * @class DeleteComponent
		 * */
		return _.extend({},SelectComponent,{
			
			init: function(o){
				this.hoverClass	= this.pfx + 'hover-delete';
				this.badgeClass	= this.pfx + 'badge-red';
			},
			
			enable: function(){
				
				if(!this.$el.length)
					this.$el = $('#' + this.canvasId);
				
				var that = this;
				this.$el.find('*').mouseover(function (e){
				    e.stopPropagation();
				    if($(this).data('model').get('removable')){	//Show badge if possible
				    	$(this).addClass(that.hoverClass);
				    	that.attachBadge(this);
				    }
				}).mouseout(function (e){						//hover out
				    e.stopPropagation();
				    $(this).removeClass(that.hoverClass);
				    if(that.badge)								//Hide badge if possible
				    	that.badge.css({ left: -1000, top:-1000 });
				}).click(function(e){
					that.onSelect(e,this);						//Callback on select
				});
			},
			
			/** 
			 * Say what to do after the component was selected
			 * @param Event
			 * @param Object Selected element
			 * */
			onSelect: function(e, el){
				e.stopPropagation();
				var $selected = $(el);
				if(!$selected.data('model').get('removable')) //Do nothing in case can't remove
					return;
				$selected.data('model').destroy();
				this.removeBadge();
				this.clean();
			},
			
			/** 
			 * Updates badge label
			 * @param Object Model
			 * @return void
			 * */
			updateBadgeLabel: function (model){
				this.badge.html( 'Remove '+model.getName() );
			},
		});
	});