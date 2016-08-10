define(['AssetManager'],
	function(AssetManager) {

		describe('Asset Manager', function() {

			describe('Main', function() {

				var obj;
				var imgObj;

      	beforeEach(function () {
      		imgObj = {
      			src: 'path/to/image',
      			width: 101,
      			height: 102,
      		};
          obj = new AssetManager();
        });

        afterEach(function () {
          delete obj;
        });

				it('Object exists', function() {
					obj.should.be.exist;
				});

				it('No assets inside', function() {
					obj.getAll().length.should.be.empty;
				});

				it('Add new asset', function() {
					obj.add(imgObj);
					obj.getAll().length.should.equal(1);
				});

				it('Added asset has correct data', function() {
					obj.add(imgObj);
					var asset = obj.get(imgObj.src);
					asset.get('width').should.equal(imgObj.width);
					asset.get('height').should.equal(imgObj.height);
					asset.get('type').should.equal('image');
				});

				it('Add asset with src', function() {
					obj.add(imgObj.src);
					var asset = obj.get(imgObj.src);
					asset.get('type').should.equal('image');
					asset.get('src').should.equal(imgObj.src);
				});

				it('Add asset with more src', function() {
					obj.add([imgObj.src, imgObj.src + '2']);
					obj.getAll().length.should.equal(2);
					var asset1 = obj.getAll().at(0);
					var asset2 = obj.getAll().at(1);
					asset1.get('src').should.equal(imgObj.src);
					asset2.get('src').should.equal(imgObj.src + '2');
				});

				it('Src is unique', function() {
					obj.add(imgObj);
					obj.add(imgObj);
					obj.getAll().length.should.equal(1);
				});

/*
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
*/
			});
		});
});