var modulePath = './../../../test/specs/panels';

define([
				'Panels',
				modulePath + '/model/PanelModels',
				modulePath + '/view/PanelView',
				modulePath + '/view/PanelsView',
				modulePath + '/view/ButtonView',
				modulePath + '/view/ButtonsView',
				modulePath + '/e2e/PanelsE2e'
				 ],
	function(
					Panels,
					Models,
					PanelView,
					PanelsView,
					ButtonView,
					ButtonsView,
					e2e
					) {

		describe('Panels', function() {

			describe('Main', function() {

				var obj;

				beforeEach(function () {
					obj = new Panels().init();
				});

				afterEach(function () {
					delete obj;
				});

				it('Object exists', function() {
					obj.should.be.exist;
				});

				it("No panels inside", function() {
					obj.getPanels().length.should.equal(3);
				});

				it("Adds new panel correctly via object", function() {
					var panel = obj.addPanel({id: 'test'});
					panel.get('id').should.equal('test');
				});

				it("New panel has no buttons", function() {
					var panel = obj.addPanel({id: 'test'});
					panel.get('buttons').length.should.equal(0);
				});

				it("Adds new panel correctly via Panel instance", function() {
					var oPanel = new obj.Panel({id: 'test'});
					var panel = obj.addPanel(oPanel);
					panel.should.deep.equal(oPanel);
					panel.get('id').should.equal('test');
				});

				it("getPanel returns null in case there is no requested panel", function() {
					(obj.getPanel('test') == null).should.equal(true);
				});

				it("getPanel returns correctly the panel", function() {
					var panel = obj.addPanel({id: 'test'});
					obj.getPanel('test').should.deep.equal(panel);
				});

				it("Can't add button to non existent panel", function() {
					(obj.addButton('test', {id:'btn'}) == null).should.equal(true);
				});

				it("Add button correctly", function() {
					var panel = obj.addPanel({id: 'test'});
					var btn = obj.addButton('test', {id:'btn'});
					panel.get('buttons').length.should.equal(1);
					panel.get('buttons').at(0).get('id').should.equal('btn');
				});

				it("getButton returns null in case there is no requested panel", function() {
					(obj.getButton('test', 'btn') == null).should.equal(true);
				});

				it("getButton returns null in case there is no requested button", function() {
					var panel = obj.addPanel({id: 'test'});
					(obj.getButton('test', 'btn') == null).should.equal(true);
				});

				it("getButton returns correctly the button", function() {
					var panel = obj.addPanel({id: 'test'});
					var btn = obj.addButton('test', {id:'btn'});
					obj.getButton('test', 'btn').should.deep.equal(btn);
				});

				it("Renders correctly", function() {
					obj.render().should.be.ok;
				});

				it("Active correctly activable buttons", function() {
					var spy = sinon.spy();
					var panel = obj.addPanel({id: 'test'});
					var btn = obj.addButton('test', {id:'btn', active: true});
					btn.on('updateActive', spy);
					obj.active();
					spy.called.should.equal(true);
				});

			});

			Models.run();
			PanelView.run();
			PanelsView.run();
			ButtonView.run();
			ButtonsView.run();
			e2e.run();
		});
});