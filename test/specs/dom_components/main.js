var modulePath = './../../../test/specs/dom_components';

define([
				'DomComponents',
				 modulePath + '/model/Component'
				 ],
	function(DomComponents,
					ComponentModels
					) {

		describe('DOM Components', function() {

			describe('Main', function() {

				beforeEach(function () {
					this.obj 	= new DomComponents();
				});

				afterEach(function () {
					delete this.obj;
				});

				it('Object exists', function() {
					DomComponents.should.be.exist;
				});

				it('Wrapper exists', function() {
					this.obj.getWrapper().should.not.be.empty;
				});

				it('No components inside', function() {
					this.obj.getComponents().length.should.equal(0);
				});

				it('Render wrapper', function() {
					sinon.stub(this.obj.ComponentView, "render").returns({ el: '' });
					this.obj.render();
					this.obj.ComponentView.render.calledOnce.should.equal(true);
				});

			});

			ComponentModels.run();

		});
});