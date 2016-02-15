define(['AssetManager/view/AssetsView', 'AssetManager/model/Assets'],
	function(AssetsView, Assets) {

		describe('Asset Manager', function() {

			describe('AssetsView', function() {

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
					this.view.$el.html().should.be.empty;
				});

				it("Add new asset", function (){
					sinon.stub(this.view, "addAsset");
					this.coll.add({});
					this.view.addAsset.calledOnce.should.equal(true);
				});

				it("Render new asset", function (){
					this.coll.add({});
					this.view.$el.html().should.not.be.empty;
				});

				it("Render correctly new asset", function (){
					this.coll.add({});
					var $asset = this.view.$el.children().first();
					$asset.prop("tagName").should.equal('DIV');
					$asset.html().should.be.empty;
				});

				it("Render correctly new image asset", function (){
					this.coll.add({ type: 'image'});
					var $asset = this.view.$el.children().first();
					$asset.prop("tagName").should.equal('DIV');
					$asset.html().should.not.be.empty;
				});

				it("Clean collection from asset", function (){
					var model = this.coll.add({});
					this.coll.remove(model);
					this.view.$el.html().should.be.empty;
				});

				it("Load no assets", function (){
					(this.view.load() === null).should.be.true;
				});

				it("Load assets", function (){
					var obj = { test: '1' };
					this.view.storagePrv = { load : function(){} };
					sinon.stub(this.view.storagePrv, "load").returns(obj);
					this.view.load().should.equal(obj);
				});

				it("Deselect works", function (){
					this.coll.add([{},{}]);
					var $asset = this.view.$el.children().first();
					$asset.attr('class', this.view.pfx + 'highlight');
					this.coll.trigger('deselectAll');
					$asset.attr('class').should.be.empty;
				});

			});
		});
});