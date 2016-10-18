define(['backbone'],
	function(Backbone) {
		/**
		 * @class ItemSort
		 * */
		return Backbone.View.extend({

			initialize: function(o) {
				_.bindAll(this,'startMove','onMove','endMove','rollback', 'itemLeft');
				this.config		= o.config || {};
				this.pfx		= o.config.stylePrefix;
				this.itemClass	= '.' + this.pfx + this.config.itemClass;
				this.itemsClass	= '.' + this.pfx + this.config.itemsClass;
				this.setElement('.'+this.pfx+this.config.containerId);
			},

			/**
			 * Picking component to move
			 * @param {Object}	Element view
			 * @param {Object}	Event
			 *
			 * @return void
			 * */
			startMove: function(eV, e){
				this.moved 		= false;
				this.eV			= eV;
				this.$sel		= this.eV.$el;
				this.$selParent	= this.$sel.closest(this.itemsClass);

				// In case the component selected is not draggable
				if( !eV.model.get('draggable') )
					return;

				// Create placeholder if not exists
				if(!this.$plh){
					var pfx		= this.pfx;
					this.$plh 	=  $('<div>', {id: pfx + 'placeholder'}).css({'pointer-events':'none'}).hide();
					this.$plh.append( $('<div>', {id: pfx + "plh-int", class: pfx + 'insert'} ) );

					if(!this.$el.length)
						this.$el	= $('.'+this.pfx+this.config.containerId);

					this.$plh.appendTo(this.$el);
				}
				this.$plh.data('hide',1);
				eV.freeze();
				this.$el.on('mousemove',this.onMove);
				$(document).on('mouseup',this.endMove);
				$(document).on('keypress',this.rollback);
			},

			/**
			 * Get children dimensions
			 * @param	{Object}	Parent element
			 *
			 * @retun	{Array}
			 * */
			getChildrenDim: function(el){
				var dim 	= [],
					p 		= el || this.$targetEl.parent(),
					oT		= this.elT,
					oL		= this.elL,
					ch		= p.children('.' + this.pfx + this.config.itemClass);
				ch.each(function(){
					var $el		= $(this),
						$elO	= $el.offset();
					dim.push( [ $elO.top - oT, $elO.left - oL, $el.outerHeight(), $el.outerWidth(), true, this]);
				});
				return dim;
			},

			/**
			 * During move
			 * @param {Object} Event
			 *
			 * @return void
			 * */
			onMove: function(e){
				this.moved 		= true;

				if(this.$plh.data('hide')){
					this.$plh.show();
					this.$plh.data('hide',0);
				}
				var	eO			= this.$el.offset();
				this.elT		= eO.top;
				this.elL		= eO.left;
				this.rY			= (e.pageY - this.elT) + this.$el.scrollTop();
				this.rX 		= (e.pageX - this.elL) + this.$el.scrollLeft();
				this.inspect(e);
				this.updatePosition(this.rX, this.rY);
				var actualPos 	= this.posIndex+':'+this.posMethod;

				//If there is a significant changes with the pointer
				if(!this.lastPos || (this.lastPos != actualPos)){
					this.updatePlaceholderPos(this.posIndex, this.posMethod);
					this.lastPos	= this.posIndex+':'+this.posMethod;
				}
				//Working alternative for find taget element
				//var $targetEl = this.$selParent.children('.'+this.pfx+this.config.itemClass).eq(this.aIndex);
			},

			/**
			 * Search where to put placeholder
			 * @param int X position of the mouse
			 * @param int Y position of the mouse
			 * @retun void
			 * */
			updatePosition: function( posX, posY ){
				this.posMethod = "before";
				this.posIndex = 0;
				var leftLimit = 0, xLimit = 0, dimRight = 0, yLimit = 0, xCenter = 0, yCenter = 0, dimDown = 0, dim = 0;
				for(var i = 0; i < this.cDim.length; i++){											//Dim => t,l,h,w
					dim = this.cDim[i];
					dimDown = dim[0] + dim[2];
					yCenter = dim[0] + (dim[2] / 2);												//Horizontal center
					xCenter = dim[1] + (dim[3] / 2);												//Vertical center
					dimRight = dim[1] + dim[3];
					if( (xLimit && dim[1] > xLimit) || (yLimit && yCenter > yLimit) ||
						(leftLimit && dimRight < leftLimit))										//No need with this one if over the limit
							continue;
					if(!dim[4]){																	//If it's not inFlow (like float element)
						if( posY < dimDown)
							yLimit = dimDown;
						if( posX < xCenter){														//If mouse lefter than center
							xLimit = xCenter;
							this.posMethod = "before";
						}else{
							leftLimit = xCenter;
							this.posMethod = "after";
						}
						this.posIndex = i;
					}else{
						this.posIndex = this.aIndex = i;
						if( posY < yCenter ){														//If mouse upper than center
							this.posMethod = "before";												//Should place helper before
							if(posY < dim[0])
								this.aIndex = i - 1;
							break;																	//No need to continue under inFlow element
						}else
							this.posMethod = "after";
					}
				}
			},

			/**
			 * Updates the position of the placeholder
			 * @param int Index of the nearest child
			 * @param str Before or after position
			 * @return void
			 * */
			updatePlaceholderPos: function(index, method){
				var	marg = 0, t = 0, l = 0, w = 0, h = 0,
					un			= 'px',
					margI		= 5,
					plh			= this.$plh[0];
				if( this.cDim[index] ){
					var elDim	= this.cDim[index];
					//If it's like with 'float' style
					if(!elDim[4]){
						w		= 'auto';
						h		= elDim[2] - (marg * 2) + un;
						t		= elDim[0] + marg;
						l		= (method == 'before') ? (elDim[1] - marg) : (elDim[1] + elDim[3] - marg);
					}else{
						//w		= '100%';
						w		= elDim[3] + un;
						//h		= elDim[3] + un;
						t		= (method == 'before') ? (elDim[0] - marg) : (elDim[0] + elDim[2] - marg);
						l		= elDim[1];
					}
				}else{
					if(this.$targetEl){
						var trg		= this.$targetEl[0],
							$elO	= this.$targetEl.offset();
						t		= $elO.top 	- this.elT 	+ margI + 17;
						l		= $elO.left - this.elL	+ margI * 7;
						w 		= (parseInt(trg.offsetWidth) - margI * 14) + un;
					}
				}
				plh.style.top			= t	+ un;
				plh.style.left			= l	+ un;
				if(w)
					plh.style.width		= w;
				if(h)
					plh.style.height	= h;
			},

			/**
			 * Leave item
			 * @param event
			 *
			 * @return void
			 * */
			endMove: function(e){
				this.$el.off('mousemove',this.onMove);
				$(document).off('mouseup', this.endMove);
				$(document).off('keypress', this.rollback);
				this.eV.unfreeze();
				this.$plh.hide();
				if(this.moved)
					this.move(this.$targetEl, this.$sel, this.posIndex, this.posMethod);
				this.itemLeft();
			},

			/**
			 * Move component to new position
			 * @param	{Object} 	Component to move
			 * @param	{Object} 	Target component
			 * @param 	{Integer} 	Indicates the position inside the collection
			 * @param 	{String} 	Before of after component
			 *
			 * @return void
			 * */
			move: function(target, el, posIndex, method){
				var trg					= target|| this.$targetEl;
				trg						= trg	|| this.$backupEl;
				if(!trg)
					return;
				var index 				= posIndex || 0;
				var model 				= el.data("model");
				var collection 			= model.collection;
				var targetModel 		= trg.data('model');
				var targetCollection	= targetModel.collection;

				if(!this.cDim.length)
					targetCollection	= targetModel.get('components');

				if(targetCollection && targetModel.get('droppable')){
					index				= method == 'after' ? index + 1 : index;
					var modelTemp 		= targetCollection.add({style:{}}, { at: index});
					var modelRemoved 	= collection.remove(model, { silent:false });
					targetCollection.add(modelRemoved, { at: index, silent:false });
					targetCollection.remove(modelTemp);
				}else
					console.warn("Invalid target position");
			},

			/**
			 * Track inside which element pointer entered
			 * @param event
			 *
			 * @return void
			 * */
			inspect: function(e){
				var	item		= $(e.target).closest(this.itemClass);
				if(!this.$targetEl || (item.length && item[0] != this.$targetEl[0]) ){
					this.status		= 1;
					if(item.length){
						this.$targetEl	= this.$backupEl = item;
						this.$targetElP	= this.$targetEl.parent();
						this.$targetsEl	= this.$targetEl.find(this.itemsClass + ':first');
						this.$targetEl.on('mouseleave', this.itemLeft);
						this.targetM	= this.$targetEl.data('model');
						this.dimT		= this.getTargetDim(this.$targetEl[0]);
						this.cDim 		= this.getChildrenDim();
					}
				}else if( this.nearToBorders(this.$targetEl[0]) || this.$targetEl[0] == this.$sel[0] ){
					if(this.status == 1){
						this.status		= 2;
						this.lastPos	= null;
						this.cDim 		= this.getChildrenDim(this.$targetElP);
					}
				}else if( !this.nearToBorders(this.$targetEl[0]) ){
					if(this.status == 2){
						this.status		= 1;
						this.lastPos	= null;
					}
					this.cDim		= [];
				}
			},

			/**
			 * Triggered when pointer leaves item
			 * @param event
			 *
			 * @return void
			 * */
			itemLeft: function(e){
				if(this.$targetEl){
					this.$targetEl.off('mouseleave',this.itemLeft);
					this.$targetEl 		= null;
				}
			},

			/**
			 * Returns dimension of the target
			 * @param Event
			 *
			 * @return Array
			 * */
			getTargetDim: function(e){
				var $el		= $(e),
					$elO	= $el.offset();
				return [ $elO.top - this.elT, $elO.left - this.elL, $el.outerHeight(), $el.outerWidth() ];
			},

			/**
			 * Check if pointer is near to the borders of the target
			 * @param event
			 * @return Bool
			 * */
			nearToBorders: function(e){
				var m = 10;																		//Limit in pixels for be near
				if(!this.dimT)
					return;
				var dimT = this.dimT;
				if( ((dimT[0] + m) > this.rY) || (this.rY > (dimT[0] + dimT[2] - m)) ||
					((dimT[1] + m) > this.rX) || (this.rX > (dimT[1] + dimT[3] - m))  )
					return 1;
				else
					return 0;
			},

			/**
			 * Rollback to previous situation
			 * @param Event
			 * @param Bool Indicates if rollback in anycase
			 * @return void
			 * */
			rollback: function(e, force){
				var key = e.which || e.keyCode;
				if(key == 27 || force){
					this.moved = false;
					this.endMove();
				}
				return;
			},
		});
	});