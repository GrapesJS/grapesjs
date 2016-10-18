define(['backbone','./PropertyView', 'text!./../templates/propertyFile.html'],
	function (Backbone, PropertyView, propertyTemplate) {
	/**
	 * @class PropertyColorView
	 * */
	return PropertyView.extend({

		template: _.template(propertyTemplate),

		initialize: function(options) {
			PropertyView.prototype.initialize.apply(this, arguments);
			this.assets		= this.target.get('assets');
			this.modal		= this.target.get('Modal');
			this.am			= this.target.get('AssetManager');
			this.className 	= this.className + ' '+ this.pfx +'file';
			this.events['click #'+this.pfx+'close']		= 'removeFile';
			this.events['click #'+this.pfx+'images']	= 'openAssetManager';
			this.delegateEvents();
		},

		/** @inheritdoc */
		renderInput: function() {

			if(!this.$input){
				this.$input 		= $('<input>', {placeholder: this.defaultValue, type: 'text' });
			}

			if(!this.$preview){
				this.$preview		= this.$el.find('#' + this.pfx + 'preview-file');
			}

			if(!this.$previewBox){
				this.$previewBox	= this.$el.find('#' + this.pfx + 'preview-box');
			}

			if(!this.componentValue || this.componentValue == this.defaultValue)
				this.setPreviewView(0);
			else
				this.setPreviewView(1);

			this.setValue(this.componentValue,0);
		},

		/**
		 * Change visibility of the preview box
		 * @param bool Visibility
		 *
		 * @return void
		 * */
		setPreviewView: function(v){
			if(!this.$previewBox)
				return;
			if(v)
				this.$previewBox.addClass(this.pfx + 'show');
			else
				this.$previewBox.removeClass(this.pfx + 'show');
		},

		/**
		 * Spread url
		 * @param string Url
		 *
		 * @return void
		 * */
		spreadUrl: function(url){
			this.setValue('url("'+url+'")');
			this.setPreviewView(1);
		},

		/**
		 * Shows file preview
		 * @param string Value
		 * */
		setPreview: function(v){
			if(this.$preview)
				this.$preview.css('background-image',v);
		},

		/** @inheritdoc */
		setValue: function(value, f){
			PropertyView.prototype.setValue.apply(this, arguments);
			this.setPreview(value);
		},

		/** @inheritdoc */
		renderTemplate: function(){
			this.$el.append( this.template({
				upload	: 'Upload',
				assets	: 'Images',
				pfx		: this.pfx
			}));
		},

		/** @inheritdoc */
		cleanValue: function(){
			this.setPreviewView(0);
			this.model.set({value: ''},{silent: true});
		},

		/**
		 * Remove file from input
		 *
		 * @return void
		 * */
		removeFile:function(){
			this.model.set('value',this.defaultValue);
			PropertyView.prototype.cleanValue.apply(this, arguments);
			this.setPreviewView(0);
		},

		/**
		 * Open dialog for image selecting
		 * @param	{Object}	e	Event
		 *
		 * @return void
		 * */
		openAssetManager: function(e){
			var that	= this;
			if(this.modal && this.am){
				this.modal.setTitle('Select image');
				this.modal.setContent(this.am.render());
				this.am.setTarget(null);
				this.modal.open();
				this.am.onSelect(function(model){
					that.modal.close();
					that.spreadUrl(model.get('src'));
					that.valueChanged(e);
				});
			}
		},


	});
});
