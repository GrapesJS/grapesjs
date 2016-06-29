define(['backbone', './SelectPosition'],
	function(Backbone, SelectPosition) {
		/**
		 * @class InsertCustom
		 * @private
		 * */
		return _.extend({}, SelectPosition, {

			/**
			 * Run method
			 * @private
			 * */
			run: function(em, sender, options){
				this.enable();
				this.em = em;
				this.sender = sender;
				this.opt = options || {};
			},

			enable: function(){
				SelectPosition.enable.apply(this, arguments);
				_.bindAll(this,'insertComponent');
				this.$wp	= this.$wrapper;
				this.$wp.on('click', this.insertComponent);
			},

			/**
			 * Start insert event
			 * @private
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

				if(this.em)
						this.em.editor.initChildrenComp(model);

				this.afterInsert(model, this);
			},

			/**
			 * Trigger before insert
			 * @param 	{Object}	obj
			 * @private
			 * */
			beforeInsert: function(obj){},

			/**
			 * Trigger after insert
			 * @param	{Object}	model	Model created after insert
			 * @private
			 * */
			afterInsert: function(model){},

			/**
			 * Create different object, based on content, to insert inside canvas
			 *
			 * @return 	{Object}
			 * @private
			 * */
			buildContent: function(){
				return this.opt.content || {};
			},
		});
	});