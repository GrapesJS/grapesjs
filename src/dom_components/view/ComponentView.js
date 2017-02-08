define(['backbone', './ComponentsView'],
	function (Backbone, ComponentsView) {

		return Backbone.View.extend({

			events: {
				'click': 'initResize',
			},

			className : function(){
				return this.getClasses();
			},

			tagName: function(){
				return this.model.get('tagName');
			},

			initialize: function(opt){
				this.opts = opt || {};
				this.config = opt.config || {};
				this.pfx = this.config.stylePrefix || '';
				this.ppfx = this.config.pStylePrefix || '';
				this.components = this.model.get('components');
				this.attr = this.model.get("attributes");
				this.classe = this.attr.class || [];
				this.listenTo(this.model, 'destroy remove', this.remove);
				this.listenTo(this.model, 'change:style', this.updateStyle);
				this.listenTo(this.model, 'change:attributes', this.updateAttributes);
				this.listenTo(this.model, 'change:status', this.updateStatus);
				this.listenTo(this.model, 'change:state', this.updateState);
				this.listenTo(this.model.get('classes'), 'add remove change', this.updateClasses);
				this.$el.data('model', this.model);
				this.model.view = this;
				this.$el.data("collection", this.components);

				if(this.model.get('classes').length)
					this.importClasses();
			},

			/**
			 * Import, if possible, classes inside main container
			 * @private
			 * */
			importClasses: function(){
				var clm = this.config.em.get('SelectorManager');

				if(clm){
					this.model.get('classes').each(function(m){
							clm.add(m.get('name'));
					});
				}
			},

			/**
			 * Fires on state update. If the state is not empty will add a helper class
			 * @param	{Event} e
			 * @private
			 * */
			updateState: function(e){
				var cl = 'hc-state';
				var state = this.model.get('state');

				if(state){
					this.$el.addClass(cl);
				}else{
					this.$el.removeClass(cl);
				}
			},

			/**
			 * Update item on status change
			 * @param	{Event} e
			 * @private
			 * */
			updateStatus: function(e){
				var s = this.model.get('status'),
						pfx = this.pfx;
				switch(s) {
				    case 'selected':
				    	this.$el.addClass(pfx + 'selected');
				        break;
				    case 'moving':
				        break;
				    default:
				    	this.$el.removeClass(pfx + 'selected');
				}
			},

			/**
			 * Get classes from attributes.
			 * This method is called before initialize
			 *
			 * @return	{Array}|null
			 * @private
			 * */
			getClasses: function(){
				var attr = this.model.get("attributes"),
					classes	= attr['class'] || [];
				if(classes.length){
					return classes.join(" ");
				}else
					return null;
			},

			/**
			 * Update attributes
			 * @private
			 * */
			updateAttributes: function(){
				var attributes = {},
					attr = this.model.get("attributes");
				for(var key in attr) {
					  if(attr.hasOwnProperty(key))
					    attributes[key] = attr[key];
				}
				// Update src
				if(this.model.get("src"))
					attributes.src = this.model.get("src");

				var styleStr = this.getStyleString();

				if(styleStr)
					attributes.style = styleStr;

				this.$el.attr(attributes);
			},

			/**
			 * Update style attribute
			 * @private
			 * */
			updateStyle: function(){
				this.$el.attr('style', this.getStyleString());
			},

			/**
			 * Return style string
			 * @return	{string}
			 * @private
			 * */
			getStyleString: function(){
				var style	= '';
				this.style = this.model.get('style');
				for(var key in this.style) {
					  if(this.style.hasOwnProperty(key))
						  style += key + ':' + this.style[key] + ';';
				}

				return style;
			},

			/**
			 * Update classe attribute
			 * @private
			 * */
			updateClasses: function(){
				var str = '';

				this.model.get('classes').each(function(model){
					str += model.get('name') + ' ';
				});
				str = str.trim();

				if(str)
					this.$el.attr('class', str);
				else
					this.$el.removeAttr('class');

				// Regenerate status class
				this.updateStatus();
			},

			/**
			 * Reply to event call
			 * @param object Event that generated the request
			 * @private
			 * */
			eventCall: function(event){
				event.viewResponse = this;
			},

			/**
			 * Init component for resizing
			 */
			initResize: function () {
				var em = this.opts.config.em;
				var editor = em ? em.get('Editor') : '';
				var config = em ? em.get('Config') : '';
				var pfx = config.stylePrefix || '';
				var attrName = 'data-' + pfx + 'handler';
				var resizeClass = pfx + 'resizing';
				var model = this.model;
				var modelToStyle;

				var toggleBodyClass = function(method, e, opts) {
					var handlerAttr = e.target.getAttribute(attrName);
					var resizeHndClass = pfx + 'resizing-' + handlerAttr;
					var classToAdd = resizeClass;// + ' ' +resizeHndClass;
					if (opts.docs) {
						opts.docs.find('body')[method](classToAdd);
					}
				};

				if(editor && this.model.get('resizable')) {
					editor.runCommand('resize', {
						el: this.el,
						options: {
							onStart: function (e, opts) {
								toggleBodyClass('addClass', e, opts);
								modelToStyle = em.get('StyleManager').getModelToStyle(model);
							},
							// Update all positioned elements
							onMove: function () {
								editor.trigger('change:canvasOffset');
							},
							onEnd: function (e, opts) {
								toggleBodyClass('removeClass', e, opts);
								editor.trigger('change:canvasOffset');
							},
							updateTarget: function(el, rect, store) {
								if (!modelToStyle) {
									return;
								}
								var style = _.clone(modelToStyle.get('style'));
								style.width = rect.w;
								style.height = rect.h;
								modelToStyle.set('style', style, {avoidStore: !store});
								em.trigger('targetStyleUpdated');
							}
						}
					});
				}
			},

			/**
			 * Prevent default helper
			 * @param  {Event} e
			 * @private
			 */
			prevDef: function (e) {
				e.preventDefault();
			},

			render: function() {
				this.updateAttributes();
				this.updateClasses();
				this.$el.html(this.model.get('content'));
				var view = new ComponentsView({
					collection: this.model.get('components'),
					config: this.config,
					defaultTypes: this.opts.defaultTypes,
					componentTypes: this.opts.componentTypes,
				});

				// With childNodes lets avoid wrapping 'div'
				this.$el.append(view.render(this.$el).el.childNodes);
				return this;
			},

		});
});
