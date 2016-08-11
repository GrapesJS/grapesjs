define(['AssetManager/model/Assets'],
	function(Assets) {

		return {
      run: function() {
        describe('Assets', function() {

          var obj;

          beforeEach(function () {
            obj = new Assets();
          });

          afterEach(function () {
            delete obj;
          });

          it('Object exists', function() {
            obj.should.be.exist;
          });

          it('Collection is empty', function() {
            obj.length.should.equal(0);
          });

          it("Can't insert assets without src", function() {
            obj.add({});
            obj.length.should.equal(0);
            obj.add([{},{},{}]);
            obj.length.should.equal(0);
          });

          it("Insert assets only with src", function() {
            obj.add([{},{src:'test'},{}]);
            obj.length.should.equal(1);
          });

          it('addImg creates new asset', function() {
            obj.addImg('/img/path');
            obj.length.should.equal(1);
          });

          it('addImg asset is correct', function() {
            obj.addImg('/img/path');
            var asset = obj.at(0);
            asset.get('type').should.equal('image');
            asset.get('src').should.equal('/img/path');
          });

        });
      }
    };
});