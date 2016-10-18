define(['AssetManager/model/Asset'],
	function(Asset) {

		return {
			run: function(){

				describe('Asset', function() {
					it('Object exists', function() {
						Asset.should.be.exist;
					});

					it('Has default values', function() {
						var obj 	= new Asset({});
						obj.get('type').should.equal("");
						obj.get('src').should.equal("");
						obj.getExtension().should.be.empty;
						obj.getFilename().should.be.empty;
					});

					it('Test getFilename', function() {
						var obj 	= new Asset({ type:'image', src: 'ch/eck/t.e.s.t'});
						obj.getFilename().should.equal('t.e.s.t');
						var obj 	= new Asset({ type:'image', src: 'ch/eck/1234abc'});
						obj.getFilename().should.equal('1234abc');
					});

					it('Test getExtension', function() {
						var obj 	= new Asset({ type:'image', src: 'ch/eck/t.e.s.t'});
						obj.getExtension().should.equal('t');
						var obj 	= new Asset({ type:'image', src: 'ch/eck/1234abc.'});
						obj.getExtension().should.equal('');
					});
				});
			}
		}
});