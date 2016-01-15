define(['backbone'],
	function(Backbone) {
		/** 
		 * @class Property
		 * */
		return Backbone.Model.extend({
			
			defaults: {
				name : 			'', 			//Name of the property
				property: 		'',				//CSS property, eg. min-height
				type: 			'',				//Type of the property: integer | radio | select | color | file | composite | stack
				units: 			[],				//Unit of measure available, eg. ['px','%','em']
				unit: 			'',				//Unit selected
				defaults: 		'',				//Default value
				info: 			'',				//Description HTML
				value: 			'',				//Selected value of the property
				icon: 			'',				//If exists, a custom class will be attached and no text will be displayed
				preview:		false,			//Show layers preview. Available only for stack property
				functionName:	'',				//Indicates if value need to be wrapped in some function, for istance: transform: rotate(90deg)
				properties : 	{}, 			//For composite properties
				layers : 		{}, 			//For stack properties
				list: 			[],				//If exits, ignore type attribute ad display as multi-optional property
												//Any element could be as: 
												//	value : 'auto', 
												//	icon: 'auto', 
												//	defaults : true, 
												//  style:	'',			//custom style to the value of propriety
												//	name:''				//alternative view to value
			}
		
        });
	});