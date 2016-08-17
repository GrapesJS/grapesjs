/**
 * @class Modal
 * */
define(function(require) {
	return function() {
		var c = {},
		defaults = require('./config/config'),
		ModalM = require('./model/Modal'),
		ModalView	= require('./view/ModalView');
		var model, modal;

	  return {

	  	/**
       * Name of the module
       * @type {String}
       * @private
       */
      name: 'Modal',

      /**
       * Indicates if module is public
       * @type {Boolean}
       * @private
       */
      public: true,

      /**
       * Initialize module. Automatically called with a new instance of the editor
       * @param {Object} config Configurations
       */
      init: function(config) {
        c = config || {};
        for (var name in defaults) {
					if (!(name in c))
						c[name] = defaults[name];
				}

				var ppfx = c.pStylePrefix;
				if(ppfx)
					c.stylePrefix = ppfx + c.stylePrefix;

				model = new ModalM(c);
			  modal = new ModalView({
					model: model,
				  config: c,
				});
				c.em.on('loaded', function(){
					this.render().appendTo(c.em.config.el || 'body');
				}, this);
        return this;
      },

			getModel: function(){
				return model;
			},

			render: function(){
				return modal.render().$el;
			},

			show: function(){
				return modal.show();
			},

			hide: function(){
				return modal.hide();
			},

			setTitle: function(v){
				return modal.setTitle(v);
			},

			setContent: function(v){
				return modal.setContent(v);
			},

			/**
			 * Returns content element
			 * @return {HTMLElement}
			 */
			getContentEl: function(){
				return modal.getContent();
			}
		};
	};
});