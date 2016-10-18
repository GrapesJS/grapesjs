/**
 * * [open](#open)
 * * [close](#close)
 * * [isOpen](#isopen)
 * * [setTitle](#settitle)
 * * [getTitle](#gettitle)
 * * [setContent](#setcontent)
 * * [getContent](#getcontent)
 *
 * Before using the methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var modal = editor.Modal;
 * ```
 * @module Modal
 */
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
       * Initialize module. Automatically called with a new instance of the editor
       * @param {Object} config Configurations
       * @private
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

        if(c.em)
  				c.em.on('loaded', function(){
  					this.render().appendTo(c.em.config.el || 'body');
  				}, this);

        return this;
      },

      /**
       * Open the modal window
       * @return {this}
       */
      open: function(){
        modal.show();
        return this;
      },

      /**
       * Close the modal window
       * @return {this}
       */
      close: function(){
        modal.hide();
        return this;
      },

      /**
       * Checks if the modal window is open
       * @return {Boolean}
       */
      isOpen: function(){
        return !!model.get('open');
      },

      /**
       * Set the title to the modal window
       * @param {string} title Title
       * @return {this}
       * @example
       * modal.setTitle('New title');
       */
			setTitle: function(title){
        model.set('title', title);
        return this;
			},

      /**
       * Returns the title of the modal window
       * @return {string}
       */
      getTitle: function(){
        return model.get('title');
      },

      /**
       * Set the content of the modal window
       * @param {string|HTMLElement} content Content
       * @return {this}
       * @example
       * modal.setContent('<div>Some HTML content</div>');
       */
			setContent: function(content){
				model.set('content', content);
        return this;
			},

      /**
       * Get the content of the modal window
       * @return {string}
       */
      getContent: function(){
        return model.get('content');
      },

			/**
			 * Returns content element
			 * @return {HTMLElement}
       * @private
			 */
			getContentEl: function(){
				return modal.getContent().get(0);
			},

      /**
       * Returns modal model
       * @return {Model}
       * @private
       */
      getModel: function(){
        return model;
      },

      /**
       * Render the modal window
       * @return {HTMLElement}
       * @private
       */
      render: function(){
        return modal.render().$el;
      }
		};
	};
});