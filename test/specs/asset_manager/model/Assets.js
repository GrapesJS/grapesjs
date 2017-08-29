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
    });
  }
};
