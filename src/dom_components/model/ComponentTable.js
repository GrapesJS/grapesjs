define(['./ComponentText'],
	function (Component) {

		return Component.extend({

			defaults: _.extend({}, Component.prototype.defaults, {
					tagName: 'table',
					columns: 3,
					rows: 2,
					traits: [{
						label: 'Columns',
						name: 'columns',
						changeProp: 1,
					},{
						label: 'Rows',
						name: 'rows',
						changeProp: 1,
					}]
			}),

			initialize: function(o, opt) {
				Component.prototype.initialize.apply(this, arguments);
				var components = this.get('components');
				var rows = this.get('rows');
				var columns = this.get('columns');

				// Init components if empty
				if(!components.length){
					var rowsToAdd = [];

					while(rows--){
						var columnsToAdd = [];
						var clm = columns;

						while (clm--) {
							columnsToAdd.push({
								type: 'cell',
								classes: ['cell']
							});
						}

						rowsToAdd.push({
							type: 'row',
							classes: ['row'],
							components: columnsToAdd
						});
					}
					components.add(rowsToAdd);
				}
			},

		},{

			/**
			 * Detect if the passed element is a valid component.
			 * In case the element is valid an object abstracted
			 * from the element will be returned
			 * @param {HTMLElement}
			 * @return {Object}
			 * @private
			 */
			isComponent: function(el) {
				var result = '';
				if(el.tagName == 'TABLE'){
					result = {type: 'table'};
				}
				return result;
			},

		});
});
