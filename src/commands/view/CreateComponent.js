define(['backbone','./SelectPosition'],
	function(Backbone, SelectPosition) {
		/**
		 * @class CreateComponent
		 * */
		return _.extend({}, SelectPosition, {

			newElement : null,

			tempComponent: { style:{} },

			init: function(opt) {
				SelectPosition.init.apply(this, arguments);
				_.bindAll(this,'startDraw','draw','endDraw','rollback');
				this.config		= opt;
				this.heightType = this.config.newFixedH ? 'height' : 'min-height';
			},

			/**
			 * Returns creation placeholder
			 *
			 * @return 	{Object}
			 * */
			getCreationPlaceholder: function()
			{
				return this.newElem;
			},

			/**
			 * Removes creation placeholder
			 *
			 * @return 	void
			 * */
			removeCreationPlaceholder: function()
			{
				this.newElem.remove();
			},

			/**
			 * Start with enabling to select position and listening to start drawning
			 * @return 	void
			 * */
			enable: function()
			{
				SelectPosition.enable.apply(this, arguments);
				this.$el.css('cursor','crosshair');
				this.enableToDraw();
			},

			/**
			 * Enable user to draw components
			 *
			 * @return 	void
			 * */
			enableToDraw: function()
			{
				this.$el.on('mousedown', this.startDraw);
				//Need to disable selection
			},

			/**
			 * Start drawing component
			 * @param 	{Object}	e	Event
			 *
			 * @return 	void
			 * */
			startDraw : function(e)
			{
				e.preventDefault();
				this.stopSelectPosition();														//Interrupt selecting position
				this.tempComponent = { style: {} };												//Reset the helper
				this.isDragged = false;
				this.beforeDraw(this.tempComponent);
				this.getPositionPlaceholder().addClass('change-placeholder');					//Change color of the position placeholder
				this.newElemOrig = { top : e.pageY, left: e.pageX };
				this.newElem = $('<div>', {class: "tempComp"}).css(this.newElemOrig);			//Create helper element with initial position
				this.newElem.data('helper',1);
				$('body').append(this.newElem);													//Show helper component
				this.parentElem=this.newElem.parent();											//For percent count
				this.targetC = this.outsideElem;
				$(document).mousemove(this.draw);
				$(document).mouseup(this.endDraw);
				$(document).keypress(this.rollback);
			},

			/**
			 * While drawing the component
			 * @param 	{Object}	e	Event
			 *
			 * @return 	void
			 * */
			draw: function(e)
			{
				this.isDragged = true;
				this.updateComponentSize(e);
			},

			/**
			 * End drawing component
			 * @param 	{Object}	e Event
			 *
			 * @return 	void
			 * */
			endDraw : function(e)
			{
				$(document).off('mouseup', this.endDraw);
				$(document).off('mousemove', this.draw);
				$(document).off('keypress',this.rollback);
				var model = {};
				if(this.isDragged){																						//Only if the mouse was moved
					this.updateComponentSize(e);
					this.setRequirements(this.tempComponent);
					model = this.create(null,this.tempComponent,this.posIndex,this.posMethod);
				}
				if(this.getPositionPlaceholder())
					this.getPositionPlaceholder().removeClass('change-placeholder');			//Turn back the original color of the placeholder
				this.startSelectPosition();														//Return with selecting new position
				this.removeCreationPlaceholder();												//Remove the element used for size indication
				this.afterDraw(model);
			},

			/**
			 * Create component
			 * @param	{Object}	target	 	DOM of the target element which to push new component
			 * @param 	{Object}	component 	New component to push
			 * @param 	{Integer}	posIndex	Index inside the collection, 0 if no children inside
			 * @param 	{String}	method 		Before or after of the children
			 *
			 * @return 	{Object} Created model
			 * */
			create: function(target, component, posIndex, method)
			{
				var index = posIndex || 0;
				if(this.posTargetCollection && this.posTargetModel.get('droppable')){
					//Check config parameters for center in wrapper
					if(this.config.firstCentered && (this.$wrapper.get(0) == this.posTargetEl.get(0)) ){
						component.style.margin 	= '0 auto';
					}
					if(this.nearToFloat())							//Set not in flow if the nearest is too
						component.style.float 	= 'left';
					this.beforeCreation(component);
					var model = this.posTargetCollection.add(component, { at: index, silent:false });
					this.afterCreation(model);
					return model;
				}else
					console.warn("Invalid target position");
			},

			/**
			 * Check and set basic requirements for the component
			 * @param 	{Object}	component	New component to be created
			 * @return 	{Object} 	Component updated
			 * */
			setRequirements: function(component)
			{
				var c	= this.config;
				if(component.style.width.replace(/\D/g,'') < c.minComponentW)				//Check min width
					component.style.width = c.minComponentW +'px';
				if(component.style[this.heightType].replace(/\D/g,'') < c.minComponentH)		//Check min height
					component.style[this.heightType] = c.minComponentH +'px';
				if(c.newFixedH)															//Set overflow in case of fixed height
					component.style.overflow = 'auto';
				if(!this.absoluteMode){
					delete component.style.left;
					delete component.style.top;
				}else
					component.style.position = 'absolute';
				return component;
			},

			/**
			 * Update new component size while drawing
			 * @param 	{Object} 	e	Event
			 *
			 * @return 	void
			 * */
			updateComponentSize : function (e)
			{
		       	var newLeft		= e.pageX;
		        var newTop      = e.pageY;
		        var startLeft   = this.newElemOrig.left;
		        var startTop    = this.newElemOrig.top;
		       	var newWidth    = newLeft - startLeft;//$(this.newElem).offset().left
		        var newHeight   = newTop - startTop;//$(this.newElem).offset().top
		        if (newLeft < this.newElemOrig.left) {
		        	startLeft   = newLeft;
		            newWidth    = this.newElemOrig.left - newLeft;
		        }
		        if (newTop < this.newElemOrig.top) {
		        	startTop 	 = newTop;
		            newHeight    = this.newElemOrig.top - newTop;
		        }
		        newWidth = this.absoluteMode ? (newWidth/this.parentElem.width()*100+"%") : newWidth+'px';
		        this.newElem[0].style.left 	= startLeft+'px';
	        	this.newElem[0].style.top 	= startTop+'px';
	        	this.newElem[0].style.width = newWidth;
	        	this.newElem[0].style['min-height'] = newHeight+'px';
		        this.tempComponent.style.width = newWidth;
		        this.tempComponent.style[this.heightType] = newHeight+"px";
		        this.tempComponent.style.left = startLeft + "px";
		        this.tempComponent.style.top = startTop + "px";
			},

			/**
			 * Used to bring the previous situation before event started
			 * @param 	{Object}	e		Event
			 * @param 	{Boolean} 	forse	Indicates if rollback in anycase
			 *
			 * @return 	void
			 * */
			rollback: function(e, force)
			{
				var key = e.which || e.keyCode;
				if(key == this.config.ESCAPE_KEY || force){
					this.isDragged = false;
					this.endDraw();
				}
				return;
			},

			/**
			 * This event is triggered at the beginning of a draw operation
			 * @param 	{Object}	component	Object component before creation
			 *
			 * @return 	void
			 * */
			beforeDraw: function(component){
				component.editable = false;//set this component editable
			},

			/**
			 * This event is triggered at the end of a draw operation
			 * @param 	{Object}	model	Component model created
			 *
			 * @return 	void
			 * */
			afterDraw: function(model){},

			/**
			 * This event is triggered just before a create operation
			 * @param 	{Object} 	component	Object component before creation
			 *
			 * @return 	void
			 * */
			beforeCreation: function(component){},

			/**
			 * This event is triggered at the end of a create operation
			 * @param 	{Object}	model	Component model created
			 *
			 * @return 	void
			 * */
			afterCreation: function(model){},

			/** Run method
			 * */
			run: function(em, sender){
				this.sender	= sender;
				this.$el 	= this.$wrapper;
				this.enable();
			},

			/** Stop method
			 * */
			stop: function(){
				this.removePositionPlaceholder();											//Removes placeholder from eventSelectPosition
				this.stopSelectPosition();
				this.$el.css('cursor','');													//Changes back aspect of the cursor
				this.$el.unbind();															//Removes all attached events
			}
		});
	});