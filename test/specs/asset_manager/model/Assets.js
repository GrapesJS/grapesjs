var Assets = require('asset_manager/model/Assets');

module.exports = {
  run() {
    describe('Assets', () => {

      var obj;

      beforeEach(() => {
        obj = new Assets();
      });

      afterEach(() => {
        obj = null;
      });

      it('Object exists', () => {
        expect(obj).toExist();
      });

      it('Collection is empty', () => {
        expect(obj.length).toEqual(0);
      });

      it("Can't insert assets without src", () => {
        obj.add({});
        expect(obj.length).toEqual(0);
        obj.add([{},{},{}]);
        expect(obj.length).toEqual(0);
      });

      it("Insert assets only with src", () => {
        obj.add([{},{src:'test'},{}]);
        expect(obj.length).toEqual(1);
      });

      it('addImg creates new asset', () => {
        obj.addImg('/img/path');
        expect(obj.length).toEqual(1);
      });

      it('addImg asset is correct', () => {
        obj.addImg('/img/path');
        var asset = obj.at(0);
        expect(asset.get('type')).toEqual('image');
        expect(asset.get('src')).toEqual('/img/path');
      });

    });
  }
};
