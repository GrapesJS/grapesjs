define(function() {
		/**
		 * @class SelectComponent
		 * */
		return {

			init: function(o){
				_.bindAll(this, 'onHover', 'onOut', 'onClick');
			},

			enable: function()
			{
				_.bindAll(this,'copyComp','pasteComp');
				var confMain	= this.config.em.get('Config');
				this.startSelectComponent();
				if(confMain.copyPaste){
					key('⌘+c, ctrl+c', this.copyComp);
					key('⌘+v, ctrl+v', this.pasteComp);
				}
			},

			/**
			 * Copy component to clipboard
			 */
			copyComp: function()
			{
					var sel 	= this.editorModel.get('selectedComponent');

					if(sel && sel.get('copyable'))
						 this.editorModel.set('clipboard', sel);
			},

			/**
			 * Paste component from clipboard
			 */
			pasteComp: function()
			{
					var clp 	= this.editorModel.get('clipboard'),
							sel 	= this.editorModel.get('selectedComponent');
					if(clp && sel && sel.collection){
						var index = sel.collection.indexOf(sel),
								clone		= clp.clone();
						sel.collection.add(clone, { at: index + 1 });
					}
			},

			/** Start select component event
			 * @return void
			 * */
			startSelectComponent: function(){
				var that = this;
				this.$el.find('*')
						.on('mouseover',this.onHover)
						.on('mouseout', this.onOut)
						.on('click', this.onClick);
				this.selEl = this.$el.find('*');
			},

			/**
			 * Hover command
			 * @param {Object}	e
			 */
			onHover: function(e)
			{
				e.stopPropagation();
			  $(e.target).addClass(this.hoverClass);
			  this.attachBadge(e.target);
			},

			/**
			 * Out command
			 * @param {Object}	e
			 */
			onOut: function(e)
			{
				e.stopPropagation();
			  $(e.target).removeClass(this.hoverClass);
			  if(this.badge)
			  	this.badge.css({ left: -10000, top:-10000 });
			},

			/**
			 * Hover command
			 * @param {Object}	e
			 */
			onClick: function(e)
			{
				var s	= $(e.target).data('model').get('stylable');
				if(!(s instanceof Array) && !s)
					return;
				this.onSelect(e, e.target);
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

			/**
			 * Say what to do after the component was selected
			 * @param 	{Object}	e
			 * @param 	{Object}	el
			 * */
			onSelect: function(e, el)
			{
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
					this.wrapper = this.$wrapper;
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
				this.badge = $('<div>', {class: this.badgeClass + " no-dots"}).appendTo(this.$wrapper);
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

			/**
			 * Run method
			 * */
			run: function(em, sender){
				this.enable();
				this.render();
			},

			/**
			 * Stop method
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
				key.unbind('⌘+c, ctrl+c');
				key.unbind('⌘+v, ctrl+v');
			}
		};
});