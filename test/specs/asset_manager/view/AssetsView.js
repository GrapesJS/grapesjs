var AssetsView = require('asset_manager/view/AssetsView');
var FileUploader = require('asset_manager/view/FileUploader');
var Assets = require('asset_manager/model/Assets');

module.exports = {
  run() {

    describe('AssetsView', () => {

      var obj;
      var coll;

      beforeEach(function () {
        coll = new Assets([]);
        obj = new AssetsView({
          config: {},
          collection: coll,
          globalCollection: new Assets([]),
          fu: new FileUploader({})
        });
        obj = obj;
        document.body.innerHTML = '<div id="fixtures"></div>';
        obj.render();
        document.body.querySelector('#fixtures').appendChild(obj.el);
      });

      afterEach(function () {
        obj.collection.reset();
      });

      it('Object exists', () => {
        expect(AssetsView).toExist();
      });

      it("Collection is empty", function (){
        expect(obj.getAssetsEl().innerHTML).toNotExist();
      });

      it("Add new asset", function (){
        sinon.stub(obj, "addAsset");
        coll.add({src: 'test'});
        expect(obj.addAsset.calledOnce).toEqual(true);
      });

      it("Render new asset", function (){
        coll.add({src: 'test'});
        expect(obj.getAssetsEl().innerHTML).toExist();
      });

      it("Render correctly new image asset", function (){
        coll.add({ type: 'image', src: 'test'});
        var asset = obj.getAssetsEl().firstChild;
        expect(asset.tagName).toEqual('DIV');
        expect(asset.innerHTML).toExist();
      });

      it("Clean collection from asset", function (){
        var model = coll.add({src: 'test'});
        coll.remove(model);
        expect(obj.getAssetsEl().innerHTML).toNotExist();
      });

      it("Deselect works", function (){
        coll.add([{},{}]);
        var $asset = obj.$el.children().first();
        $asset.attr('class', obj.pfx + 'highlight');
        coll.trigger('deselectAll');
        expect($asset.attr('class')).toNotExist();
      });

      it("Returns not empty assets element", () => {
        expect(obj.getAssetsEl()).toExist();
      });

      it("Returns not empty url input", () => {
        expect(obj.getAddInput()).toExist();
      });

      it("Add image asset from input string", () => {
        obj.getAddInput().value = "test";
        obj.handleSubmit({
          preventDefault() {}
        });
        var asset = obj.options.globalCollection.at(0);
        expect(asset.get('src')).toEqual('test');
      });

    });

  }
}
