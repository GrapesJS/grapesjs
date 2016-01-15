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
			});
		});
});