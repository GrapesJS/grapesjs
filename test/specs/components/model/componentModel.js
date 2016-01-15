define(['componentModel'],
	function(componentModel) {
		describe('Component', function() {
			
			it('Contiene valori di default', function() {//Has default values
				var model = new componentModel({});
				var modelComponents = model.components;
				model.should.be.ok;
				model.get('tagName').should.equal("div");
				model.get('classes').should.be.empty;
				model.get('css').should.be.empty;
				model.get('attributes').should.be.empty;
				modelComponents.models.should.be.empty;
			});
			it('Non ci sono altri componenti all\'interno ', function() {//No other components inside
				var model = new componentModel({});
				var modelComponents = model.components;
				model.should.be.ok;
				modelComponents.models.should.be.empty;
			});
			it('Imposta valori passati', function() {//Sets passed attributes
				var model = new componentModel({
					tagName : 		'span',
					classes : 		['one','two','three'],
					css : 			{ 'one':'vone', 'two':'vtwo', },
					attributes : 	{ 'data-one':'vone', 'data-two':'vtwo', },
				});
				model.should.be.ok;
				model.get('tagName').should.equal("span");
				model.get('classes').should.have.length(3);
				model.get('css').should.have.keys(["one", "two",]);
				model.get('attributes').should.have.keys(["data-one", "data-two",]);
			});
			it('Possibilità di istanziare componenti annidati');		//Possibility to init nested components
		});
});