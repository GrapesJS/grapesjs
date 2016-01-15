define(function(require) {
	/**
	 * @class 	Modal
	 * @param 	{Object} Configurations
	 * 
	 * @return	{Object}
 	 * */
	function Modal(config)
	{
		var c			= config || {},
			defaults	= require('./config/config'),
			ModalM		= require('./model/Modal'),
			ModalView	= require('./view/ModalView');

		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}
		
		this.model		= new ModalM(c);
		var obj			= {
				model	: this.model,
		    	config	: c,
		};

	    this.modal 		= new ModalView(obj);
	}
	
	Modal.prototype	= {
			
			getModel	: function(){
				return	this.model;
			},
			
			render		: function(){
				return	this.modal.render().$el;
			},
			
			show		: function(){
				return this.modal.show();
			},
			
			hide		: function(){
				return this.modal.hide();
			},
			
			setTitle	: function(v){
				return this.modal.setTitle(v);
			},
			
			setContent	: function(v){
				return this.modal.setContent(v);
			},
	};
	
	return Modal;
});