/**
 * This module manages panels and buttons inside the editor.
 * You can init the editor with all panels and buttons necessary via configuration
 *
 * ```js
 * var editor = new GrapesJS({
 * 	...
 *  panels: {...} // Check below for the possible properties
 * 	...
 * });
 * ```
 *
 *
 * Before using methods you should get first the module from the GrapesJs instance, in this way:
 *
 * ```js
 * var panelService = editor.get('Panels');
 * ```
 *
 * @module Panels
 * @param {Object} config Configurations
 */
define(function(require) {

	var Panels = function(config){

		var c = config || {},
			defaults = require('./config/config'),
			Panels = require('./model/Panels'),
			PanelsView = require('./view/PanelsView');

	  // Set default options
		for (var name in defaults) {
			if (!(name in c))
				c[name] = defaults[name];
		}

		var panels = new Panels(c.defaults);
		var obj = {
			collection : panels,
			config : c,
		};

	  var PanelsViewObj = new PanelsView(obj);

	  return {

	  	/**
	  	 * Returns the collection of panels
	  	 * @return {Collection} Collection of panel
	  	 */
	  	getPanels: function(){
				return panels;
			},

			/**
			 * Add new panel to the collection
			 * @param {Object|Panel} panel Object with right properties or an instance of Panel
			 * @return {Panel} Added panel. Useful in case of passed argument was an Object
			 * @example
			 * var newPanel = panelService.addPanel({
			 *  id: 'myNewPanel',
			 * 	visible	: true,
			 * 	buttons	: [...],
			 * });
			 */
			addPanel: function(panel){
				return panels.add(panel);
			},

			/**
			 * Get panel by ID
			 * @param  {string} id Id string
			 * @return {Panel|null}
			 * @example
			 * var myPanel = panelService.getPanel('myNewPanel');
			 */
			getPanel	: function(id){
				var res	= panels.where({id: id});
				return res.length ? res[0] : null;
			},

			/**
			 * Add button to the panel
			 * @param {string} panelId Panel's ID
			 * @param {Object|Button} button Button object or instance of Button
			 * @return {Button|null} Added button. Useful in case of passed button was an Object
			 * @example
			 * var newButton = panelService.addButton('myNewPanel',{
			 * 	id: 'myNewButton',
			 * 	className: 'someClass',
			 * 	command: 'someCommand',
			 * 	attributes: { title: 'Some title'},
			 * 	active: false,
			 * });
			 */
			addButton	: function(panelId, button){
				var pn	= this.getPanel(panelId);
				return pn ? pn.get('buttons').add(button) : null;
			},

			/**
			 * Get button from the panel
			 * @param {string} panelId Panel's ID
			 * @param {string} id Button's ID
			 * @return {Button|null}
			 * @example
			 * var button = panelService.getButton('myPanel','myButton');
			 */
			getButton	: function(panelId, id){
				var pn	= this.getPanel(panelId);
				if(pn){
					var res	= pn.get('buttons').where({id: id});
					return res.length ? res[0] : null;
				}
				return null;
			},

			/**
			 * Render panels and buttons
			 * @return {HTMLElement}
			 */
			render		: function(){
				return PanelsViewObj.render().el;
			},

			/**
			 * Active activable buttons
			 * @private
			 */
			active		: function(){
				this.getPanels().each(function(p){
	    			p.get('buttons').each(function(btn){
	    				if(btn.get('active'))
	    					btn.trigger('updateActive');
	    			});
	    		});
			},

	  };
	};

	return Panels;
});