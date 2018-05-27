var Asset = require('asset_manager/model/Asset');

module.exports = {
  run() {
    describe('Asset', () => {
      test('Object exists', () => {
        expect(Asset).toExist();
      });

      test('Has default values', () => {
        var obj = new Asset({});
        expect(obj.get('type')).toNotExist();
        expect(obj.get('src')).toNotExist();
        expect(obj.getExtension()).toNotExist();
        expect(obj.getFilename()).toNotExist();
      });

      test('Test getFilename', () => {
        var obj = new Asset({ type: 'image', src: 'ch/eck/t.e.s.t' });
        expect(obj.getFilename()).toEqual('t.e.s.t');
        var obj = new Asset({ type: 'image', src: 'ch/eck/1234abc' });
        expect(obj.getFilename()).toEqual('1234abc');
      });

      test('Test getExtension', () => {
        var obj = new Asset({ type: 'image', src: 'ch/eck/t.e.s.t' });
        expect(obj.getExtension()).toEqual('t');
        var obj = new Asset({ type: 'image', src: 'ch/eck/1234abc.' });
        expect(obj.getExtension()).toEqual('');
      });
    });
  }
};
