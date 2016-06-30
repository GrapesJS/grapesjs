define(function() {
		/**
		 * @class SelectPosition
		 * @private
		 * */
		return {

			init: function(opt) {
				_.bindAll(this,'selectingPosition','itemLeft');
				this.config	= opt;
			},

			/**
			 * Returns position placeholder
			 *
			 * @return	{Object}	Placeholder
			 * @private
			 * */
			getPositionPlaceholder: function() {
				return this.$plh;
			},

			/**
			 * Creates position placeholder
			 * @return	{Object}	Placeholder
			 * @private
			 * */
			createPositionPlaceholder: function()
			{
				this.$plh =  $('<div>', { class: this.plhClass + " no-dots" })
					.css({'pointer-events':'none'}).data('helper',1);
				this.$plh.append( $('<div>', { class: this.plhClass + "-int no-dots" } ) );
				this.$plh.appendTo( this.$wrapper );
				return this.$plh;
			},

			enable: function()
			{
				this.startSelectPosition();
			},

			/**
			 * Start select position event
			 * @private
			 * */
			startSelectPosition: function()
			{
				this.isPointed = false;
				this.$wrapper.on('mousemove', this.selectingPosition);
			},

			/**
			 * Stop select position event
			 * @private
			 * */
			stopSelectPosition: function()
			{
				this.$wrapper.off('mousemove',this.selectingPosition);
				this.posTargetCollection = null;
				this.posIndex 	= this.posMethod=='after' && this.cDim.length!==0 ? this.posIndex + 1 : this.posIndex; //Normalize
				if(this.cDim){
					this.posIsLastEl	= this.cDim.length!==0 && this.posMethod=='after' && this.posIndex==this.cDim.length;
					this.posTargetEl 	= (this.cDim.length===0 ? $(this.outsideElem) :
						 (!this.posIsLastEl && this.cDim[this.posIndex] ? $(this.cDim[this.posIndex][5]).parent() : $(this.outsideElem) ));
					this.posTargetModel 		= this.posTargetEl.data("model");
					this.posTargetCollection 	= this.posTargetEl.data("model-comp");
				}
			},

			/**
			 * During event
			 * @param	{Object}	e Event
			 * @private
			 * */
			selectingPosition: function(e)
			{
				this.isPointed = true;

				if(!this.wp){
					this.$wp 	= this.$wrapper;
					this.wp		= this.$wp[0];
				}
				var wpO		= this.$wp.offset();
				this.wpT 	= wpO.top;
				this.wpL	= wpO.left;
				this.wpScT	= this.$wp.scrollTop();
				this.wpScL	= this.$wp.scrollLeft();

				if(!this.$plh)
					this.createPositionPlaceholder();

				this.rY			= (e.pageY - this.wpT) + this.wpScT;
				this.rX 		= (e.pageX - this.wpL) + this.wpScL;

				this.entered(e);
				this.updatePosition(this.rX, this.rY);
				var actualPos 	= this.posIndex + ':' + this.posMethod;									//save globally the new index

				if(!this.lastPos || (this.lastPos != actualPos)){						//If there is a significant changes with mouse
					this.updatePositionPlaceholder(this.posIndex, this.posMethod);
					this.lastPos = actualPos;
				}
			},

			/**
			 * Search where to put placeholder
			 * @param	{Integer} 	posX	X position of the mouse
			 * @param	{Integer} 	posY	Y position of the mouse
			 * @private
			 * */
			updatePosition: function( posX, posY ){
				this.posMethod = "before";
				this.posIndex = 0;
				var leftLimit = 0, xLimit = 0, dimRight = 0, yLimit = 0, xCenter = 0, yCenter = 0, dimDown = 0, dim = 0;
				for(var i = 0; i < this.cDim.length; i++){
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
						this.posIndex = i;
						if( posY < yCenter ){														//If mouse upper than center
							this.posMethod = "before";												//Should place helper before
							break;																	//No need to continue under inFlow element
						}else
							this.posMethod = "after";
					}
				}
				if(this.posIndex == (this.cDim.length) && this.posMethod == 'after' ){
					this.posIndex--;
				}
			},

			/**
			 * Updates the position of the placeholder
			 * @param 	{Integer}	index	Index of the nearest child
			 * @param 	{String}	method 	Before or after position
			 * @private
			 * */
			updatePositionPlaceholder: function(index, method){
				var t = 0, l = 0, w = 0, h = 0,
					marg		= 2,
					un			= 'px',
					margI		= 5,
					plh			= this.$plh[0];
				if( this.cDim[index] ){
					var elDim	= this.cDim[index];
					if(!elDim[4]){
						w 	= 'auto';
						t	= elDim[0] + marg;
						h	= elDim[2] - (marg * 2) + un;
						l	= (method == 'before') ? (elDim[1] - marg) : (elDim[1] + elDim[3] - marg);
					}else{
						w	= elDim[3] + un;
						t	= (method == 'before') ? (elDim[0] - marg) : (elDim[0] + elDim[2] - marg);
						l	= elDim[1];
						h	= 'auto';
					}
					//t	-= this.wpScT;
					//l	-= this.wpScL;
				}else{
					if(this.$targetEl){
						var trg	= this.$targetEl[0],
							$eO = this.$targetEl.offset();
						t		= $eO.top - this.wpT + this.wpScT + margI;
						l		= $eO.left - this.wpL + this.wpScL	+ margI;
						w 		= (parseInt(trg.offsetWidth) - margI * 2) + un;
						h		= 'auto';
					}
				}

				plh.style.top		= t + un;
				plh.style.left		= l	+ un;
				if(w)
					plh.style.width	= w;
				if(h)
					plh.style.height	= h;
			},

			/**
			 * Track inside which element pointer entered
			 * @param	{Object}	e	Event
			 * @private
			 * */
			entered: function(e){
				if( (!this.outsideElem || this.outsideElem != e.target) ){							//If I'm in the new element
					this.outsideElem 	= e.target;													//Set the element in which it's actually inside
					this.$targetEl		= $(e.target);
					$(this.outsideElem).on('mouseleave',this.itemLeft);
					this.cDim = this.getChildrenDim();
					this.dimT	=	this.getTargetDim(e);
					if( this.nearToBorders(e) && (e.target.parentNode!=this.wp.parentNode) )		//Avoid flickering
						this.cDim = this.getChildrenDim(e.target.parentNode);
				}else if( this.nearToBorders(e) && (e.target.parentNode!=this.wp.parentNode) ){ 	//Near to borders and parent is not the canvas
					this.cDim = this.getChildrenDim(e.target.parentNode);
				}else if( !(this.nearToBorders(e)) ){
					this.cDim = this.getChildrenDim();
				}
			},

			/**
			 * Check if pointer is near to the borders of the target
			 * @param	{Object}	e	Event
			 * @return	{Integer}
			 * @private
			 * */
			nearToBorders: function(e){
				var m 		= 7;																		//Limit in pixels for be near
				if(!this.dimT)
					return;
				var dimT 	= this.dimT;
				if(dimT[2] < 40)
					m 		= 5;
				if( ((dimT[0] + m) > this.rY) || (this.rY > (dimT[0] + dimT[2] - m)) ||
					((dimT[1] + m) > this.rX) || (this.rX > (dimT[1] + dimT[3] - m))  )					//Check if the pointer is near
					return 1;
				else
					return 0;
			},

			/**
			 * Check if pointer is near to the float component
			 * @return	{Integer}
			 * @private
			 * */
			nearToFloat: function()
			{
				var index 	= this.posIndex;
				var isLastEl	= this.posIsLastEl;
				if(this.cDim.length !== 0 && (
						(!isLastEl && !this.cDim[index][4]) ||
						(this.cDim[index-1] && !this.cDim[index-1][4]) ||
						(isLastEl && !this.cDim[index-1][4]) ) )
					return 1;
				else
					return 0;
			},

			/**
			 * Returns dimension of the taget
			 * @param	{Object}	e Event
			 * @return	{Array}
			 * @private
			 * */
			getTargetDim: function(e)
			{
				var elT = e.target,
					$el	= $(elT);
				return [ elT.offsetTop, elT.offsetLeft, $el.outerHeight(), $el.outerWidth() ];
			},

			/**
			 * Returns children and their dimensions of the target element,
			 * excluding text nodes and the move placeholder
			 * @param 	{Object}	el Element
			 * @return 	{Array}
			 * @private
			 * */
			getChildrenDim: function(el)
			{
				var dim 		= [];
				var elToPars 	= el || this.outsideElem;
				var isInFlow 	= this.isInFlow;													//Assign method for make it work inside $.each
				var $this 		= this;																//Store context
				$(elToPars.childNodes).each(function(){
					var $el		= $(this);
					if(this.nodeName != '#text' && !$el.data('helper') ){							//Ignore text nodes and helpers
						dim.push( [ this.offsetTop, this.offsetLeft, $el.outerHeight(), $el.outerWidth(), isInFlow($this, this), this  ] );
					}
				});
				return dim;
			},

			/**
			 * Track when I go ouside of the element (basically when the target changes)
			 * @param	{Object}	e Event
			 * @private
			 * */
			itemLeft: function(e)
			{
				$(this.outsideElem).off('mouseleave',this.itemLeft);
				this.outsideElem = null;
				this.$targetEl	 = null;
				this.lastPos = null;
			},

			/**
			 * Returns true if the elements is in flow, or better is not in flow where
			 *  for example the component is with float:left
			 *  @param	{Object}	$this	Context
			 *  @param 	{Object}	elm	 	Element
			 *  @return {Boolean}
			 *  @private
			 * */
			isInFlow:  function($this, elm)
			{
			    var $elm = $(elm), ch = -1;
			    if(!$elm.length)
			    	return false;
			    if( ($elm.height() < ch) || !$this.okProps($elm) )
			    	return false;
			    return true;
			},

			/**
			 * Returns true only if the element follow the standard flow
			 * @param 	{Object}	$elm	Element
			 * @return 	{Boolean}
			 * @private
			 * */
			okProps: function($elm)
			{
			    if ($elm.css('float')!=='none')
			        return false;
			    switch($elm.css('position')) {
			        case 'static': case 'relative':  break;
			        default: 						 return false;
			    }
			    switch ($elm.css('display')) {
			        case 'block': case 'list-item': case 'table':  return true;
			    }
			    return false;
			},

			/**
			 * Removes position placeholder
			 * @param	void
			 * @private
			 * */
			removePositionPlaceholder: function()
			{
				if(this.$plh && this.$plh.length)
					this.$plh.remove();
				this.$plh = null;
			},

			run: function(){
				this.enable();
			},

			stop: function(){
				this.removePositionPlaceholder();
				this.stopSelectPosition();
				this.$wrapper.css('cursor','');//changes back aspect of the cursor
				this.$wrapper.unbind();//removes all attached events
			}
		};
});