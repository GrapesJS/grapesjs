define(['AssetManager'],
	function(AssetManager) {

		describe('Asset Manager', function() {

			describe('Main', function() {
				it('Object exists', function() {
					AssetManager.should.be.exist;
				});

				it('No assets inside', function() {
					var obj 	= new AssetManager();
					obj.getAssets().length.should.be.empty;
				});

				it('AssetsView exists and is an instance of Backbone.View', function() {
					var obj 	= new AssetManager();
					obj.am.should.be.exist;
					obj.am.should.be.an.instanceOf(Backbone.View);
				});

				it('FileUpload exists and is an instance of Backbone.View', function() {
					var obj 	= new AssetManager();
					obj.fu.should.be.exist;
					obj.fu.should.be.an.instanceOf(Backbone.View);
				});

				it('Target is assigning', function() {
					var obj 	= new AssetManager();
					var t 		= 'target';
					obj.setTarget(t);
					obj.am.collection.target.should.equal(t);
				});

				it('onSelect callback is assigning', function() {
					var obj 	= new AssetManager();
					var cb 		= function(){
						return 'callback';
					};
					obj.onSelect(cb);
					obj.am.collection.onSelect.should.equal(cb);
				});

				it('Render propagates', function() {
					var obj 	= new AssetManager(),
							jq 		= { $el: $('<div>') };
					sinon.stub(obj.am, "render").returns(jq);
					sinon.stub(obj.fu, "render").returns(jq);
					obj.render();
					obj.am.render.calledOnce.should.equal(true);
					obj.fu.render.calledOnce.should.equal(true);
					obj.rendered.should.not.be.empty;
				});

			});
		});
});