define(['backbone', './SelectComponent','./SelectPosition'],
	function(Backbone, SelectComponent, SelectPosition) {
		/**
		 * @class MoveComponent
		 * @private
		 * */
		return _.extend({},SelectComponent, SelectPosition,{

			init: function(o){
				SelectComponent.init.apply(this, arguments);
				_.bindAll(this,'initSorter','rollback','selectingPosition','itemLeft', 'onEndMove');
				this.opt	= o;
				this.hoverClass	= this.pfx + 'hover-move';
				this.badgeClass	= this.pfx + 'badge-yellow';
				this.noSelClass	= this.pfx + 'no-select';
			},

			enable: function(){
				this.$el.css('cursor','move');
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
				var el = $(e.target).data('model');
				if(!el.get('draggable'))
					return;
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
			 * Hover command. Helps to avoid selecting not movable elements, eg. wrapper
			 * @param {Object}	e
			 * @private
			 */
			onHover: function(e) {
				e.stopPropagation();

			  var $this 	= $(e.target);
			  if($this.data('model').get('draggable')){
					 $this.addClass(this.hoverClass);
					 this.attachBadge(e.target);
			    }
			},

			/** Say what to do after the component was selected (selectComponent)
			 * @param Event
			 * @param Object Selected element
			 * @private
			 * */
			onSelect: function(e,el){},

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