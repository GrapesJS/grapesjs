define(['AssetManager/view/AssetsView', 'AssetManager/model/Assets'],
	function(AssetsView, Assets) {

		return {
			run: function() {

				describe('AssetsView', function() {

					var obj;

					before(function () {
						this.$fixtures 	= $("#fixtures");
						this.$fixture 	= $('<div class="assets-fixture"></div>');
					});

					beforeEach(function () {
						this.coll 	= new Assets([]);
						this.view = new AssetsView({
							config : {},
							collection: this.coll
						});
						obj = this.view;
						this.$fixture.empty().appendTo(this.$fixtures);
						this.$fixture.html(this.view.render().el);
					});

					afterEach(function () {
						this.view.collection.reset();
					});

					after(function () {
						this.$fixture.remove();
					});

					it('Object exists', function() {
						AssetsView.should.be.exist;
					});

					it("Collection is empty", function (){
						this.view.getAssetsEl().innerHTML.should.be.empty;
					});

					it("Add new asset", function (){
						sinon.stub(this.view, "addAsset");
						this.coll.add({src: 'test'});
						this.view.addAsset.calledOnce.should.equal(true);
					});

					it("Render new asset", function (){
						this.coll.add({src: 'test'});
						this.view.getAssetsEl().innerHTML.should.not.be.empty;
					});

					it("Render correctly new image asset", function (){
						this.coll.add({ type: 'image', src: 'test'});
						var asset = this.view.getAssetsEl().firstChild;
						asset.tagName.should.equal('DIV');
						asset.innerHTML.should.not.be.empty;
					});

					it("Clean collection from asset", function (){
						var model = this.coll.add({src: 'test'});
						this.coll.remove(model);
						this.view.getAssetsEl().innerHTML.should.be.empty;
					});

					it("Deselect works", function (){
						this.coll.add([{},{}]);
						var $asset = this.view.$el.children().first();
						$asset.attr('class', this.view.pfx + 'highlight');
						this.coll.trigger('deselectAll');
						$asset.attr('class').should.be.empty;
					});

					it("Returns not empty assets element", function (){
						obj.getAssetsEl().should.be.ok;
					});

					it("Returns not empty url input", function (){
						obj.getInputUrl().should.be.ok;
					});

					it("Add image asset from input string", function (){
						obj.getInputUrl().value = "test";
						obj.addFromStr({
							preventDefault: function(){}
						});
						var asset = obj.collection.at(0);
						asset.get('src').should.equal('test');
					});

				});

			}
		}
});