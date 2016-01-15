define(['backbone', './ComponentsView'], 
	function (Backbone, ComponentsView) {
		/** 
		 * @class ComponentView
		 * */
		return Backbone.View.extend({
			
			className : function(){ 						//load classes from model
				return this.getClasses(); 
			},
			
			tagName: function(){ 							//load tagName from model
				return this.model.get('tagName'); 
			},
			
			initialize: function(opt){
				this.config			= opt.config;
				this.components 	= this.model.get('components');
				this.attr			= this.model.get("attributes");
				this.classe			= this.attr.class || [];
				this.listenTo( this.model, 'destroy remove', 	this.remove);				
				this.listenTo( this.model, 'change:style', 		this.updateStyle);				
				this.listenTo( this.model, 'change:attributes', this.updateAttributes);
				this.$el.data("model", this.model);
				this.$el.data("model-comp", this.components);
			},
			
			/** 
			 * Get classes from attributes. 
			 * This method is called before initialize
			 * 
			 * @return	{Array}|null
			 * */
			getClasses: function(){
				var attr	= this.model.get("attributes"),
					classes	= attr['class'] || [];
				if(classes.length){
					return classes.join(" ");
				}else
					return null;
			},
			
			/** 
			 * Update attributes
			 * 
			 * @return void
			 * */
			updateAttributes: function(){
				var attributes	= {},
					attr		= this.model.get("attributes");
				for(var key in attr) {			
					  if(attr.hasOwnProperty(key))
					    attributes[key] = attr[key];
				}
				// Update src
				if(this.model.get("src"))
					attributes.src = this.model.get("src");
				
				attributes.style = this.getStyleString();
				
				this.$el.attr(attributes);
			},
			
			/** 
			 * Update style attribute
			 * 
			 * @return void
			 * */
			updateStyle: function(){
				this.$el.attr('style', this.getStyleString());
			},
			
			/** 
			 * Return style string
			 * 
			 * @return	{String}
			 * */
			getStyleString: function(){
				var style	= '';
				this.style	= this.model.get('style');
				for(var key in this.style) {
					  if(this.style.hasOwnProperty(key))
						  style += key + ':' + this.style[key] + ';';
				}
				
				return style;
			},
			
			/** 
			 * Update classe attribute
			 * 
			 * @return void
			 * */
			updateClasses: function(){
				if(this.classe.length)
					this.$el.attr('class', this.classe.join(" "));
			},
			
			/**
			 * Reply to event call 
			 * @param object Event that generated the request
			 * */
			eventCall: function(event){
				event.viewResponse = this;
			},
			
			render: function() {
				this.updateAttributes();
				this.$el.html(this.model.get('content'));
				var view = new ComponentsView({ 
					collection	: this.components,
					config		: this.config,
				});
				this.$components = view;
				// With childNodes lets avoid wrapping 'div'
				this.$el.append(view.render(this.$el).el.childNodes);
				return this;
			},
			
			/** TODO DELETE
			 * Add new component to canvas 
			 * @param Object Component added
			 * @param Object Collection
			 * @param Object Parameters
			 * 
			addComponent: function (component, collection, params) {
				var viewObject = require('componentView'); 			//Set default view
				if(component.get('editable'))						//If editable component, change view
					viewObject = require('componentTextView');		//Change view in case is editable
				if(component.get('src')){							//If editable component, change view
					viewObject = require('componentImageView');		//Change view in case is editable
				}
				var view = new viewObject({ 
					model: 			component,
					editorModel:	this.editorModel,
				});
				if(params && (typeof params.at!='undefined') ){		//If i have index position change the way to append
					if (params.at === 0){
						this.$el.prepend(view.render().el);
					}else{
			        	this.$el.children().filter(function(){ 
			        		return !$(this).data('helper');
			        	}).eq(params.at-1).after(view.render().el);
			        	//console.log("insert at "+params.at+" children: "+this.$el.children().filter(function() { return !$(this).data('helper');}).length);
			        }
				}else
					this.$el.append(view.render().el);
			},
			*/
			
		});
});
