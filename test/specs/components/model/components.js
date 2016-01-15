define(['Components'],
		function(Components) {
			describe('Components', function() {
				before(function () {
				    this.collection = new Components();
				    this.collection.localStorage._clear();
				});
				after(function () {			
					this.collection = null;
				});
				describe('Creazione', function() {
					it('Contiene valori di default', function() {//Has default values
						this.collection.should.be.ok;
						this.collection.should.have.length(0);
					});
				});
				describe('Modifica', function() {
					beforeEach(function () {
						this.collection.create({
							tagName : 		'span',
							classes : 		['one','two','three'],
							css : 			{ 'one':'vone', 'two':'vtwo', },
							attributes : 	{ 'data-one':'vone', 'data-two':'vtwo', },
						});
				    });
				    afterEach(function () {
				    	this.collection.localStorage._clear();
				    	this.collection.reset();
				    });
					it('Contiene un singolo componente', function(done) {	//Has single object
						var collection = this.collection, model;
						
						collection.once("reset", function () {
							collection.should.have.length(1);
							model = collection.at(0);
							model.should.be.ok;
							model.get('tagName').should.equal("span");
							model.get('classes').should.have.length(3);
							model.get('css').should.have.keys(["one", "two",]);
							model.get('attributes').should.have.keys(["data-one", "data-two",]);
							done();
						});
						collection.fetch({ reset: true });
					});
					
					it("Componenete eliminabile", function (done) {			//Can delete a component
						var collection = this.collection, model;
						collection.should.have.length(1);
						collection.once("remove", function () {
							collection.should.have.length(0);
					        done();
					     });

						model = collection.shift();
					});
				});
			});
	});