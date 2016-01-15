
define(['panelModel','appDir/panel_commands/buttons/main'],
		function(panelModel, commandsButtonsProvider) {
			describe('Panel', function() {
				
				it('Contiene valori di default', function() {	//Has default values
					var model = new panelModel({});
					model.should.be.ok;
					model.get('name').should.equal("");
					model.get('visible').should.equal(true);
					model.get('buttons').should.equal.undefined;
				});
				it('Imposta valori passati', function() {		//Sets passed attributes
					var model = new panelModel({ 
						name:'command',
						visible: false,
						buttons: commandsButtonsProvider.createButtons(),
					});
					model.should.be.ok;
					model.get('name').should.equal("command");
					model.get('visible').should.equal(false);
					model.get('buttons').should.have.length(5);
				});
			});
	});