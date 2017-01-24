define(['backbone', './SelectComponent','./SelectPosition'],
	function(Backbone, SelectComponent, SelectPosition) {

		return _.extend({}, SelectPosition, SelectComponent, {

			init: function(o){
				SelectComponent.init.apply(this, arguments);
				_.bindAll(this, 'initSorter','rollback', 'onEndMove');
				this.opt = o;
				this.hoverClass	= this.ppfx + 'highlighter-warning';
				this.badgeClass	= this.ppfx + 'badge-warning';
				this.noSelClass	= this.ppfx + 'no-select';
			},

			enable: function() {
				SelectComponent.enable.apply(this, arguments);
				this.getBadgeEl().addClass(this.badgeClass);
				this.getHighlighterEl().addClass(this.hoverClass);
				var wp = this.$wrapper;
				wp.css('cursor','move');
				wp.on('mousedown', this.initSorter);

				// Avoid strange moving behavior
				wp.addClass(this.noSelClass);
			},

			/**
			 * Overwrite for doing nothing
			 * @private
			 */
			toggleClipboard: function(){},

			/**
			 * Delegate sorting
			 * @param	{Event} e
			 * @private
			 * */
			initSorter: function(e){
				var el = $(e.target).data('model');
				var drag = el.get('draggable');
				if(!drag)
					return;

				// Avoid badge showing on move
				this.cacheEl = null;
				this.startSelectPosition(e.target, this.frameEl.contentDocument);
				this.sorter.draggable = drag;
				this.sorter.onEndMove = this.onEndMove.bind(this);
				this.stopSelectComponent();
				this.$wrapper.off('mousedown', this.initSorter);
				this.getContentWindow().on('keydown', this.rollback);
			},

			/**
			 * Init sorter from model
			 * @param  {Object} model
			 * @private
			 */
			initSorterFromModel: function(model) {
				var drag = model.get('draggable');
				if(!drag)
					return;
				// Avoid badge showing on move
				this.cacheEl = null;
				var el = model.get('view').el;
				this.startSelectPosition(el, this.frameEl.contentDocument);
				this.sorter.draggable = drag;
				this.sorter.onEndMove = this.onEndMoveFromModel.bind(this);
				this.stopSelectComponent();
				this.getContentWindow().on('keydown', this.rollback);
			},

			onEndMoveFromModel: function() {
				this.getContentWindow().off('keydown', this.rollback);
			},

			/**
			 * Callback after sorting
			 * @private
			 */
			onEndMove: function(){
				this.enable();
				this.getContentWindow().off('keydown', this.rollback);
			},

			/**
			 * Say what to do after the component was selected (selectComponent)
			 * @param {Event} e
			 * @param {Object} Selected element
			 * @private
			 * */
			onSelect: function(e,el){},

			/**
			 * Used to bring the previous situation before start moving the component
			 * @param {Event} e
			 * @param {Boolean} Indicates if rollback in anycase
			 * @private
			 * */
			rollback: function(e, force){
				var key = e.which || e.keyCode;
				if(key == this.opt.ESCAPE_KEY || force){
					this.sorter.moved = false;
					this.sorter.endMove();
				}
				return;
			},

			/**
			 * Returns badge element
			 * @return {HTMLElement}
			 * @private
			 */
			getBadgeEl: function(){
				if(!this.$badge)
					this.$badge = $(this.getBadge());
				return this.$badge;
			},

			/**
			 * Returns highlighter element
			 * @return {HTMLElement}
			 * @private
			 */
			getHighlighterEl: function(){
				if(!this.$hl)
					this.$hl = $(this.canvas.getHighlighter());
				return this.$hl;
			},

			stop: function(){
				SelectComponent.stop.apply(this, arguments);
				this.getBadgeEl().removeClass(this.badgeClass);
				this.getHighlighterEl().removeClass(this.hoverClass);
				var wp = this.$wrapper;
				wp.css('cursor', '').unbind().removeClass(this.noSelClass);
			}
		});
	});
