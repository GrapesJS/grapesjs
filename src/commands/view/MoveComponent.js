define(['backbone', './SelectComponent','./SelectPosition'],
	function(Backbone, SelectComponent, SelectPosition) {

		return _.extend({}, SelectPosition, SelectComponent, {

			init: function(o){
				SelectComponent.init.apply(this, arguments);
				_.bindAll(this, 'initSorter','rollback', 'onEndMove');
				this.opt	= o;
				this.hoverClass	= this.ppfx + 'highlighter-warning';
				this.badgeClass	= this.ppfx + 'badge-warning';
				this.noSelClass	= this.ppfx + 'no-select';
			},

			enable: function(){
				this.frameEl.contentWindow.onscroll = this.onFrameScroll.bind(this);
				this.$el.css('cursor','move');
				this.$el.on('mousedown', this.initSorter);
				this.startSelectComponent();
				// Avoid strange moving behavior
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
				// Avoid badge showing on move
				this.cacheEl = null;
				this.startSelectPosition(e.target, this.frameEl.contentDocument);
				this.sorter.onEndMove = this.onEndMove.bind(this);
				this.stopSelectComponent(e);
				this.$el.off('mousedown', this.initSorter);
			},

			/**
			 * Callback after sorting
			 */
			onEndMove: function(){
				this.enable();
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
				this.$el = this.$wrapper;
				this.$badge = $(this.getBadge());
				this.$badge.addClass(this.badgeClass);
				this.$hl = $(this.canvas.getHighlighter());
				this.$hl.addClass(this.hoverClass);
				this.enable();
			},

			stop: function(){
				this.stopSelectComponent();
				this.$badge = $(this.getBadge());
				this.$badge.removeClass(this.badgeClass);
				this.$hl = $(this.canvas.getHighlighter());
				this.$hl.removeClass(this.hoverClass);
				this.frameEl.contentWindow.onscroll = null;
				this.$el.css('cursor','');//changes back aspect of the cursor
				this.$el.unbind();//removes all attached events
				this.$el.removeClass(this.noSelClass);
			}
		});
	});