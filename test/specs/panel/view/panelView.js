
define(['panelModel', 'panelView', 'Buttons', 'appDir/panel_commands/buttons/main'],
		function(panelModel,panelView, Buttons, commandsButtonsProvider) {
			describe('PanelView', function() {
				before(function () {
					this.testPanelName = 'commands';
					this.$fixture = $("<div id='panel-fixture'></div>");
				});
				
				beforeEach(function () {
					this.view = new panelView({
						model: new panelModel({
							name : this.testPanelName,
							buttons: commandsButtonsProvider.createButtons(),
						}),
						eventsQ : {
							commands: {createComponent : {}}
						},
					});
					this.$fixture.empty().appendTo($("#fixtures"));
					this.$fixture.html(this.view.render().el);
				});
				afterEach(function () {
					//this.view.model.destroy();
				});
	
				after(function () {
					//this.$fixture.remove();
				});
				describe("Inizializzazione", function () {
					it('Render pannello', function() {	//Has default values
						this.view.should.be.ok;
						this.view.$el.attr('id').should.equal(this.testPanelName);
					});
					it('Non deve essere vuoto', function() {
						this.view.$el.find('.c a').should.have.length.above(0);
					});
					it('Nessun elemento deve essere attivo', function() {
						this.view.$el.find('.c a.active').should.have.length(0);
					});
				});
				describe("Interazione", function(){
					it('Elemento attivo alla richiesta', function(){
						this.view.model.buttons.models[0].toggle();
						this.view.$el.find('.c a.active').should.have.length(1);
					});
				});
			});
	});