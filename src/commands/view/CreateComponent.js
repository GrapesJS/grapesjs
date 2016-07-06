define(['backbone','./SelectPosition'],
	function(Backbone, SelectPosition) {

		return _.extend({}, SelectPosition, {

			init: function(opt) {
				_.bindAll(this,'startDraw','draw','endDraw','rollback');
				this.config = opt || {};
				this.hType = this.config.newFixedH ? 'height' : 'min-height';
			},

			/**
			 * Start with enabling to select position and listening to start drawning
			 * @private
			 * */
			enable: function() {
				SelectPosition.enable.apply(this, arguments);
				this.$wr.css('cursor','crosshair');
				this.$wr.on('mousedown', this.startDraw);
				this.plh = $(this.canvas.getPlacerEl());
				this.ghost = this.canvas.getGhostEl();
			},

			/**
			 * Start drawing component
			 * @param 	{Object} e	Event
			 * @private
			 * */
			startDraw : function(e) {
				e.preventDefault();
				this.stopSelectPosition();
				this.ghost.style.display = 'block';
				this.frameOff = this.getOffsetDim();
				this.startPos = {
					top : e.pageY + this.frameOff.top,
					left: e.pageX + this.frameOff.left
				};

				this.isDragged = false;
				this.tempComponent = {style: {}};
				this.beforeDraw(this.tempComponent);
				this.updateSize(this.startPos.top, this.startPos.left, 0, 0);

				this.$wr.on('mousemove', this.draw);
				this.$wr.on('mouseup', this.endDraw);
				this.$canvas.on('mousemove', this.draw);
				$(document).on('mouseup', this.endDraw);
				$(document).on('keypress', this.rollback);
			},

			/**
			 * While drawing the component
			 * @param 	{Object}	e	Event
			 * @private
			 * */
			draw: function(e) {
				this.isDragged = true;
				this.updateComponentSize(e);
			},

			/**
			 * End drawing component
			 * @param 	{Object}	e Event
			 * @private
			 * */
			endDraw : function(e) {
				this.$wr.off('mousemove', this.draw);
				this.$wr.off('mouseup', this.endDraw);
				this.$canvas.off('mousemove', this.draw);
				$(document).off('mouseup', this.endDraw);
				$(document).off('keypress',this.rollback);

				var model = {};
				if(this.isDragged){																						//Only if the mouse was moved
					this.updateComponentSize(e);
					this.setRequirements(this.tempComponent);
					model = this.create(null,this.tempComponent,this.posIndex,this.posMethod);
				}
				this.ghost.style.display = 'none';
				this.startSelectPosition();
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
			 * @private
			 * */
			create: function(target, component, posIndex, method) {
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
			 * @private
			 * */
			setRequirements: function(component)
			{
				var c	= this.config;
				if(component.style.width.replace(/\D/g,'') < c.minComponentW)				//Check min width
					component.style.width = c.minComponentW +'px';
				if(component.style[this.hType].replace(/\D/g,'') < c.minComponentH)		//Check min height
					component.style[this.hType] = c.minComponentH +'px';
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
			 * @private
			 * */
			updateComponentSize : function (e) {
				var y = e.pageY + this.frameOff.top;
	     	var x = e.pageX + this.frameOff.left;
	      var start = this.startPos;
	      var top = start.top;
	      var left = start.left;
	      var height = y - top;
	     	var width = x - left;
	      if (x < left) {
	      	left = x;
					width = start.left - x;
	      }
	      if (y < top) {
	      	top = y;
					height = start.top - y;
	      }
	      this.updateSize(top, left, width, height);
			},

			/**
			 * Update size
			 * @private
			 */
			updateSize: function(top, left, width, height){
				var u = 'px';
				var ghStl = this.ghost.style;
				var compStl = this.tempComponent.style;
				ghStl.top = compStl.top = top + u;
				ghStl.left = compStl.left = left + u;
				ghStl.width = compStl.width = width + u;
				ghStl[this.hType] = compStl[this.hType] = height +  u;
			},

			/**
			 * Used to bring the previous situation before event started
			 * @param 	{Object}	e		Event
			 * @param 	{Boolean} 	forse	Indicates if rollback in anycase
			 * @private
			 * */
			rollback: function(e, force) {
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
			 * @private
			 * */
			beforeDraw: function(component){
				component.editable = false;//set this component editable
			},

			/**
			 * This event is triggered at the end of a draw operation
			 * @param 	{Object}	model	Component model created
			 * @private
			 * */
			afterDraw: function(model){},

			/**
			 * This event is triggered just before a create operation
			 * @param 	{Object} 	component	Object component before creation
			 * @private
			 * */
			beforeCreation: function(component){},

			/**
			 * This event is triggered at the end of a create operation
			 * @param 	{Object}	model	Component model created
			 * @private
			 * */
			afterCreation: function(model){},


			run: function(editor, sender, opts){
				this.editor = editor;
				this.sender	= sender;
				this.$wr = this.$wrapper;
				this.enable();
			},

			stop: function(){
				this.stopSelectPosition();
				this.$wrapper.css('cursor','');													//Changes back aspect of the cursor
				this.$wrapper.unbind();															//Removes all attached events
			}
		});
	});