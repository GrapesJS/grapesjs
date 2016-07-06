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

				// TODO refactor
				if(config.copyPaste){
					key('⌘+c, ctrl+c', this.copyComp);
					key('⌘+v, ctrl+v', this.pasteComp);
				}
			},

			/**
			 * Copy component to the clipboard
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
						this.hideBadge();
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
			  this.hideBadge();
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
			 * @private
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
					var elP = this.getElementPos($el);
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
				var $el = $(el);
				this.cacheEl = $el;
				var model = $el.data("model");
				if(!model || !model.get('badgable'))
					return;
				var badge = this.getBadge();
				badge.innerHTML = model.getName();
				var bStyle = badge.style;
				var u = 'px';
				bStyle.display = 'block';
				var elP = this.getElementPos($el, badge);
				bStyle.left = elP.leftP + u;
				bStyle.top = elP.top + u;
			},

			/**
			 * Returns badge element
			 * @return {HTMLElement}
			 * @private
			 */
			getBadge: function(){
				return this.canvas.getBadgeEl();
			},

			/**
			 * On frame scroll callback
			 * @private
			 */
			onFrameScroll: function(e){
				this.canvasTool.style.top = '-' + this.bodyEl.scrollTop + 'px';
				this.canvasTool.style.left = '-' + this.bodyEl.scrollLeft + 'px';
				if(this.cacheEl)
					this.updateBadge(this.cacheEl);
			},

			/**
			 * Returns element's data info
			 * @param {HTMLElement} el
			 * @return {Object}
			 * @private
			 */
			getElementPos: function(el, badge){
				if(!this.frameOff)
					this.frameOff = this.offset(this.canvas.getFrameEl());
				if(!this.canvasOff)
					this.canvasOff = this.offset(this.canvas.getElement());
				var eo = el.offset();
				var bodyEl = this.getCanvasBody();
				var bdg = badge ? badge : null;
				var badgeH = bdg ? bdg.offsetHeight : 0;
				var badgeW = bdg ? bdg.offsetWidth : 0;
				var top = eo.top + this.frameOff.top - this.canvasOff.top;
				var left = eo.left + this.frameOff.left - this.canvasOff.left;
				var topScroll = this.frameOff.top + bodyEl.scrollTop;
				var leftScroll = this.frameOff.left + bodyEl.scrollLeft;
				var topP = top;
				top = (top - badgeH) < topScroll ? topScroll : top - badgeH;
				var leftP = (left + badgeW) < leftScroll ? leftScroll - badgeW : left;
				return {topP: topP, leftP: leftP, top: top, left: left, height: el.outerHeight(), width: el.outerWidth() };
			},

			/**
			 * Hide badge
			 * @private
			 * */
			hideBadge: function () {
				this.getBadge().style.display = 'none';
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
			  this.frameOff = this.canvasOff = this.adjScroll = null;
			  $(this.frameEl.contentWindow).off('keydown');

			  var frameEl = this.canvas.getFrameEl();
				frameEl.contentWindow.onscroll = null;
				var sel = this.editorModel.get('selectedComponent');
				if(sel)
					this.cleanPrevious(sel);
				this.$el.unbind();												//removes all attached events
				this.hideBadge();
				this.clean();
				this.selEl.unbind('mouseover').unbind('mouseout').unbind('click');
				this.editorModel.set('selectedComponent',null);
				key.unbind('⌘+c, ctrl+c');
				key.unbind('⌘+v, ctrl+v');
				$(this.frameEl.contentWindow).off('keydown', this.onKeyPress);
			}
		};
});