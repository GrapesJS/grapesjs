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
				_.bindAll(this, 'copyComp', 'pasteComp', 'onFrameScroll');
				this.frameOff = this.canvasOff = this.adjScroll = null;
				var config	= this.config.em.get('Config');
				this.startSelectComponent();
				this.toggleClipboard(config.copyPaste);
			},

			/**
			 * Toggle clipboard function
			 * @param  {Boolean} active
			 * @return {this}
			 * @private
			 */
			toggleClipboard: function(active){
				var en = active || 0;
				if(en){
					key('⌘+c, ctrl+c', this.copyComp);
					key('⌘+v, ctrl+v', this.pasteComp);
				}else{
					key.unbind('⌘+c, ctrl+c');
					key.unbind('⌘+v, ctrl+v');
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
				this.selEl.on('mouseover', this.onHover)
					.on('mouseout', this.onOut)
					.on('click', this.onClick);
				var cw = this.getContentWindow();
				cw.on('scroll', this.onFrameScroll);
				cw.on('keydown', this.onKeyPress);
			},

			/**
			 * Stop select component event
			 * @private
			 * */
			stopSelectComponent: function() {
				if(this.selEl)
					this.selEl.trigger('mouseout').off('mouseover', this.onHover)
						.off('mouseout', this.onOut)
						.off('click', this.onClick);
				this.selEl = null;
				var cw = this.getContentWindow();
				cw.off('scroll', this.onFrameScroll);
				cw.off('keydown', this.onKeyPress);
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
				var pos = this.getElementPos(trg);
			  this.updateBadge(trg, pos);
				// Not mirrored
			  this.updateHighlighter(trg, pos);
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
				var m = $(e.target).data('model');
				if(!m)
					return;
				var s	= m.get('stylable');
				if(!(s instanceof Array) && !s)
					return;
				this.onSelect(e, e.target);
			},

			/**
			 * Update badge for the component
			 * @param {Object} Component
			 * @param {Object} pos Position object
			 * @private
			 * */
			updateBadge: function(el, pos) {
				var $el = $(el);
				this.cacheEl = el;
				var model = $el.data("model");
				if(!model || !model.get('badgable'))
					return;
				var badge = this.getBadge();
				badge.innerHTML = model.getName();
				var bStyle = badge.style;
				var u = 'px';
				bStyle.display = 'block';
				var canvasPos = this.canvas.getCanvasView().getPosition();
				var badgeH = badge ? badge.offsetHeight : 0;
				var badgeW = badge ? badge.offsetWidth : 0;
				var top = pos.top - badgeH < canvasPos.top ? canvasPos.top : pos.top - badgeH;
				var left = pos.left + badgeW < canvasPos.left ? canvasPos.left : pos.left;
				bStyle.top = top + u;
				bStyle.left = left + u;
			},

			/**
			 * Update highlighter element
			 * @param {HTMLElement} el
			 * @param {Object} pos Position object
			 * @private
			 */
			updateHighlighter: function(el, pos) {
				if(!this.hl)
					this.hl = $(this.canvas.getHighlighter());
				this.hl.css({
					left: pos.left,
					top: pos.top,
					height: pos.height,
					width: pos.width
				});
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
				this.cleanPrevious(md);
				var $el = $(el);
				var nMd = $el.data('model');
				if(nMd){
					var mirror = nMd.get('mirror');
					nMd = mirror ? mirror : nMd;

					// Close all opened components inside Navigator
					var opened = this.em.get('opened');
					for (var cid in opened){
						var m = opened[cid];
						m.set('open', 0);
					}
					var parent = nMd.collection ? nMd.collection.parent : null;
					while(parent){
						parent.set('open', 1);
						opened[parent.cid] = parent;
						parent = parent.collection ? parent.collection.parent : null;
					}

					this.editorModel.set('selectedComponent', nMd);
					nMd.set('status','selected');
				}
			},

			/**
			 * Removes all highlighting effects on components
			 * @private
			 * */
			clean: function() {
				if(this.selEl)
					this.selEl.removeClass(this.hoverClass);
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
				var el = this.cacheEl;
				if(el)
					this.updateBadge(el, this.getElementPos(el));
			},

			/**
			 * Returns element's data info
			 * @param {HTMLElement} el
			 * @return {Object}
			 * @private
			 */
			getElementPos: function(el, badge){
				return this.canvas.getCanvasView().getElementPos(el);
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
				if(model)
					model.set({
						status: '',
						state: '',
					});
			},

			/**
			 * Returns content window
			 * @private
			 */
			getContentWindow: function(){
				if(!this.contWindow)
					this.contWindow = $(this.frameEl.contentWindow);
				return this.contWindow;
			},

			run: function(em, sender) {
				this.enable();
			},

			stop: function() {
				this.stopSelectComponent();
				this.cleanPrevious(this.em.get('selectedComponent'));
				this.clean();
				this.em.set('selectedComponent', null);
				this.toggleClipboard();
				this.hideBadge();
			}
		};
});
