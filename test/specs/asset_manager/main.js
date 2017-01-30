var modulePath = './../../../test/specs/asset_manager';

define(['StorageManager','AssetManager',
		modulePath + '/model/Asset',
		modulePath + '/model/AssetImage',
		modulePath + '/model/Assets',
		modulePath + '/view/AssetView',
		modulePath + '/view/AssetImageView',
		modulePath + '/view/AssetsView',
		modulePath + '/view/FileUploader'],
	function(StorageManager, AssetManager, Asset, AssetImage, Assets, AssetView, AssetImageView, AssetsView, FileUploader) {

		describe('Asset Manager', function() {

			describe('Main', function() {

				var obj;
				var imgObj;

				var storage;
	      var storageId = 'testStorage';
	      var storageMock = {
	        store: function(data){
	          storage = data;
	        },
	        load: function(keys){
	          return storage;
	        },
	      };

      	beforeEach(function () {
      		imgObj = {
      			src: 'path/to/image',
      			width: 101,
      			height: 102,
      		};
          obj = new AssetManager();
          obj.init();
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

				it('Remove asset', function() {
					obj.add(imgObj);
					obj.remove(imgObj.src);
					obj.getAll().length.should.equal(0);
				});

				it('Render assets', function() {
					obj.add(imgObj);
					obj.render().should.not.be.empty;
				});

				describe('With storage', function() {

					var storageManager;

					beforeEach(function () {
	      		storageManager = new StorageManager().init({
	      			autoload: 0,
	      			type: storageId
	      		})
	          obj = new AssetManager().init({
	          	stm: storageManager,
	          });
	          storageManager.add(storageId, storageMock);
	        });

	        afterEach(function () {
	          delete storageManager;
	        });

					it('Store and load data', function() {
		        obj.add(imgObj);
		        obj.store();
		        obj.remove(imgObj.src);
		        obj.load();
		        var asset = obj.get(imgObj.src);
						asset.get('width').should.equal(imgObj.width);
						asset.get('height').should.equal(imgObj.height);
						asset.get('type').should.equal('image');
		      });

				});

			});

			Asset.run();
			AssetImage.run();
			Assets.run();

			AssetView.run();
			AssetImageView.run();
			AssetsView.run();
			FileUploader.run();
		});
});
