define(['AssetManager/model/AssetImage'],
	function(AssetImage) {

		return {
			run: function() {

				describe('AssetImage', function() {
					it('Object exists', function() {
						AssetImage.should.be.exist;
					});

					it('Has default values', function() {
						var obj = new AssetImage({});
						obj.get('type').should.equal("image");
						obj.get('src').should.equal("");
						obj.get('unitDim').should.equal("px");
						obj.get('height').should.equal(0);
						obj.get('width').should.equal(0);
						obj.getExtension().should.be.empty;
						obj.getFilename().should.be.empty;
					});

				});

			}
		};
});