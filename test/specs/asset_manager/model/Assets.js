var Assets = require('asset_manager/model/Assets');

module.exports = {
  run: function() {
    describe('Assets', function() {

      var obj;

      beforeEach(function () {
        obj = new Assets();
      });

      afterEach(function () {
        obj = null;
      });

      it('Object exists', function() {
        expect(obj).toExist();
      });

      it('Collection is empty', function() {
        expect(obj.length).toEqual(0);
      });

      it("Can't insert assets without src", function() {
        obj.add({});
        expect(obj.length).toEqual(0);
        obj.add([{},{},{}]);
        expect(obj.length).toEqual(0);
      });

      it("Insert assets only with src", function() {
        obj.add([{},{src:'test'},{}]);
        expect(obj.length).toEqual(1);
      });

      it('addImg creates new asset', function() {
        obj.addImg('/img/path');
        expect(obj.length).toEqual(1);
      });

      it('addImg asset is correct', function() {
        obj.addImg('/img/path');
        var asset = obj.at(0);
        expect(asset.get('type')).toEqual('image');
        expect(asset.get('src')).toEqual('/img/path');
      });

    });
  }
};
