define(function() {
		/**
		 * @class SelectComponent
		 * @private
		 * */
		return {

			init: function(o){
				_.bindAll(this, 'onHover', 'onOut', 'onClick', 'onKeyPress');
			},


			enable: function() {
				_.bindAll(this,'copyComp','pasteComp');
				this.frameEl.contentWindow.onscroll = this.onFrameScroll.bind(this);
				var config	= this.config.em.get('Config');
				this.startSelectComponent();

				if(config.copyPaste){
					key('⌘+c, ctrl+c', this.copyComp);
					key('⌘+v, ctrl+v', this.pasteComp);
				}
			},

			/**
			 * Copy component to clipboard
			 * @private
			 */
			copyComp: function() {
					var el = this.editorModel.get('selectedComponent');

					if(el && el.get('copyable'))
						 this.editorModel.set('clipboard', el);
			},

			/**
			 * Paste component from clipboard
			 * @private
			 */
			pasteComp: function() {
					var clp = this.editorModel.get('clipboard'),
							sel = this.editorModel.get('selectedComponent');
					if(clp && sel && sel.collection){
						var index = sel.collection.indexOf(sel),
								clone = clp.clone();
						sel.collection.add(clone, { at: index + 1 });
					}
			},

			/**
			 * Start select component event
			 * @private
			 * */
			startSelectComponent: function() {
				this.selEl = $(this.getCanvasBody()).find('*');
				this.selEl.on('mouseover',this.onHover)
						.on('mouseout', this.onOut)
						.on('click', this.onClick);
				$(this.frameEl.contentWindow).on('keydown', this.onKeyPress);
			},

			/**
			 * On key press event
			 * @private
			 * */
			onKeyPress: function(e) {
				var key = e.which || e.keyCode;
				var comp = this.editorModel.get('selectedComponent');
				var focused = this.frameEl.contentDocument.activeElement.tagName !== 'BODY';
				if(key == 8 || key == 46) {
					if(!focused)
						e.preventDefault();
					if(comp && !focused){
						if(!comp.get('removable'))
						return;
						comp.set('status','');
						comp.destroy();
						this.removeBadge();
						this.clean();
						this.editorModel.set('selectedComponent',null);
					}
				}
			},

			/**
			 * Hover command
			 * @param {Object}	e
			 * @private
			 */
			onHover: function(e) {
				e.stopPropagation();
				var trg = e.target;
				// Adjust tools scroll top
				if(!this.adjScroll){
					this.adjScroll = 1;
					this.onFrameScroll(e);
				}
			  this.updateBadge(trg);
			  this.updateHighlighter(trg);
			},

			/**
			 * Out command
			 * @param {Object}	e
			 * @private
			 */
			onOut: function(e) {
				e.stopPropagation();
			  if(this.badge)
			  	this.badge.css({ left: -10000, top:-10000 });
			  if(this.hl)
			  	this.hl.css({ left: -10000, top:-10000 });
			},

			/**
			 * Hover command
			 * @param {Object}	e
			 * @private
			 */
			onClick: function(e) {
				var s	= $(e.target).data('model').get('stylable');
				if(!(s instanceof Array) && !s)
					return;
				this.onSelect(e, e.target);
			},

			/**
			 * Update highlighter element
			 * @param {HTMLElement} el
			 */
			updateHighlighter: function(el){
				if(!this.hl)
					this.hl = $(this.canvas.getHighlighter());
				var elPos = this.getElementPos($(el));
				this.hl.css({ left: elPos.left, top: elPos.topP, height: elPos.height, width: elPos.width });
			},

			/** Stop select component event
			 * @param Event
			 * @private
			 * */
			stopSelectComponent: function(e) {
				if(this.selEl)
					this.selEl.trigger('mouseout').off('mouseover mouseout click');
				this.selEl = null;
			},

			/**
			 * Say what to do after the component was selected
			 * @param {Object}	e
			 * @param {Object}	el
			 * @private
			 * */
			onSelect: function(e, el) {
				e.stopPropagation();
				var md 	= this.editorModel.get('selectedComponent');
				if(md)
					this.cleanPrevious(md);
				var $el = $(el);
				var nMd = $el.data('model');
				if(nMd){
					this.editorModel.set('selectedComponent', nMd);
					nMd.set('status','selected');
					if(!this.hlSel)
						this.hlSel = $(this.canvas.getHighlighterSel());
					var elP = this.getElementPos($el);
					this.hlSel.css({left: elP.left, top: elP.topP, height: elP.height, width: elP.width });
				}
			},

			/**
			 * Removes all highlighting effects on components
			 * @private
			 * */
			clean: function() {
				this.selEl.removeClass(this.hoverClass);
			},

			/**
			 * Update badge for the component
			 * @param Object Component
			 * @private
			 * */
			updateBadge: function(el) {
				console.log('Hover');
				var $el = $(el);
				this.cacheEl = $el;
				var model = $el.data("model");
				if(!model || !model.get('badgable'))
					return;
				if(!this.badge)
					this.createBadge();
				this.updateBadgeLabel(model);
				var elPos = this.getElementPos($el);
				this.badge.css({ left: elPos.left, top: elPos.top });
			},

			/**
			 * On frame scroll callback
			 * @param  {[type]} e [description]
			 * @return {[type]}   [description]
			 */
			onFrameScroll: function(e){
				this.canvasTool.style.top = '-' + this.bodyEl.scrollTop + 'px';
				var elPos = this.getElementPos(this.cacheEl);
				this.badge.css({ left: elPos.left, top: elPos.top });
			},

			/**
			 * Returns element's data info
			 * @param {HTMLElement} el
			 * @return {Object}
			 */
			getElementPos: function(el){
				if(!this.frameOff)
					this.frameOff = this.offset(this.canvas.getFrameEl());
				if(!this.canvasOff)
					this.canvasOff = this.offset(this.canvas.getElement());
				var eo = el.offset();//this.offset(el);
				var bodyEl = this.getCanvasBody();
				var badgeH = this.badge.outerHeight();
				var top = eo.top + this.frameOff.top - this.canvasOff.top;// - bodyEl.scrollTop
				var left = eo.left + this.frameOff.left - bodyEl.scrollLeft - this.canvasOff.left;
				var topScroll = this.frameOff.top + bodyEl.scrollTop;
				var topP = top;
				if( (top - badgeH) < topScroll)
					top = topScroll;
				else
					top -= badgeH;
				return {topP: topP, top: top, left: left, height: el.height(), width: el.width() };
			},

			/**
			 * Create badge for the component
			 * @private
			 * */
			createBadge: function () {
				this.badge = $('<div>', {class: this.badgeClass + " no-dots"}).appendTo(this.getCanvasTools());
			},

			/**
			 * Remove badge
			 * @private
			 * */
			removeBadge: function () {
				if(this.badge){
					this.badge.remove();
					delete this.badge;
				}
			},

			/**
			 * Updates badge label
			 * @param {Object} Model
			 * @private
			 * */
			updateBadgeLabel: function (model) {
				if(model)
					this.badge.html(model.getName());
			},

			/**
			 * Clean previous model from different states
			 * @param {Component} model
			 * @private
			 */
			cleanPrevious: function(model) {
				model.set({
					status: '',
					state: '',
				});
			},

			run: function(em, sender) {
				this.enable();
			},

			stop: function() {
				if(!this.selEl)
					this.selEl = $(this.getCanvasBody()).find('*');
				if(this.hlSel)
			  	this.hlSel.css({ left: -10000, top:-10000 });
			  this.frameOff = this.canvasOff = this.adjScroll = null;
			  $(this.frameEl.contentWindow).off('keydown');

			  var frameEl = this.canvas.getFrameEl();
				frameEl.contentWindow.onscroll = null;
				var sel = this.editorModel.get('selectedComponent');
				if(sel)
					this.cleanPrevious(sel);
				this.$el.unbind();												//removes all attached events
				this.removeBadge();
				this.clean();
				this.selEl.unbind('mouseover').unbind('mouseout').unbind('click');
				this.editorModel.set('selectedComponent',null);
				key.unbind('⌘+c, ctrl+c');
				key.unbind('⌘+v, ctrl+v');
				$(document).off('keydown', this.onKeyPress);
			}
		};
});