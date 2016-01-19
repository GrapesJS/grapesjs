define(['backbone', './SelectPosition'],
	function(Backbone, SelectPosition) {
		/** 
		 * @class InsertCustom
		 * */
		return _.extend({}, SelectPosition, {
			
			/** 
			 * Run method 
			 * */
			run: function(em, sender){
				this.enable();
				this.sender		= sender;
				this.opt 		= sender.get('options') || {};
				this.content	= this.opt.content;
			},
			
			enable: function(){
				SelectPosition.enable.apply(this, arguments);
				_.bindAll(this,'insertComponent');
				this.$wp	= this.$wrapper;
				this.$wp.on('click', this.insertComponent);
			},
			
			/** 
			 * Start insert event
			 * 
			 * @return void
			 * */
			insertComponent: function(){
				this.$wp.off('click', this.insertComponent);
				this.stopSelectPosition();
				this.removePositionPlaceholder();
				var object 	= this.buildContent();
				this.beforeInsert(object);						
				var model = this.posTargetCollection.add(object, { at: this.posIndex, silent:false });				
				if(this.opt.terminateAfterInsert && this.sender)
					this.sender.set('active',false);
				else
					this.enable();
				this.afterInsert(model, this);
			},
			
			/**
			 * Trigger before insert
			 * @param 	{Object}	obj
			 * 
			 * @return 	void
			 * */
			beforeInsert: function(obj){},
			
			/**
			 * Trigger after insert
			 * @param	{Object}	model	Model created after insert
			 * 
			 * @return 	void
			 * */
			afterInsert: function(model){},
			
			/** 
			 * Create different object, based on content, to insert inside canvas
			 * 
			 * @return 	{Object}
			 * */
			buildContent: function(){
				var result = {};
				if(typeof this.content === 'string'){
					result = {						
						content	: this.content, 
						tagName	: 'span',
					};
				}else if(typeof this.content === 'object'){
					result = this.content;
				}
				return result;
			},
		});
	});