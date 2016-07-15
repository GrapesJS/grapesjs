define(['backbone', './CreateComponent'],
	function(Backbone, CreateComponent) {
		/**
		 * @class InsertCustom
		 * @private
		 * */
		return _.extend({}, CreateComponent, {

			init: function(){
				CreateComponent.init.apply(this, arguments);
				_.bindAll(this, 'insertComponent');
				this.allowDraw = 0;
			},

			/**
			 * Run method
			 * @private
			 * */
			run: function(em, sender, options) {
				this.em = em;
				this.sender = sender;
				this.opt = options || {};
				this.$wr = this.$wrapper;
				this.enable();
			},

			enable: function(){
				CreateComponent.enable.apply(this, arguments);
				this.$wr.on('click', this.insertComponent);
			},

			/**
			 * Start insert event
			 * @private
			 * */
			insertComponent: function(){
				this.$wr.off('click', this.insertComponent);
				this.stopSelectPosition();
				var object = this.buildContent();
				this.beforeInsert(object);
				var index = this.sorter.lastPos.index;
				// By default, collections do not trigger add event, so silent is used
				var model = this.create(this.sorter.target, object, index, null, {silent: false});

				if(this.opt.terminateAfterInsert && this.sender)
					this.sender.set('active', false);
				else
					this.enable();

				if(!model)
					return;

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