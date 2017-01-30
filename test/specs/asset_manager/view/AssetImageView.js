define(['AssetManager/view/AssetImageView', 'AssetManager/model/AssetImage', 'AssetManager/model/Assets'],
	function(AssetImageView, AssetImage, Assets) {

		return {
			run: function() {

				describe('AssetImageView', function() {

					before(function () {
						this.$fixtures 	= $("#fixtures");
						this.$fixture 	= $('<div class="asset-fixture"></div>');
					});

					beforeEach(function () {
						var coll 	= new Assets();
						var model = coll.add({ type:'image', src: '/test' });
						this.view = new AssetImageView({
							config : {},
							model: model
						});
						this.$fixture.empty().appendTo(this.$fixtures);
						this.$fixture.html(this.view.render().el);
					});

					afterEach(function () {
						delete this.view;
					});

					after(function () {
						this.$fixture.remove();
					});

					it('Object exists', function() {
						AssetImageView.should.be.exist;
					});

					describe('Asset should be rendered correctly', function() {

							it('Has preview box', function() {
								var $asset = this.view.$el;
								$asset.find('#preview').should.have.property(0);
							});

							it('Has meta box', function() {
								var $asset = this.view.$el;
								$asset.find('#meta').should.have.property(0);
							});

							it('Has close button', function() {
								var $asset = this.view.$el;
								$asset.find('#close').should.have.property(0);
							});

					});

					it('Could be selected', function() {
						sinon.stub(this.view, 'updateTarget');
						this.view.$el.trigger('click');
						this.view.$el.attr('class').should.contain('highlight');
						this.view.updateTarget.calledOnce.should.equal(true);
					});

					it('Could be chosen', function() {
						sinon.stub(this.view, 'updateTarget');
						this.view.$el.trigger('dblclick');
						this.view.updateTarget.calledOnce.should.equal(true);
					});

					it('Could be removed', function() {
						var spy 		= sinon.spy();
						this.view.model.on("remove", spy);
						this.view.$el.find('#close').trigger('click');
						spy.called.should.equal(true);
					});

				});

			}
		};
});
