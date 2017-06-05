var AssetImage = require('asset_manager/model/AssetImage');

module.exports = {
  run() {

    describe('AssetImage', () => {
      it('Object exists', () => {
        expect(AssetImage).toExist();
      });

      it('Has default values', () => {
        var obj = new AssetImage({});
        expect(obj.get('type')).toEqual('image');
        expect(obj.get('src')).toNotExist();
        expect(obj.get('unitDim')).toEqual('px');
        expect(obj.get('height')).toEqual(0);
        expect(obj.get('width')).toEqual(0);
        expect(obj.getExtension()).toNotExist();
        expect(obj.getFilename()).toNotExist();
      });

    });

  }
};
