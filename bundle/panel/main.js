define(function(require) {
	/**
	 * @class 	Panel
	 * @param 	{Object} Configurations
	 * 
	 * @return	{Object}
 	 * */
	function Panel(config)
	{
		var c				= config || {},
			defaults		= require('./config/config'),
			Panels			= require('./model/Panels'),
			PanelsView		= require('./view/PanelsView');

	    // Set default options
		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}
		
		this.panels			= new Panels(c.defaults);
		var obj				= {
				collection	: this.panels,
		    	config		: c,
		};
		
	    this.PanelsView 	= new PanelsView(obj);
	}
	
	Panel.prototype	= {
			
			getPanels	: function(){
				return this.panels;
			},
			
			addPanel	: function(obj){
				return this.panels.add(obj);
			},
			
			getPanel	: function(id){
				var res	= this.panels.where({id: id});
				return res.length ? res[0] : null;
			},
			
			addButton	: function(panelId, obj){
				var pn	= this.getPanel(panelId);
				return pn ? pn.get('buttons').add(obj) : null;
			},
			
			getButton	: function(panelId, id){
				var pn	= this.getPanel(panelId);
				if(pn){
					var res	= pn.get('buttons').where({id: id});
					return res.length ? res[0] : null;
				}
				return null;
			},
			
			active		: function(){
				this.getPanels().each(function(p){
	    			p.get('buttons').each(function(btn){
	    				if(btn.get('active'))
	    					btn.trigger('updateActive');
	    			});
	    		});
			},
			
			render		: function(){
				return this.PanelsView.render().el;
			},
	};
	
	return Panel;
});