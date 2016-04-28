var modulePath = './../../../test/specs/dom_components';

define([
				'DomComponents',
				 modulePath + '/model/Component',
				 modulePath + '/view/ComponentV',
				 modulePath + '/view/ComponentsView',
				 modulePath + '/view/ComponentTextView',
				 modulePath + '/view/ComponentImageView'
				 ],
	function(DomComponents,
					ComponentModels,
					ComponentView,
					ComponentsView,
					ComponentTextView,
					ComponentImageView
					) {

		describe('DOM Components', function() {

			describe('Main', function() {

				var obj;

				beforeEach(function () {
					obj = new DomComponents();
				});

				afterEach(function () {
					delete obj;
				});

				it('Object exists', function() {
					DomComponents.should.be.exist;
				});

				it('Wrapper exists', function() {
					obj.getWrapper().should.not.be.empty;
				});

				it('No components inside', function() {
					obj.getComponents().length.should.equal(0);
				});

				it('Add new component', function() {
					var comp = obj.addComponent({});
					obj.getComponents().length.should.equal(1);
				});

				it('Add more components at once', function() {
					var comp = obj.addComponent([{},{}]);
					obj.getComponents().length.should.equal(2);
				});

				it('Render wrapper', function() {
					obj.render().should.be.ok;
				});

				it('Add components at init', function() {
					obj = new DomComponents({
						defaults : [{}, {}, {}]
					});
					obj.getComponents().length.should.equal(3);
				});

			});

			ComponentModels.run();
			ComponentView.run();
			ComponentsView.run();
			ComponentTextView.run();
			ComponentImageView.run();

		});
});