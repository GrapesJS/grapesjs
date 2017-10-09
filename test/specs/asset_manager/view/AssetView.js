var AssetView = require('asset_manager/view/AssetView');
var Asset = require('asset_manager/model/Asset');
var Assets = require('asset_manager/model/Assets');

module.exports = {
  run() {

    describe('AssetView', () => {

      beforeEach(function () {
        var coll   = new Assets();
        var model = coll.add({src: 'test'});
        this.view = new AssetView({
          config : {},
          model
        });
        document.body.innerHTML = '<div id="fixtures"></div>';
        document.body.querySelector('#fixtures').appendChild(this.view.render().el);
      });

      afterEach(function () {
        this.view.remove();
      });

      it('Object exists', () => {
        expect(AssetView).toExist();
      });

      it('Has correct prefix', function() {
        expect(this.view.pfx).toEqual('');
      });

    });

  }
}
