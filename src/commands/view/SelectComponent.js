define(function(require) {
		/**
		 * @class SelectComponent
		 * @private
		 * */
		 var ToolbarView = require('DomComponents/view/ToolbarView');
		 var Toolbar = require('DomComponents/model/Toolbar');

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
				this.config.em.on('change:canvasOffset', this.onFrameScroll);
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

				// On CANC (46) or Backspace (8)
				if(key == 8 || key == 46) {
					if(!focused)
						e.preventDefault();
					if(comp && !focused) {
						if(!comp.get('removable'))
							return;
						comp.set('status','');
						comp.destroy();
						this.hideBadge();
						this.clean();
						this.hideHighlighter();
						this.editorModel.set('selectedComponent', null);
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
				this.hideHighlighter();
			},

			/**
			 * Hide Highlighter element
			 */
			hideHighlighter: function () {
				this.canvas.getHighlighter().style.display = 'none';
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
				var hlEl = this.canvas.getHighlighter();
				var hlStyle = hlEl.style;
				var unit = 'px';
				hlStyle.left = pos.left + unit;
				hlStyle.top = pos.top + unit;
				hlStyle.height = pos.height + unit;
				hlStyle.width = pos.width + unit;
				hlStyle.display = 'block';
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
					while(parent) {
						parent.set('open', 1);
						opened[parent.cid] = parent;
						parent = parent.collection ? parent.collection.parent : null;
					}

					this.editorModel.set('selectedComponent', nMd);
					nMd.set('status','selected');
					this.updateToolbar(nMd);
				}
			},

			/**
			 * Update toolbar if the component has one
			 * @param {Object} model
			 */
			updateToolbar: function(model) {
				var toolbar = model.get('toolbar');
				var ppfx = this.ppfx;
				var showToolbar = this.config.em.get('Config').showToolbar;

				if (showToolbar && toolbar && toolbar.length) {

					if(!this.toolbar) {
						var toolbarEl = this.canvas.getToolbarEl();
						toolbarEl.innerHTML = '';
						this.toolbar = new Toolbar(toolbar);
						var toolbarView = new ToolbarView({
							collection: this.toolbar,
							editor: this.editor
						});
						toolbarEl.appendChild(toolbarView.render().el);
					}

					this.toolbar.reset(toolbar);

					var view = model.get('view');
					if(view) {
						this.updateToolbarPos(view.el);
					}
				}
			},

			/**
			 * Update toolbar positions
			 * @param {HTMLElement} el
			 * @param {Object} pos
			 */
			updateToolbarPos: function(el, elPos) {
				var toolbarEl = this.canvas.getToolbarEl();
				var canvasPos = this.getCanvasPosition();
				var pos = elPos || this.getElementPos(el);
				var toolbarStyle = toolbarEl.style;
				var unit = 'px';
				toolbarStyle.display = 'flex';
				var elTop = pos.top - toolbarEl.offsetHeight;
				var elLeft = pos.left + pos.width - toolbarEl.offsetWidth;
				var leftPos = elLeft < canvasPos.left ? canvasPos.left : elLeft;

				// This will make the toolbar follow the window up
				// and down while scrolling
				var topPos = elTop < canvasPos.top ? canvasPos.top : elTop;
				// This will stop the toolbar when the end of the element is reached
				topPos = topPos > (pos.top + pos.height) ? (pos.top + pos.height) : topPos;
				toolbarStyle.left = elLeft + unit;
				toolbarStyle.top = topPos + unit;
			},

			/**
			 * Return canvas dimensions and positions
			 * @return {Object}
			 */
			getCanvasPosition: function () {
				return this.canvas.getCanvasView().getPosition();
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
				if(el){
					var elPos = this.getElementPos(el);
					this.updateBadge(el, elPos);
					var model = this.editorModel.get('selectedComponent');

					if (model) {
						var view = model.get('view');
						this.updateToolbarPos(view.el);
					}
				}
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

			run: function(em) {
				if(em && em.get)
					this.editor = em.get('Editor');
				this.enable();
			},

			stop: function() {
				this.stopSelectComponent();
				this.cleanPrevious(this.em.get('selectedComponent'));
				this.clean();
				this.em.set('selectedComponent', null);
				this.toggleClipboard();
				this.hideBadge();
				this.canvas.getToolbarEl().style.display = 'none';
				this.config.em.off('change:canvasOffset', this.onFrameScroll);
			}
		};
});
