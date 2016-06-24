define(['backbone', './SelectComponent','./SelectPosition'],
	function(Backbone, SelectComponent, SelectPosition) {
		/**
		 * @class MoveComponent
		 * @private
		 * */
		return _.extend({},SelectComponent, SelectPosition,{

			init: function(o){
				SelectComponent.init.apply(this, arguments);
				_.bindAll(this,'initSorter','startMove','onMove','endMove','rollback','selectingPosition','itemLeft', 'onEndMove');
				this.opt	= o;
				this.hoverClass	= this.pfx + 'hover-move';
				this.badgeClass	= this.pfx + 'badge-yellow';
				this.noSelClass	= this.pfx + 'no-select';
			},

			enable: function(){
				this.canvasTop 	= this.$canvas.offset().top;
				this.canvasLeft	= this.$canvas.offset().left;
				this.$el.css('cursor','move');
				//this.$el.on('mousedown', this.startMove);
				this.$el.on('mousedown', this.initSorter);
				this.startSelectComponent();

				//Avoid strange moving behavior
				this.$el.addClass(this.noSelClass);
			},

			/**
			 * Delegate sorting
			 * @param	{Event} e
			 * */
			initSorter: function(e){
				if(this.sorter)
					this.sorter.startSort(e.target);
				this.stopSelectComponent(e);
				this.$el.off('mousedown', this.initSorter);
			},

			/**
			 * Callback after sorting
			 */
			onEndMove: function(){
				this.enable();
			},

			/**
			 * Hover command
			 * @param {Object}	e
			 * @private
			 */
			onHover: function(e) {
				e.stopPropagation();

			  var $this 	= $(e.target);
			  if($this.data('model').get('movable')){							//Show badge if possible
					 $this.addClass(this.hoverClass);
					 this.attachBadge(e.target);
			    }
			},

			/** Say what to do after the component was selected
			 * 	- Method from selectComponent
			 * @param Event
			 * @param Object Selected element
			 * @private
			 * */
			onSelect: function(e,el){},

			/** Picking component to move
			 * @param event
			 * @private
			 * */
			startMove: function(e, el){
				this.moved = false;
				if( !$(e.target).data('model').get('movable') ){  return; }					//In case the component selected is not movable
				this.$el.off('mousedown', this.startMove);
				this.stopSelectComponent(e);
				this.$selectedEl = $(e.target);
				this.freezeComponent(this.$selectedEl);
				this.helperObj =  $('<div>', {class: "tempComp"}).css({ 					//HELPER gray box
					top : (e.pageY - this.canvasTop) + this.$canvas.scrollTop(),
					left: (e.pageX - this.canvasLeft) + this.$canvas.scrollLeft(),
					width: $(e.target).width(),
					height: $(e.target).height(),
					position : 'absolute',
					'pointer-events': 'none',							//disable events for the element
				}).data('helper',1).appendTo(this.$el);

				this.startSelectPosition();

				this.$el.on('mousemove',this.onMove);
				$(document).on('mouseup',this.endMove);
				$(document).on('keypress',this.rollback);
			},

			/** During move
			 * @param event
			 * @private
			 * */
			onMove: function(e){
				this.moved = true;
				var relativeY = (e.pageY - this.canvasTop) + this.$canvas.scrollTop();
				var relativeX = (e.pageX - this.canvasLeft) + this.$canvas.scrollLeft();
				this.helperObj[0].style.top = (relativeY)+'px';
				this.helperObj[0].style.left = (relativeX)+'px';
			},

			/** Leave component
			 * @param event
			 * @private
			 * */
			endMove: function(e){
				this.$el.off('mousemove',this.onMove);
				$(document).off('mouseup', this.endMove);
				$(document).off('keypress', this.rollback);
				this.helperObj.remove();

				this.removePositionPlaceholder();
				this.stopSelectPosition();

				//this.highlightComponent(e,el) after end of move
				if(this.moved)
					this.move(null, this.$selectedEl, this.posIndex, this.posMethod);
				this.unfreezeComponent(this.$selectedEl);
				this.enable();
			},

			/** Move component to new position
			 * @param object Component to move
			 * @param object Target component
			 * @param int Indicates the position inside the collection
			 * @param string Before of after component
			 *
			 * @private
			 * */
			move: function(target, el, posIndex, posMethod){
				var index = posIndex || 0;
				var model = el.data("model");
				var collection = model.collection;

				var targetCollection 	= this.posTargetCollection;
				var targetModel 		= this.posTargetModel;

				if(targetCollection && targetModel.get('droppable')){
					var modelTemp = targetCollection.add({css:{}}, { at: index });
					var modelRemoved = collection.remove(model);
					targetCollection.add(modelRemoved, { at: index });
					targetCollection.remove(modelTemp);//{ avoidStore: 1 }
				}else
					console.warn("Invalid target position");
			},

			/** Make component untouchable
			 * @param object Component
			 * @private
			 * */
			freezeComponent: function($component){
				$component.css({'pointer-events':'none'});
				$component.addClass(this.freezClass);
			},

			/** Make component touchable
			 * @param object Component
			 * @private
			 * */
			unfreezeComponent: function($component){
				$component.css({'pointer-events':'auto'});
				$component.removeClass(this.freezClass);
			},

			/** Used to bring the previous situation before start moving the component
			 * @param Event
			 * @param Bool Indicates if rollback in anycase
			 * @private
			 * */
			rollback: function(e, force){
				var key = e.which || e.keyCode;
				if(key == this.opt.ESCAPE_KEY || force){
					this.moved = false;
					this.endMove();
				}
				return;
			},

			/**
			 * Closing method
			 * @private
			 * */
			last: function(){
				this.placeholder.remove();
				this.placeholderStart.remove();
				this.helperObj.remove();
				this.$el.off('mousemove',this.move);
				$(document).off('mouseup', this.endMove);
				$(document).off('keypress', this.rollback);
			},

			run: function(editor, sender, opts){
				this.editor = editor;

				// Activate sorter, at any run? In layers, is called once at any stack
				var utils = this.editor.Utils;
				if(utils && utils.Sorter)
					this.sorter = new utils.Sorter({
						container: this.$el.get(0),
						containerSel: '*',
						itemSel: '*',
						pfx: this.ppfx,
						onEndMove: this.onEndMove,
						direction: 'a',
						nested: 1,
						freezeClass: this.freezClass,
					});

				this.enable();
			},

			stop: function(){
				this.stopSelectComponent();
				this.$el.css('cursor','');//changes back aspect of the cursor
				this.$el.unbind();//removes all attached events
				this.$el.removeClass(this.noSelClass);
			}
		});
	});